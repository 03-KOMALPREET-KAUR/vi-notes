import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { calculateAuthenticityScore, getScoreColor, getScoreBadgeStyle } from '../utils/scoring';

interface PasteEvent {
  at: number;
  charsAdded: number;
}

interface Session {
  _id: string;
  text?: string;
  createdAt: string;
  wordCount: number;
  charCount: number;
  avgPause: number;
  pasteCount: number;
  pasteEvents?: PasteEvent[];
}

export default function SessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Use Environment Variable for API
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API}/api/sessions/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setSessions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, API]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Permanently delete this forensic record?')) return;
    try {
      const res = await fetch(`${API}/api/sessions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSessions(prev => prev.filter(s => s._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Permanently wipe ALL forensic history. Proceed?')) return;
    try {
      const res = await fetch(`${API}/api/sessions/clear-all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSessions([]);
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-secondary)', fontFamily: 'Georgia, serif', fontSize: 15, fontStyle: 'italic' }}>
        Loading archive…
      </p>
    </div>
  );

  return (
    <div style={sh.page}>
      <header style={sh.header}>
        <div>
          <div style={sh.eyebrow}>FORENSIC RECORD</div>
          <h2 style={sh.title}>Session Archive</h2>
          <p style={sh.subtitle}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} captured
          </p>
        </div>
        <div style={sh.headerRight}>
          <ThemeToggle />
          {sessions.length > 0 && (
            <button onClick={handleClearAll} style={sh.clearBtn}>Clear All</button>
          )}
          <button onClick={() => navigate('/')} style={sh.editorBtn}>← Editor</button>
        </div>
      </header>

      {sessions.length === 0 ? (
        <div style={sh.emptyState}>
          <div style={sh.emptyIcon}>◎</div>
          <p style={sh.emptyTitle}>No sessions yet</p>
          <p style={sh.emptySubtitle}>Start writing to begin forensic monitoring.</p>
          <button onClick={() => navigate('/')} style={sh.emptyBtn}>Start a session</button>
        </div>
      ) : (
        <div style={sh.grid}>
          {sessions.map(s => {
            const score = calculateAuthenticityScore(s);
            const scoreColor = getScoreColor(score);
            const badgeStyle = getScoreBadgeStyle(score);

            return (
              <div
                key={s._id}
                style={{ ...sh.card, borderLeftColor: scoreColor }}
                onClick={() => navigate(`/sessions/${s._id}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = scoreColor;
                  e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.borderLeftColor = scoreColor;
                }}
              >
                <div style={sh.cardTop}>
                  <div style={sh.badgeRow}>
                    <span style={{ 
                      ...sh.badge, 
                      background: badgeStyle.bg, 
                      color: badgeStyle.text, 
                      borderColor: badgeStyle.border 
                    }}>
                      {score}% HUMAN
                    </span>
                    <span style={sh.badge}>{s.wordCount} WORDS</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={sh.date}>
                      {new Date(s.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                    <button
                      style={sh.delBtn}
                      onClick={e => handleDelete(s._id, e)}
                      title="Delete"
                    >×</button>
                  </div>
                </div>

                <p style={sh.preview}>
                  {s.text
                    ? s.text.substring(0, 130) + (s.text.length > 130 ? '…' : '')
                    : 'No text content available.'}
                </p>

                <div style={sh.cardFooter}>
                  VIEW FULL ANALYSIS →
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


const sh: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-page)',
    color: 'var(--text-primary)',
    padding: '52px 40px 60px',
    maxWidth: 920,
    margin: '0 auto',
    transition: 'background 0.2s, color 0.2s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 44,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: '2.5px',
    color: 'var(--text-muted)',
    fontFamily: '-apple-system, sans-serif',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: 34,
    fontWeight: 700,
    letterSpacing: '-1px',
    color: 'var(--text-primary)',
    margin: '0 0 5px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontFamily: '-apple-system, sans-serif',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 2,
  },
  editorBtn: {
    background: '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 12,
    fontFamily: 'inherit',
    letterSpacing: '0.3px',
  },
  clearBtn: {
    background: 'transparent',
    color: 'var(--error-text)',
    border: '1px solid var(--error-border)',
    padding: '10px 18px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 12,
    fontFamily: 'inherit',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderLeft: '3px solid',
    borderRadius: 12,
    padding: '20px 24px',
    cursor: 'pointer',
    transition: 'background 0.15s, border-color 0.15s',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    display: 'flex',
    gap: 7,
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    border: '1px solid var(--border)',
    padding: '4px 10px',
    borderRadius: 6,
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px',
    fontFamily: '-apple-system, sans-serif',
    background: 'transparent',
  } as React.CSSProperties,
  date: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontFamily: '-apple-system, sans-serif',
    letterSpacing: '0.2px',
  },
  delBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 20,
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0 2px',
    fontFamily: 'inherit',
    transition: 'color 0.15s',
  },
  preview: {
    fontFamily: 'Georgia, serif',
    fontSize: 14,
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    margin: '0 0 16px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,
  cardFooter: {
    borderTop: '1px solid var(--border)',
    paddingTop: 12,
    fontSize: 10,
    color: 'var(--accent)',
    fontWeight: 700,
    letterSpacing: '0.8px',
    fontFamily: '-apple-system, sans-serif',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 36,
    color: 'var(--text-muted)',
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    fontFamily: '-apple-system, sans-serif',
    margin: 0,
  },
  emptyBtn: {
    marginTop: 16,
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    border: 'none',
    borderRadius: 8,
    padding: '10px 24px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};