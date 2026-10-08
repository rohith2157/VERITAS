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
    <div style={{ maxWidth: 'var(--page-max-width)', margin: '40px auto', padding: '0 24px' }}>
      
      {/* Header in Dala Style */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 36,
        flexWrap: 'wrap',
        gap: 24,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: 24
      }}>
        <div>
          <span className="eyebrow-accent">
            Academic Orchestration
          </span>
          <h1 className="heading-md" style={{ marginBottom: 8 }}>
            Classroom & Automated Rubric Gateway
          </h1>
          <p className="body-light" style={{ maxWidth: 580 }}>
            Spring Boot enterprise microservice managing student cohorts, collusion matrices, and deterministic mark deductions.
          </p>
        </div>

        {selectedAssignment && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-pill-secondary"
            >
              <Plus size={15} />
              <span>Submit Work</span>
            </button>

            <button
              onClick={runBatchEvaluation}
              disabled={loading}
              className="btn-pill-primary"
            >
              <Play size={15} />
              <span>{loading ? 'Evaluating Cohort...' : 'Execute Rubric Auto-Grading'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Classroom Info & Rubrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
        
        {/* Left: Classroom & Assignment Selector */}
        <div className="dala-surface">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-electric-iris)', textTransform: 'uppercase' }}>
              Enrolled Course
            </span>
          </div>

          <h3 className="heading-sm" style={{ marginBottom: 6 }}>
            {selectedClassroom ? selectedClassroom.name : 'Classroom Not Loaded'}
          </h3>

          <div style={{ fontSize: 13, color: 'var(--color-ash-gray)', marginBottom: 24 }}>
            Instructor: <strong style={{ color: '#ffffff' }}>{selectedClassroom?.teacherName}</strong> • Code: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-saffron-spark)' }}>{selectedClassroom?.joinCode}</code>
          </div>

          <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', color: 'var(--color-silver-mist)', marginBottom: 12 }}>
            Assignments in Roster:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {assignments.map(a => (
              <button
                key={a.id}
                onClick={() => selectAssignment(a.id)}
                style={{
                  textAlign: 'left',
                  padding: '14px 18px',
                  borderRadius: 16,
                  background: selectedAssignment?.id === a.id ? 'rgba(128, 82, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${selectedAssignment?.id === a.id ? 'var(--color-electric-iris)' : 'rgba(255, 255, 255, 0.06)'}`,
                  color: selectedAssignment?.id === a.id ? '#ffffff' : 'var(--color-silver-mist)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 400, fontSize: 15, color: '#ffffff' }}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                  Due: {a.dueDate} • Max: {a.maxMarks} marks
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Rubric Rules Configurator */}
        <div className="dala-surface">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span className="eyebrow-accent" style={{ marginBottom: 4 }}>
                Deterministic Deduction
              </span>
              <h3 className="heading-sm" style={{ margin: 0 }}>
                Automated Rubric Rules
              </h3>
            </div>
            <span className="badge-tag badge-pro">Spring Boot Engine Active</span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--color-silver-mist)', marginBottom: 20 }}>
            Executed deterministically against student peer similarity vectors during cohort batch processing:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {rubrics.map(r => (
              <div
                key={r.id}
                style={{
                  background: r.isZeroFail ? 'rgba(239, 68, 68, 0.06)' : (r.markPenalty > 0 ? 'rgba(255, 184, 41, 0.06)' : 'rgba(21, 132, 110, 0.06)'),
                  border: `1px solid ${r.isZeroFail ? 'rgba(239, 68, 68, 0.35)' : (r.markPenalty > 0 ? 'rgba(255, 184, 41, 0.35)' : 'rgba(21, 132, 110, 0.35)')}`,
                  borderRadius: 16,
                  padding: 16
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: r.isZeroFail ? '#f87171' : (r.markPenalty > 0 ? 'var(--color-saffron-spark)' : '#34d399') }}>
                  {r.minSimilarity}% – {r.maxSimilarity}% Similarity
                </div>
                <div style={{ fontSize: 15, fontWeight: 400, color: '#ffffff', margin: '6px 0' }}>
                  {r.isZeroFail ? '🚨 FAIL (0 Marks)' : (r.markPenalty > 0 ? `-${r.markPenalty} Marks Penalty` : '✅ Full Marks (No Deduction)')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-ash-gray)', lineHeight: 1.4 }}>
                  {r.description}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Submissions & Gradebook Table */}
      <div className="dala-surface" style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <span className="eyebrow-accent" style={{ marginBottom: 4 }}>Live Cohort Roster</span>
            <h3 className="heading-sm" style={{ margin: 0 }}>Student Submissions & Gradebook</h3>
            <p style={{ fontSize: 13, color: 'var(--color-silver-mist)', marginTop: 4 }}>
              {submissions.length} submission(s) enrolled in this active assignment.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="matrix-table" style={{ textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', background: 'var(--input-bg)', color: 'var(--color-bone-white)' }}>Student Name</th>
                <th style={{ textAlign: 'left', background: 'var(--input-bg)', color: 'var(--color-silver-mist)' }}>File</th>
                <th style={{ background: 'var(--input-bg)', color: 'var(--color-silver-mist)' }}>Peer Similarity</th>
                <th style={{ background: 'var(--input-bg)', color: 'var(--color-silver-mist)' }}>Deduction / Rule</th>
                <th style={{ background: 'var(--input-bg)', color: 'var(--color-bone-white)' }}>Final Grade</th>
                <th style={{ background: 'var(--input-bg)', color: 'var(--color-silver-mist)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => {
                let badgeColor = '#34d399';
                if (s.similarityScore >= 30) badgeColor = '#f87171';
                else if (s.similarityScore >= 15) badgeColor = 'var(--color-saffron-spark)';

                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 400, color: 'var(--color-bone-white)' }}>{s.studentName}</td>
                    <td style={{ color: 'var(--color-ash-gray)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{s.filename || 'essay.txt'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: badgeColor }}>
                      {s.similarityScore ? `${s.similarityScore}%` : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--color-silver-mist)' }}>
                      {s.penaltyReason || 'Pending automated cohort evaluation'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 400, fontSize: 16, color: s.finalMarks === 0 ? '#f87171' : 'var(--color-bone-white)' }}>
                      {s.finalMarks !== null ? `${s.finalMarks} / 100` : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge-tag" style={{
                        background: s.status === 'EVALUATED' ? 'rgba(21, 132, 110, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: s.status === 'EVALUATED' ? '#34d399' : '#f87171',
                        border: `1px solid ${s.status === 'EVALUATED' ? 'rgba(21, 132, 110, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
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

      {/* Add Submission Modal in Dala Dark Velvet */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: 20
        }}>
          <div className="dala-surface" style={{ width: 620, maxWidth: '100%', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <span className="eyebrow-accent" style={{ marginBottom: 4 }}>New Submission</span>
            <h3 className="heading-sm" style={{ marginBottom: 20 }}>Submit Student Assignment</h3>
            <form onSubmit={handleAddSubmission}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ash-gray)', display: 'block', marginBottom: 6 }}>
                  Student Full Name:
                </label>
                <input
                  className="form-input"
                  required
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ash-gray)', display: 'block', marginBottom: 6 }}>
                  File Reference:
                </label>
                <input
                  className="form-input"
                  required
                  value={newFilename}
                  onChange={e => setNewFilename(e.target.value)}
                  placeholder="e.g. Distributed_Lab_Report.pdf"
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ash-gray)', display: 'block', marginBottom: 6 }}>
                  Paper / Essay Content:
                </label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  required
                  value={newEssayText}
                  onChange={e => setNewEssayText(e.target.value)}
                  placeholder="Paste student paper content here..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pill-primary"
                >
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
