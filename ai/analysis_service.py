import os
import json
import re
from flask import Flask, request, jsonify
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
from sklearn.cluster import KMeans
import numpy as np
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

credentials = {
    "url": "https://us-south.ml.cloud.ibm.com",
    "apikey": os.environ.get("IBM_API_KEY")
}
project_id = os.environ.get("WATSONX_PROJECT_ID")

if not credentials["apikey"] or not project_id:
    raise ValueError("IBM_API_KEY or WATSONX_PROJECT_ID is not set in environment variables")

embedder = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# summarization_model_id = "ibm/granite-13b-instruct-v2"
# summarization_model_id = "3c837c7f-bdaf-4450-92de-61c32aa12ba8" 
model_id = "ibm/granite-3-3-8b-instruct"
gen_params = {
    GenParams.DECODING_METHOD: "greedy",
    GenParams.MAX_NEW_TOKENS: 150,
}
model = ModelInference(
    model_id=model_id,
    params=gen_params,
    credentials=credentials,
    project_id=project_id
)

def call_generative_model(prompt):
    """A reusable function to call the AI model and handle errors."""
    try:
        generated_response = model.generate(prompt=prompt)
        text_response = generated_response['results'][0]['generated_text'].strip()
        match = re.search(r"```json\s*(\{.*?\})\s*```|(\{.*?\})", text_response, re.DOTALL)
        if match:
            json_str = match.group(1) if match.group(1) else match.group(2)
            return json.loads(json_str)
        else:
            print(f"Warning: Model did not produce valid JSON: {text_response}")
            return {"error": "Failed to parse model output", "raw_output": text_response}
            
    except Exception as e:
        print(f"Error calling summarization model: {e}")
        return {"error": f"API call failed: {e}"}

@app.route('/analyze', methods=['POST'])
def analyze_feedback():
    data = request.json
    form_responses = data.get('responses', [])
    questions = data.get('questions', [])

    analysis_results = {}

    for question in questions:
        question_id = question['id']
        answers = [
            resp['answer']
            for r in form_responses
            for resp in r['answers']
            if resp['questionId'] == question_id
        ]

        if len(answers) < 2: 
            continue

        print(f"Generating embeddings for {len(answers)} answers...")
        embeddings = embedder.encode(answers)
        embedding_vectors = np.array(embeddings)

        num_clusters = min(5, len(answers))
        kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10).fit(embedding_vectors)
        labels = kmeans.labels_

        question_analysis = []
        for i in range(num_clusters):
            cluster_indices = np.where(labels == i)[0]
            cluster_responses = [answers[j] for j in cluster_indices]

            if not cluster_responses:
                continue
            

            prompt_summarize = f"""### INSTRUCTION
You are an expert HR analyst. Analyze the list of employee feedback comments.
1. Summarize the core sentiment into a single, concise sentence.
2. Provide a short, descriptive category name.
Return your answer ONLY as a valid JSON object with keys "category" and "summary".

### FEEDBACK TO ANALYZE
{json.dumps(cluster_responses)}

### OUTPUT (JSON ONLY)"""
            
            print(f"Cluster {i}: Summarizing and categorizing...")
            summary_data = call_generative_model(prompt_summarize)
            if "error" in summary_data:
                summary_data = {"category": "Uncategorized", "summary": summary_data.get("raw_output", "Analysis failed.")}

            # 2. Analyze Sentiment
            prompt_sentiment = f"""### INSTRUCTION
Analyze the sentiment of the following summary. Classify it as "Positive", "Negative", or "Neutral".
Return your answer ONLY as a valid JSON object with the key "sentiment".

### SUMMARY TO ANALYZE
"{summary_data.get('summary', '')}"

### OUTPUT (JSON ONLY)"""

            print(f"Cluster {i}: Analyzing sentiment...")
            sentiment_data = call_generative_model(prompt_sentiment)
            sentiment = sentiment_data.get("sentiment", "Neutral")
            summary_data['sentiment'] = sentiment # Add sentiment to our result

            # 3. Suggest Improvement (Conditional)
            if sentiment == "Negative":
                prompt_improvement = f"""### INSTRUCTION
The following feedback summary is negative. Your task is to provide a concrete, actionable suggestion for a manager to address this issue.
Return your answer ONLY as a valid JSON object with the key "improvement".

### NEGATIVE SUMMARY
"{summary_data.get('summary', '')}"

### OUTPUT (JSON ONLY)"""

                print(f"Cluster {i}: Generating improvement suggestion...")
                improvement_data = call_generative_model(prompt_improvement)
                summary_data['improvement'] = improvement_data.get("improvement", "No suggestion available.")

            summary_data['responseCount'] = len(cluster_responses)
            summary_data['sampleResponses'] = cluster_responses[:3]
            question_analysis.append(summary_data)

        analysis_results[question_id] = {
            "questionText": question.get("text", "Unknown Question"),
            "results": question_analysis
        }

    return jsonify(analysis_results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
