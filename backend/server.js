console.log("THIS IS MY SERVER FILE");
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: ['https://os-project-bankers-algorithm.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.send('Backend is running 🚀');
});

// Safety Algorithm
function isSafe(n, m, allocation, need, available) {
    let work = [...available];
    let finish = new Array(n).fill(false);
    let safeSequence = [];

    while (safeSequence.length < n) {
        let found = false;
        for (let i = 0; i < n; i++) {
            if (!finish[i] && need[i].every((val, j) => val <= work[j])) {
                for (let k = 0; k < m; k++) work[k] += allocation[i][k];
                finish[i] = true;
                safeSequence.push(i);
                found = true;
            }
        }
        if (!found) return { safe: false };
    }
    return { safe: true, sequence: safeSequence };
}

app.post('/api/allocate-cloud', (req, res) => {
    const { tasks, available, taskIndex, request } = req.body;

    if (!tasks || !available || taskIndex === undefined || !request) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    const n = tasks.length;
    const m = available.length;

    const allocation = tasks.map(t => t.allocation);
    const need = tasks.map(t => t.max.map((v, i) => v - t.allocation[i]));

    if (!request.every((val, i) => val <= need[taskIndex][i])) {
        return res.json({ success: false, message: "Request exceeds max demand." });
    }

    if (!request.every((val, i) => val <= available[i])) {
        return res.json({ success: false, message: "Resources unavailable (waiting)." });
    }

    let testAvailable = available.map((v, i) => v - request[i]);

    let testAllocation = JSON.parse(JSON.stringify(allocation));
    testAllocation[taskIndex] = testAllocation[taskIndex].map((v, i) => v + request[i]);

    let testNeed = JSON.parse(JSON.stringify(need));
    testNeed[taskIndex] = testNeed[taskIndex].map((v, i) => v - request[i]);

    const safetyCheck = isSafe(n, m, testAllocation, testNeed, testAvailable);

    if (safetyCheck.safe) {
        res.json({
            success: true,
            message: `Request Approved for Task T${taskIndex}`,
            safeSequence: safetyCheck.sequence
        });
    } else {
        res.json({
            success: false,
            message: "Request Denied (Deadlock risk)"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});