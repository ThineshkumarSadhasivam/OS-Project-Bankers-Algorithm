import React, { useState } from 'react';
import axios from 'axios';

const API_URL = "https://os-project-bankers-algorithm.onrender.com/api/allocate-cloud";

const App = () => {
  const [tasks, setTasks] = useState([
    { name: "Web Server VM", allocation: [0, 1, 0], max: [7, 5, 3] },
    { name: "Database Instance", allocation: [2, 0, 0], max: [3, 2, 2] },
    { name: "ML Training Job", allocation: [3, 0, 2], max: [9, 0, 2] },
    { name: "Analytics Worker", allocation: [2, 1, 1], max: [2, 2, 2] },
    { name: "Backup Service", allocation: [0, 0, 2], max: [4, 3, 3] }
  ]);

  const [available, setAvailable] = useState([3, 3, 2]);
  const [result, setResult] = useState(null);

  const updateTask = (index, type, resIndex, value) => {
    const newVal = parseInt(value) || 0;
    const newTasks = [...tasks];
    newTasks[index][type][resIndex] = newVal;
    setTasks(newTasks);
  };

  const validateSafety = async () => {
    // Validation: Allocation <= Max
    for (let i = 0; i < tasks.length; i++) {
      for (let j = 0; j < 3; j++) {
        if (tasks[i].allocation[j] > tasks[i].max[j]) {
          alert(`Error in T${i}: Allocation cannot exceed Max.`);
          return;
        }
      }
    }

    try {
      const res = await axios.post(API_URL, {
        tasks: tasks.map(t => ({
          allocation: t.allocation,
          max: t.max
        })),
        available: available,
        taskIndex: 0,           // you can improve later
        request: [1, 0, 1]      // demo request (can be dynamic later)
      });

      setResult(res.data);

    } catch (err) {
      console.error(err);
      alert("Backend connection failed!");
    }
  };

  return (
    <div style={styles.appContainer}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>
          Cloud<span style={{ color: '#60a5fa' }}>Control</span>
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '2rem' }}>
          Datacenter Resource Manager
        </p>
        <div style={styles.navItemActive}>🛡️ Deadlock Avoidance</div>
      </aside>

      {/* Main */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1>Admission Control Dashboard</h1>
          <p>Ensuring safe resource allocation using Banker's Algorithm</p>
        </header>

        {/* Available */}
        <section style={styles.statsRow}>
          {['CPU', 'RAM', 'Storage'].map((label, i) => (
            <div key={i} style={styles.statCard}>
              <span style={styles.statLabel}>{label}</span>
              <input
                type="number"
                value={available[i]}
                onChange={(e) => {
                  const next = [...available];
                  next[i] = parseInt(e.target.value) || 0;
                  setAvailable(next);
                }}
                style={styles.statInput}
              />
            </div>
          ))}
        </section>

        <div style={styles.workspace}>
          {/* Table */}
          <div style={styles.tablePanel}>
            <h3>Active Tasks</h3>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>ALLOC</th>
                  <th>MAX</th>
                  <th>NEED</th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task, i) => (
                  <tr key={i}>
                    <td>T{i}</td>
                    <td>{task.name}</td>

                    <td>
                      {task.allocation.map((val, j) => (
                        <input
                          key={j}
                          value={val}
                          type="number"
                          onChange={(e) =>
                            updateTask(i, 'allocation', j, e.target.value)
                          }
                          style={styles.cellInput}
                        />
                      ))}
                    </td>

                    <td>
                      {task.max.map((val, j) => (
                        <input
                          key={j}
                          value={val}
                          type="number"
                          onChange={(e) =>
                            updateTask(i, 'max', j, e.target.value)
                          }
                          style={styles.cellInput}
                        />
                      ))}
                    </td>

                    <td>
                      {task.max.map((v, idx) => v - task.allocation[idx]).join(" / ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={validateSafety} style={styles.bigButton}>
              VALIDATE SAFETY
            </button>
          </div>

          {/* Result */}
          <div style={styles.resultPanel}>
            <h3>Result</h3>

            {result ? (
              <div style={styles.resBox}>
                <h2 style={{ color: result.success ? 'green' : 'red' }}>
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
            ) : (
              <p>Click button to analyze</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  appContainer: { display: 'flex', height: '100vh', background: '#020617', color: 'white' },
  sidebar: { width: '250px', padding: '2rem', background: '#0f172a' },
  logo: { fontSize: '1.5rem' },
  navItemActive: { marginTop: '2rem' },
  mainContent: { flex: 1, padding: '2rem' },
  header: { marginBottom: '2rem' },
  statsRow: { display: 'flex', gap: '1rem' },
  statCard: { background: '#0f172a', padding: '1rem' },
  statLabel: { fontSize: '0.7rem' },
  statInput: { width: '60px' },
  workspace: { display: 'flex', gap: '2rem' },
  tablePanel: { flex: 2 },
  resultPanel: { flex: 1 },
  table: { width: '100%' },
  cellInput: { width: '40px' },
  bigButton: { marginTop: '1rem' },
  resBox: { marginTop: '1rem' }
};

export default App;