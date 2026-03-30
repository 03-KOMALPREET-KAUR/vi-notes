import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ThemeToggle from '../components/ThemeToggle';
import {
  calculateAuthenticityScore,
  getPastePercentage,
  getScoreColor,
  getScoreVerdict,
  getScoreBadgeStyle,
} from '../utils/scoring';

interface PasteEvent {
  at: number
  charsAdded: number
}

interface Session {
  _id: string
  text: string
  wordCount: number
  charCount: number
  avgPause: number
  pasteCount: number
  pasteEvents: PasteEvent[]
  duration: number
  createdAt: string
}

const SessionDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [ringAnimated, setRingAnimated] = useState(false);

  
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/api/sessions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setSession(data);
        setLoading(false);
        setTimeout(() => setRingAnimated(true), 120);
      })
      .catch(() => setLoading(false));
  }, [id, API]);

  const generatePDF = () => {
    if (!session) return;
    const doc = new jsPDF();
    const score = calculateAuthenticityScore(session);
    const date = new Date(session.createdAt).toLocaleString();

    doc.setFontSize(20);
    doc.text('Forensic Writing Report', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${date}`, 14, 35);

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Authenticity Score', `${score}%`],
        ['Word Count',         session.wordCount],
        ['Character Count',    session.charCount],
        ['Average Pause',      `${session.avgPause}ms`],
        ['Paste Events',       session.pasteCount],
        ['Duration',           `${(session.duration / 60000).toFixed(2)} min`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [124, 58, 237] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Writing Transcript', 14, finalY + 15);
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(session.text || 'No text.', 180), 14, finalY + 25);
    doc.save(`Forensic_Report_${session._id.substring(0, 8)}.pdf`);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-secondary)', fontFamily: 'Georgia, serif', fontSize: 15, fontStyle: 'italic' }}>
        Analysing session…
      </p>
    </div>
  );

  if (!session) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-secondary)', fontFamily: 'Georgia, serif', fontSize: 15 }}>Session not found.</p>
    </div>
  );

  const score        = calculateAuthenticityScore(session);
  const pastePercent = getPastePercentage(session);
  const scoreColor   = getScoreColor(score);
  const verdict      = getScoreVerdict(score);
  const badge        = getScoreBadgeStyle(score);

  const circumference = 314;
  const strokeOffset  = ringAnimated
    ? circumference - (circumference * score / 100)
    : circumference;

  const duration = session.duration
    ? `${Math.floor(session.duration / 60000)}m ${Math.round((session.duration % 60000) / 1000)}s`
    : '—';

  return (
    <div style={d.page}>
      <div style={d.container}>

        {/* Top bar */}
        <div style={d.topBar}>
          <button onClick={() => navigate('/sessions')} style={d.backBtn}>
            ← Back to Archive
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
            <button onClick={generatePDF} style={d.downloadBtn}>↓ Download PDF</button>
          </div>
        </div>

        {/* Page header */}
        <div style={d.pageHeader}>
          <div style={d.eyebrow}>SESSION ANALYSIS</div>
          <h1 style={d.title}>Writing Forensics</h1>
          <p style={d.subtitle}>
            {new Date(session.createdAt).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}{' '}
            at{' '}
            {new Date(session.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>

        {/* Grid */}
        <div style={d.grid}>

          {/* ── Score card ── */}
          <div style={d.scoreCard}>
            <div style={d.cardLabel}>AUTHENTICITY SCORE</div>

            {/* Ring */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 18px' }}>
              <div style={{ position: 'relative', width: 140, height: 140 }}>
                <svg width="140" height="140" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke="var(--border)" strokeWidth="7" />
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={scoreColor} strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Georgia, serif', color: 'var(--text-primary)', lineHeight: 1 }}>
                    {score}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>%</span>
                </div>
              </div>
            </div>

            {/* Verdict badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.8px',
                padding: '5px 14px', borderRadius: 20,
                fontFamily: '-apple-system, sans-serif',
                background: badge.bg, color: badge.text,
                border: `1px solid ${badge.border}`,
              }}>
                {verdict}
              </span>
            </div>

            {/* Paste note — clamped, never > 100% */}
            <p style={d.pasteNote}>
              {pastePercent > 0
                ? `${pastePercent}% of content was pasted`
                : 'All content typed manually'}
            </p>

            {/* Stats */}
            <div style={d.statsList}>
              {[
                { label: 'Words',      value: session.wordCount.toLocaleString() },
                { label: 'Characters', value: session.charCount.toLocaleString() },
                { label: 'Avg Pause',  value: `${session.avgPause}ms` },
                { label: 'Duration',   value: duration },
                {
                  label: 'Pastes',
                  value: session.pasteCount,
                  color: session.pasteCount > 0 ? '#f87171' : '#4ade80',
                },
              ].map(({ label, value, color }) => (
                <div key={label} style={d.statRow}>
                  <span style={d.statLabel}>{label}</span>
                  <span style={{ ...d.statValue, ...(color ? { color } : {}) }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Transcript card ── */}
          <div style={d.transcriptCard}>
            <div style={d.cardLabel}>WRITING TRANSCRIPT</div>
            <div style={d.transcriptBody}>
              {session.text || 'No text content available.'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const d: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-page)',
    color: 'var(--text-primary)',
    transition: 'background 0.2s, color 0.2s',
    paddingBottom: 60,
  },
  container: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '36px 32px 0',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 13,
    fontFamily: 'inherit',
    padding: 0,
  },
  downloadBtn: {
    background: 'var(--bg-card)',
    border: '1px solid var(--accent)',
    color: 'var(--accent)',
    padding: '8px 18px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'inherit',
    fontSize: 12,
  },
  pageHeader: { marginBottom: 32 },
  eyebrow: {
    fontSize: 9,
    letterSpacing: '2.5px',
    color: 'var(--text-muted)',
    fontFamily: '-apple-system, sans-serif',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: '-0.8px',
    color: 'var(--text-primary)',
    margin: '0 0 6px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontFamily: '-apple-system, sans-serif',
    margin: 0,
  },
  grid: {
    display: 'flex',
    gap: 20,
    alignItems: 'flex-start',
  },
  scoreCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '28px 24px',
    width: 280,
    flexShrink: 0,
  },
  transcriptCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '28px 32px',
    flex: 1,
    minHeight: 480,
  },
  cardLabel: {
    fontSize: 9,
    letterSpacing: '2px',
    color: 'var(--text-muted)',
    fontFamily: '-apple-system, sans-serif',
    marginBottom: 16,
  },
  pasteNote: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginBottom: 22,
    fontFamily: '-apple-system, sans-serif',
    fontStyle: 'italic',
  },
  statsList: { display: 'flex', flexDirection: 'column' },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
  },
  statLabel: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    fontFamily: '-apple-system, sans-serif',
  },
  statValue: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontFamily: '-apple-system, sans-serif',
  },
  transcriptBody: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.95,
    color: 'var(--textarea-text)',
    fontSize: 15,
    fontFamily: 'Georgia, serif',
  },
};

export default SessionDetails;