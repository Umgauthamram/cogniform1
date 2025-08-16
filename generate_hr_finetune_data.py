import json

# Define your semantic groups, just like in your project plan
positive_collaboration = ["Teamwork was great", "I loved the collaboration", "We worked well together", "Communication was seamless", "The team was very supportive"]
negative_deadlines = ["Deadlines were too aggressive", "We need more time", "The schedule was unrealistic", "The project timeline was too tight", "We were rushed"]
positive_tools = ["The new software was a big help", "I liked the tools we used", "Our tech stack is very effective"]
negative_documentation = ["The project docs were hard to find", "We need better documentation", "Onboarding was tough due to lack of docs"]

# Structure the data for fine-tuning
fine_tuning_records = [
    {
        "input": f"Summarize these similar feedbacks and give a category name: {json.dumps(positive_collaboration)}",
        "output": json.dumps({"category": "Team Collaboration", "summary": "Employees reported that team collaboration and communication were excellent."})
    },
    {
        "input": f"Summarize these similar feedbacks and give a category name: {json.dumps(negative_deadlines)}",
        "output": json.dumps({"category": "Project Deadlines", "summary": "Multiple employees felt that the project deadlines were too aggressive and unrealistic."})
    },
    {
        "input": f"Summarize these similar feedbacks and give a category name: {json.dumps(positive_tools)}",
        "output": json.dumps({"category": "Tooling & Technology", "summary": "The technology and tools used on the project were effective and helpful."})
    },
    {
        "input": f"Summarize these similar feedbacks and give a category name: {json.dumps(negative_documentation)}",
        "output": json.dumps({"category": "Documentation", "summary": "There is a need to improve the quality and accessibility of project documentation."})
    }
    # Add many more examples for different themes!
]

# Write to a JSONL file
with open('finetune_data.jsonl', 'w') as f:
    for record in fine_tuning_records:
        f.write(json.dumps(record) + '\n')

print("finetune_data.jsonl has been created successfully.")