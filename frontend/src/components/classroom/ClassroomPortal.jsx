import React, { useState, useEffect } from 'react';
import { School, Award, CheckCircle, AlertTriangle, Users, Play, Plus, BookOpen, Layers } from 'lucide-react';

export default function ClassroomPortal() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [rubrics, setRubrics] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(false);

  // New Submission Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newFilename, setNewFilename] = useState('');
  const [newEssayText, setNewEssayText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // 1. Fetch Classrooms from Spring Boot
  const fetchClassrooms = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/classrooms');
      const data = await res.json();
      setClassrooms(data);
      if (data.length > 0) {
        setSelectedClassroom(data[0]);
        fetchAssignments(data[0].id);
      }
    } catch (e) {
      console.warn("Spring Boot backend offline, waiting for server...");
    }
  };

  // 2. Fetch Assignments
  const fetchAssignments = async (classroomId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/classrooms/${classroomId}/assignments`);
      const data = await res.json();
      setAssignments(data);
      if (data.length > 0) {
        selectAssignment(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Select Assignment & load Rubrics and Submissions
  const selectAssignment = async (assignmentId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/classrooms/assignments/${assignmentId}`);
      const data = await res.json();
      setSelectedAssignment(data.assignment);
      setRubrics(data.rubrics || []);

      const subRes = await fetch(`http://localhost:8080/api/classrooms/assignments/${assignmentId}/submissions`);
      const subData = await subRes.json();
      setSubmissions(subData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  // 4. Trigger Batch Evaluation & Auto-Grading in Spring Boot
  const runBatchEvaluation = async () => {
    if (!selectedAssignment) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/classrooms/assignments/${selectedAssignment.id}/evaluate`, {
        method: 'POST'
      });
      const data = await res.json();
      setEvaluationData(data);
      // Refresh submissions to reflect newly calculated marks
      selectAssignment(selectedAssignment.id);
    } catch (e) {
      alert("Evaluation failed. Make sure Spring Boot (:8080) and Python (:8000) are both running!");
    } finally {
      setLoading(false);
    }
  };

  // 5. Submit New Student Assignment
  const handleAddSubmission = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    try {
      await fetch(`http://localhost:8080/api/classrooms/assignments/${selectedAssignment.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: newStudentName,
          studentEmail: newStudentEmail,
          filename: newFilename,
          rawText: newEssayText
        })
      });
      setShowAddModal(false);
      setNewStudentName('');
      setNewStudentEmail('');
      setNewFilename('');
      setNewEssayText('');
      selectAssignment(selectedAssignment.id);
    } catch (err) {
      alert("Submission failed!");
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '24px auto', padding: '0 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Classroom & Automated Rubric Gateway</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Spring Boot Enterprise Backend managing student cohorts, collusion matrices, and automatic mark deductions.
          </p>
        </div>

        {selectedAssignment && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-secondary"
            >
              <Plus size={16} /> Submit New Student Work
            </button>

            <button
              onClick={runBatchEvaluation}
              disabled={loading}
              className="btn btn-primary"
            >
              <Play size={16} />
              {loading ? 'Evaluating Cohort...' : 'Execute Automated Rubric Grading'}
            </button>
          </div>
        )}
      </div>

      {/* Classroom Info & Rubrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 24 }}>
        
        {/* Left: Classroom & Assignment Selector */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <School size={20} color="#38BDF8" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>
              {selectedClassroom ? selectedClassroom.name : 'Classrooms'}
            </h3>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Teacher: <strong>{selectedClassroom?.teacherName}</strong> | Code: <code>{selectedClassroom?.joinCode}</code>
          </div>

          <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Classroom Assignments:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {assignments.map(a => (
              <button
                key={a.id}
                onClick={() => selectAssignment(a.id)}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: selectedAssignment?.id === a.id ? '#1E293B' : 'transparent',
                  border: `1px solid ${selectedAssignment?.id === a.id ? '#3B82F6' : 'var(--border-subtle)'}`,
                  color: selectedAssignment?.id === a.id ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Due: {a.dueDate} | Max: {a.maxMarks} marks</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Rubric Rules Configurator */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} color="#F59E0B" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Automated Mark Deduction Rubric Rules</h3>
            </div>
            <span className="badge badge-pro">Spring Boot Engine Active</span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            The backend automatically executes these deduction thresholds against each student's peer similarity score:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {rubrics.map(r => (
              <div
                key={r.id}
                style={{
                  background: r.isZeroFail ? 'rgba(239, 68, 68, 0.1)' : (r.markPenalty > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
                  border: `1px solid ${r.isZeroFail ? '#EF4444' : (r.markPenalty > 0 ? '#F59E0B' : '#10B981')}`,
                  borderRadius: 8,
                  padding: 12
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: r.isZeroFail ? '#F87171' : (r.markPenalty > 0 ? '#FBBF24' : '#34D399') }}>
                  {r.minSimilarity}% - {r.maxSimilarity}% Similarity
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, margin: '4px 0' }}>
                  {r.isZeroFail ? '🚨 FAIL (0 Marks)' : (r.markPenalty > 0 ? `-${r.markPenalty} Marks Penalty` : '✅ Full Marks (0 Deduction)')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {r.description}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Submissions & Gradebook Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Student Submissions & Gradebook</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {submissions.length} submission(s) enrolled in this assignment.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="matrix-table" style={{ textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0F172A', color: '#94A3B8' }}>
                <th style={{ textAlign: 'left' }}>Student Name</th>
                <th style={{ textAlign: 'left' }}>File</th>
                <th>Peer Similarity (%)</th>
                <th>Deduction / Reason</th>
                <th>Final Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => {
                let badgeColor = '#10B981';
                if (s.similarityScore >= 30) badgeColor = '#EF4444';
                else if (s.similarityScore >= 15) badgeColor = '#F59E0B';

                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.studentName}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.filename || 'essay.txt'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: badgeColor }}>
                      {s.similarityScore ? `${s.similarityScore}%` : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {s.penaltyReason || 'Pending automated cohort evaluation'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 15, color: s.finalMarks === 0 ? '#EF4444' : '#38BDF8' }}>
                      {s.finalMarks !== null ? `${s.finalMarks} / 100` : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge" style={{
                        background: s.status === 'EVALUATED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: s.status === 'EVALUATED' ? '#34D399' : '#F87171'
                      }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Submission Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="card" style={{ width: 600, maxWidth: '90%' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Submit Student Assignment</h3>
            <form onSubmit={handleAddSubmission}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Student Name:</label>
                <input
                  className="form-input"
                  required
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Filename:</label>
                <input
                  className="form-input"
                  required
                  value={newFilename}
                  onChange={e => setNewFilename(e.target.value)}
                  placeholder="e.g. Distributed_Lab_Report.pdf"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Document Text:</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  required
                  value={newEssayText}
                  onChange={e => setNewEssayText(e.target.value)}
                  placeholder="Paste student paper content here..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

