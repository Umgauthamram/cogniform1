const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
});

const FormSchema = new mongoose.Schema({
    title: { type: String, required: true },
    creatorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, 
    questions: [QuestionSchema],
    createdAt: { type: Date, default: Date.now },
});

const Form = mongoose.model('Form', FormSchema);

module.exports = Form;
