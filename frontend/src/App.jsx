import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://os-project-bankers-algorithm.onrender.com/api/allocate-cloud";

const App = () => {
  const [numTasks, setNumTasks] = useState(0);
  const [numResources, setNumResources] = useState(0);

  const [tasks, setTasks] = useState([]);
  const [available, setAvailable] = useState([]);
  const [request, setRequest] = useState([]);
  const [taskIndex, setTaskIndex] = useState(0);

  const [result, setResult] = useState(null);

  // 🔹 Initialize system
  const initSystem = () => {
    const newTasks = Array.from({ length: numTasks }, (_, i) => ({
      name: `T${i}`,
      allocation: Array(numResources).fill(0),
      max: Array(numResources).fill(0),
    }));

    setTasks(newTasks);
    setAvailable(Array(numResources).fill(0));
    setRequest(Array(numResources).fill(0));
    setResult(null);
  };

  // 🔹 Update task values
  const updateTask = (i, type, j, value) => {
    const newTasks = [...tasks];
    newTasks[i][type][j] = parseInt(value) || 0;
    setTasks(newTasks);
  };

  // 🔹 Validate and call backend
  const validateSafety = async () => {
    // Allocation <= Max
    for (let i = 0; i < tasks.length; i++) {
      for (let j = 0; j < numResources; j++) {
        if (tasks[i].allocation[j] > tasks[i].max[j]) {
          alert(`Error in T${i}: Allocation > Max`);
          return;
        }
      }
    }

    // Request validation
    for (let j = 0; j < numResources; j++) {
      const need = tasks[taskIndex].max[j] - tasks[taskIndex].allocation[j];

      if (request[j] > need) {
        alert("Request exceeds need!");
        return;
      }

      if (request[j] > available[j]) {
        alert("Not enough available resources!");
        return;
      }
    }

    try {
      const res = await axios.post(API_URL, {
        tasks: tasks.map(t => ({
          allocation: t.allocation,
          max: t.max
        })),
        available,
        taskIndex,
        request
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Backend connection failed!");
    }
  };

  return (
    <div style={{ padding: "2rem", background: "#020617", minHeight: "100vh", color: "white" }}>
      
      <h1>Banker's Algorithm Simulator</h1>

      {/* 🔹 Setup */}
      <div style={{ marginBottom: "2rem" }}>
        <input
          type="number"
          placeholder="Number of Tasks"
          onChange={(e) => setNumTasks(parseInt(e.target.value) || 0)}
        />

        <input
          type="number"
          placeholder="Number of Resources"
          onChange={(e) => setNumResources(parseInt(e.target.value) || 0)}
        />

        <button onClick={initSystem}>Initialize</button>
      </div>

      {/* 🔹 Available */}
      {available.length > 0 && (
        <div>
          <h3>Available Resources</h3>
          {available.map((val, i) => (
            <input
              key={i}
              type="number"
              value={val}
              onChange={(e) => {
                const next = [...available];
                next[i] = parseInt(e.target.value) || 0;
                setAvailable(next);
              }}
            />
          ))}
        </div>
      )}

      {/* 🔹 Table */}
      {tasks.length > 0 && (
        <table border="1" cellPadding="10" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Allocation</th>
              <th>Max</th>
              <th>Need</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task, i) => (
              <tr key={i}>
                <td>T{i}</td>

                <td>
                  {task.allocation.map((val, j) => (
                    <input
                      key={j}
                      type="number"
                      value={val}
                      onChange={(e) => updateTask(i, "allocation", j, e.target.value)}
                    />
                  ))}
                </td>

                <td>
                  {task.max.map((val, j) => (
                    <input
                      key={j}
                      type="number"
                      value={val}
                      onChange={(e) => updateTask(i, "max", j, e.target.value)}
                    />
                  ))}
                </td>

                <td>
                  {task.max.map((v, j) => v - task.allocation[j]).join(" / ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🔹 Request Section */}
      {tasks.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Request Resources</h3>

          <select onChange={(e) => setTaskIndex(parseInt(e.target.value))}>
            {tasks.map((_, i) => (
              <option key={i} value={i}>T{i}</option>
            ))}
          </select>

          {request.map((val, i) => (
            <input
              key={i}
              type="number"
              value={val}
              onChange={(e) => {
                const next = [...request];
                next[i] = parseInt(e.target.value) || 0;
                setRequest(next);
              }}
            />
          ))}
        </div>
      )}

      {/* 🔹 Button */}
      {tasks.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <button onClick={validateSafety}>Validate Safety</button>
        </div>
      )}

      {/* 🔹 Result */}
      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ color: result.success ? "green" : "red" }}>
            {result.success ? "SAFE STATE" : "UNSAFE STATE"}
          </h2>

          <p>{result.message}</p>

          {result.success && (
            <div>
              <strong>Sequence:</strong>
              {result.safeSequence.map((s) => (
                <span key={s}> T{s} </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;