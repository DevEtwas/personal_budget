const express = require('express');
const app = express();
const PORT = 3000;

const envelopes = [{ title: 'grocery', budget: 100 }, { title: 'gas', budget: 70 }, { title: 'utility', budget: 30 }];

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Function to validate data type
function validateEnvelope(envelope) {
    return typeof envelope.title === "string" && typeof envelope.budget === "number" && envelope.budget >= 0;
}

/* Routes and HTTP requests */
// GET requests

app.get('/', (req, res) => {
    res.send("Hello, World!");
});

app.get('/envelopes', (req, res) => {
    res.json(envelopes);
});

app.get('/envelopes/:id', (req, res) => {
    const id = Number(req.params.id);
    const envelope = envelopes[id];
    if (envelope) {
        res.json(envelope);
    } else {
        res.status(404).json({ error: 'Envelope not found' });
    }
});

// POST requests
app.post('/envelopes', (req, res) => {
    const reqQuery = req.query;
    reqQuery.budget = Number(reqQuery.budget);
    const title = reqQuery.title;
    const budget = reqQuery.budget;

    if (validateEnvelope({ title, budget })) {
        envelopes.push({ title, budget });
        res.status(201).json(envelopes);
    } else {
        res.status(400).json({ error: "Bad request. Invalid title or budget." });
    }
});

app.post('/envelopes/transfer/:from/:to', (req, res) => {
    const from = req.params.from;
    const to = req.params.to;
    const fromEnvelope = envelopes.find(envelope => envelope.title === from);
    const toEnvelope = envelopes.find(envelope => envelope.title === to);

    if (!fromEnvelope || !toEnvelope) {
        return res.status(404).json({ error: 'Envelope not found' });
    }
    
    let fromBudget = fromEnvelope.budget;

    fromEnvelope.budget -= fromBudget;
    toEnvelope.budget += fromBudget;

    res.json(envelopes);
});

// PUT requests
app.put('/envelopes/:id/', (req, res) => {
    const id = Number(req.params.id);
    const budget = Number(req.params.budget);

    if (typeof id === "number" && typeof budget === "number" && budget >= 0) {
        const envelope = envelopes[id];
        if (envelope) {
            envelope.budget = budget;
            res.json(envelope);
        } else {
            res.status(404).json({ error: 'Envelope not found' });
        }
    } else {
        res.status(400).json({ error: "Bad request. Invalid id or budget" });
    }
});

// DELETE requests
app.delete('/envelopes/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!isNaN(id) && id >= 0 && id < envelopes.length) {
        envelopes.splice(id, 1);
        res.json(envelopes);
    } else {
        res.status(404).json({ error: 'Envelope not found' });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});