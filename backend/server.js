require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Form = require('./models/Form');
const Response = require('./models/Response');
const auth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully."))
  .catch(err => console.error("MongoDB connection error:", err));

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        const payload = { user: { id: user.id, name: user.name } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });

        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error during signup" });
    }
});
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, name: user.name } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});
app.post('/api/forms/create', auth, async (req, res) => {
    try {
        const { title, questions } = req.body;
        const newForm = new Form({ title, questions, creatorId: req.user.id });
        await newForm.save();
        res.status(201).json(newForm);
    } catch (error) {
        res.status(500).json({ message: "Error creating form" });
    }
});
app.get('/api/forms', auth, async (req, res) => {
    try {
        const forms = await Form.find({ creatorId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(forms);
    } catch (error) {
        res.status(500).json({ message: "Error fetching forms" });
    }
});
app.delete('/api/forms/:id', auth, async (req, res) => {
    try {
        const form = await Form.findOne({ _id: req.params.id, creatorId: req.user.id });
        if (!form) {
            return res.status(404).json({ message: 'Form not found or user not authorized' });
        }
        
        await form.deleteOne();
        await Response.deleteMany({ formId: req.params.id });

        res.status(200).json({ message: 'Form deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: "Error deleting form" });
    }
});

app.get('/api/forms/:id', async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ message: "Form not found" });
        res.status(200).json(form);
    } catch (error) {
        res.status(500).json({ message: "Error fetching form" });
    }
});

app.post('/api/responses/submit/:formId', async (req, res) => {
    try {
        const { answers } = req.body;
        const newResponse = new Response({ formId: req.params.formId, answers });
        await newResponse.save();
        res.status(201).json({ message: "Response submitted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error submitting response" });
    }
});

app.get('/api/analyze/:formId', auth, async (req, res) => {
    try {
        const form = await Form.findOne({ _id: req.params.formId, creatorId: req.user.id });
        if (!form) return res.status(404).json({ message: "Form not found or user not authorized" });

        const responses = await Response.find({ formId: req.params.formId });
        if (responses.length < 2) {
            return res.status(400).json({ message: "At least 2 responses are needed to analyze." });
        }

        const dataForAI = {
            questions: form.questions.map(q => ({ id: q._id.toString(), text: q.questionText })),
            responses: responses.map(r => ({
                employeeId: r._id.toString(),
                answers: r.answers.map(a => ({ questionId: a.questionId.toString(), answer: a.answerText })),
            })),
        };
        
        const PYTHON_API_URL = 'http://localhost:5001/analyze';
        const analysisResponse = await axios.post(PYTHON_API_URL, dataForAI);

        res.status(200).json(analysisResponse.data);
    } catch (error) {
        res.status(500).json({ message: "An error occurred during analysis." });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Node.js backend listening on port ${PORT}`);
});
