import React, { useState } from 'react';
import axios from 'axios';

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
    // 1. Validation Check: Ensure Alloc <= Max
    for (let i = 0; i < tasks.length; i++) {
      for (let j = 0; j < 3; j++) {
        if (tasks[i].allocation[j] > tasks[i].max[j]) {
          alert(`Error in T${i}: Allocation cannot be greater than Max Demand.`);
          return;
        }
      }
    }

    try {
      const res = await axios.post('http://localhost:5000/api/calculate', {
        allocation: tasks.map(t => t.allocation),
        max: tasks.map(t => t.max),
        available: available
      });
      setResult(res.data);
    } catch (err) {
      alert("Make sure your Backend Server is running!");
    }
  };

  return (
    <div style={styles.appContainer}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Cloud<span style={{color: '#60a5fa'}}>Control</span></h2>
        <p style={{fontSize: '0.8rem', color: '#475569', marginBottom: '2rem'}}>Datacenter Resource Manager</p>
        <div style={styles.navItemActive}>🛡️ Deadlock Avoidance</div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1>Admission Control Dashboard</h1>
          <p>Preventing system crashes by ensuring every task has a "Safe Path" to its maximum resource needs.</p>
        </header>

        {/* Available Resources (The Data Center Capacity) */}
        <section style={styles.statsRow}>
          {['CPU (Cores)', 'RAM (GB)', 'Storage (TB)'].map((label, i) => (
            <div key={i} style={styles.statCard}>
              <span style={styles.statLabel}>{label}</span>
              <div style={styles.statValueContainer}>
                <input type="number" value={available[i]} onChange={(e) => {
                  const next = [...available];
                  next[i] = parseInt(e.target.value) || 0;
                  setAvailable(next);
                }} style={styles.statInput} />
                <span style={{color: '#60a5fa'}}>Free</span>
              </div>
            </div>
          ))}
        </section>

        <div style={styles.workspace}>
          {/* Table Area */}
          <div style={styles.tablePanel}>
            <h3 style={{marginBottom: '1rem'}}>Active Cloud Tasks</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th align="left">ID</th>
                  <th align="left">VM NAME</th>
                  <th>ALLOCATED</th>
                  <th>LIMIT (MAX)</th>
                  <th>REMAINING NEED</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={{color: '#60a5fa', fontWeight: 'bold'}}>T{i}</td>
                    <td>{task.name}</td>
                    <td align="center">
                      {task.allocation.map((val, j) => (
                        <input key={j} type="number" value={val} onChange={(e) => updateTask(i, 'allocation', j, e.target.value)} style={styles.cellInput} />
                      ))}
                    </td>
                    <td align="center">
                      {task.max.map((val, j) => (
                        <input key={j} type="number" value={val} onChange={(e) => updateTask(i, 'max', j, e.target.value)} style={styles.cellInput} />
                      ))}
                    </td>
                    <td align="center" style={{fontWeight: 'bold', color: '#94a3b8'}}>
                      {task.max.map((v, idx) => v - task.allocation[idx]).join(' / ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* THE BUTTON IS HERE NOW */}
            <button onClick={validateSafety} style={styles.bigButton}>
              VALIDATE CLOUD SAFETY STATE
            </button>
          </div>

          {/* Results Area */}
          <div style={styles.resultPanel}>
            <h3>Analysis Output</h3>
            {result ? (
              <div style={{...styles.resBox, borderTop: `5px solid ${result.success ? '#10b981' : '#ef4444'}`}}>
                <h2 style={{color: result.success ? '#10b981' : '#ef4444'}}>
                  {result.success ? "✅ SAFE STATE" : "❌ UNSAFE STATE"}
                </h2>
                <p style={{fontSize: '0.9rem', color: '#94a3b8'}}>{result.message}</p>
                {result.success && (
                  <div style={{marginTop: '1rem'}}>
                    <strong>Safe Sequence:</strong>
                    <div style={styles.seqContainer}>
                      {result.safeSequence.map(s => <span key={s} style={styles.badge}>T{s}</span>)}
                    </div>
                  </div>
                )}
                <div style={styles.logBox}>
                  {result.logs.map((l, i) => <div key={i} style={{fontSize: '0.8rem', padding: '2px 0'}}>• {l}</div>)}
                </div>
              </div>
            ) : <p style={{color: '#475569', textAlign: 'center', marginTop: '3rem'}}>Click the blue button to analyze.</p>}
          </div>
        </div>
      </main>
    </div>
  );
};

// Styles to ensure it fits full screen
const styles = {
  appContainer: { display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#020617', color: '#f8fafc', overflow: 'hidden' },
  sidebar: { width: '250px', backgroundColor: '#0f172a', padding: '2rem', borderRight: '1px solid #1e293b' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', margin: 0 },
  navItemActive: { padding: '1rem', backgroundColor: '#1e293b', color: '#60a5fa', borderRadius: '8px', marginTop: '2rem' },
  navItem: { padding: '1rem', color: '#475569', cursor: 'pointer' },
  mainContent: { flex: 1, padding: '2rem', overflowY: 'auto' },
  header: { marginBottom: '2rem' },
  statsRow: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  statCard: { flex: 1, backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '1.5rem', borderRadius: '12px' },
  statLabel: { fontSize: '0.7rem', color: '#475569', fontWeight: 'bold' },
  statValueContainer: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' },
  statInput: { background: 'none', border: 'none', color: 'white', fontSize: '1.8rem', fontWeight: 'bold', width: '80px', outline: 'none' },
  workspace: { display: 'flex', gap: '2rem' },
  tablePanel: { flex: 2, backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '2rem' },
  resultPanel: { flex: 1, backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '2rem' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' },
  tr: { borderBottom: '1px solid #1e293b' },
  cellInput: { width: '40px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', textAlign: 'center', margin: '10px 2px', padding: '5px', borderRadius: '4px' },
  bigButton: { width: '100%', padding: '1.2rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' },
  resBox: { backgroundColor: '#020617', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem' },
  badge: { backgroundColor: '#2563eb', padding: '4px 10px', borderRadius: '4px', margin: '0 4px', fontWeight: 'bold' },
  seqContainer: { marginTop: '10px', display: 'flex', flexWrap: 'wrap' },
  logBox: { marginTop: '20px', maxHeight: '150px', overflowY: 'auto', color: '#475569', borderTop: '1px solid #1e293b', paddingTop: '10px' }
};

export default App;