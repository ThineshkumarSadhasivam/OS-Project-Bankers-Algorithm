import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://os-project-bankers-algorithm.onrender.com/api/allocate-cloud";

const App = () => {
  const [numTasks, setNumTasks] = useState(0);
  const [numResources, setNumResources] = useState(0);

  const [tasks, setTasks] = useState([]);
  const [available, setAvailable] = useState([]);
  const [request, setRequest] = useState([]);
  const [taskIndex, setTaskIndex] = useState(0);

  const [result, setResult] = useState(null);

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

  const updateTask = (i, type, j, value) => {
    const newTasks = [...tasks];
    newTasks[i][type][j] = parseInt(value) || 0;
    setTasks(newTasks);
  };

  const validateSafety = async () => {
    for (let i = 0; i < tasks.length; i++) {
      for (let j = 0; j < numResources; j++) {
        if (tasks[i].allocation[j] > tasks[i].max[j]) {
          alert(`Error in T${i}: Allocation > Max`);
          return;
        }
      }
    }

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
    <div className="container">
      <h1 className="title">Banker's Algorithm Simulator</h1>

      {/* Setup */}
      <div className="card">
        <h3>Setup</h3>
        <div className="flex-row">
          <input
            type="number"
            placeholder="Tasks"
            onChange={(e) => setNumTasks(parseInt(e.target.value) || 0)}
          />

          <input
            type="number"
            placeholder="Resources"
            onChange={(e) => setNumResources(parseInt(e.target.value) || 0)}
          />

          <button onClick={initSystem}>Initialize</button>
        </div>
      </div>

      {/* Available */}
      {available.length > 0 && (
        <div className="card">
          <h3>Available Resources</h3>
          <div className="flex-row">
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
        </div>
      )}

      {/* Table */}
      {tasks.length > 0 && (
        <div className="card">
          <h3>System State</h3>
          <div className="table-wrapper">
            <table>
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
                          onChange={(e) =>
                            updateTask(i, "allocation", j, e.target.value)
                          }
                        />
                      ))}
                    </td>

                    <td>
                      {task.max.map((val, j) => (
                        <input
                          key={j}
                          type="number"
                          value={val}
                          onChange={(e) =>
                            updateTask(i, "max", j, e.target.value)
                          }
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
          </div>
        </div>
      )}

      {/* Request */}
      {tasks.length > 0 && (
        <div className="card">
          <h3>Request Resources</h3>

          <select onChange={(e) => setTaskIndex(parseInt(e.target.value))}>
            {tasks.map((_, i) => (
              <option key={i} value={i}>
                T{i}
              </option>
            ))}
          </select>

          <div className="flex-row">
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

          <button onClick={validateSafety}>Validate Safety</button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="card">
          <h2 className={result.success ? "success" : "error"}>
            {result.success ? "SAFE STATE" : "UNSAFE STATE"}
          </h2>

          <p>{result.message}</p>

          {result.success && (
            <div className="sequence">
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