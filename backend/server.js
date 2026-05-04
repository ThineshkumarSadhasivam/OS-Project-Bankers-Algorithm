const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Helper function: Safety Algorithm
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
    // tasks: [{ id, allocation: [], max: [], need: [] }]
    
    const n = tasks.length;
    const m = available.length;
    const allocation = tasks.map(t => t.allocation);
    const max = tasks.map(t => t.max);
    const need = tasks.map(t => t.max.map((v, i) => v - t.allocation[i]));

    // Step 1: Check if request <= Need
    if (!request.every((val, i) => val <= need[taskIndex][i])) {
        return res.json({ success: false, message: "Error: Request exceeds Task's maximum demand limit." });
    }

    // Step 2: Check if request <= Available
    if (!request.every((val, i) => val <= available[i])) {
        return res.json({ success: false, message: "Cloud resources busy. Request queued (Waiting)." });
    }

    // Step 3: Pre-tend to allocate
    let testAvailable = available.map((v, i) => v - request[i]);
    let testAllocation = JSON.parse(JSON.stringify(allocation));
    testAllocation[taskIndex] = testAllocation[taskIndex].map((v, i) => v + request[i]);
    let testNeed = JSON.parse(JSON.stringify(need));
    testNeed[taskIndex] = testNeed[taskIndex].map((v, i) => v - request[i]);

    const safetyCheck = isSafe(n, m, testAllocation, testNeed, testAvailable);

    if (safetyCheck.safe) {
        res.json({ 
            success: true, 
            message: `Request Approved. Resources allocated to Task T${taskIndex}.`,
            safeSequence: safetyCheck.sequence 
        });
    } else {
        res.json({ 
            success: false, 
            message: "Request Denied: Allocation would risk a System Deadlock.",
            logs: ["Safety algorithm failed to find a completion sequence."]
        });
    }
});
app.listen(5000, () => console.log('Cloud Resource Manager running on port 5000'));