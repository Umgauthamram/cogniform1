const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answerText: { type: String, required: true },
});

const ResponseSchema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    answers: [AnswerSchema],
    submittedAt: { type: Date, default: Date.now },
});

const Response = mongoose.model('Response', ResponseSchema);

module.exports = Response;
