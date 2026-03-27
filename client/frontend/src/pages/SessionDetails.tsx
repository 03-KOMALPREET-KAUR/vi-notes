import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PasteEvent {
  at: number;
  charsAdded: number;
}

interface Session {
  _id: string;
  text: string;
  wordCount: number;
  charCount: number;
  avgPause: number;
  pasteCount: number;
  pasteEvents: PasteEvent[];
  duration: number;
  createdAt: string;
}

const SessionDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/sessions/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setSession(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching session details:", err);
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

const calculateScore = () => {
  if (!session || session.charCount === 0) return 100;

  const totalPastedChars = session.pasteEvents?.reduce((sum, p) => sum + p.charsAdded, 0) || 0;
  const pasteRatio = totalPastedChars / session.charCount;
  
  let score = 100 * (1 - pasteRatio);
  return Math.max(0, Math.round(score));
};

  const generatePDF = () => {
    if (!session) return;

    const doc = new jsPDF();
    const date = new Date(session.createdAt).toLocaleString();
    const finalScore = calculateScore();

    doc.setFontSize(20);
    doc.text("Forensic Writing Report", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${date}`, 14, 35);

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Authenticity Score', `${finalScore}%`],
        ['Word Count', session.wordCount],
        ['Character Count', session.charCount],
        ['Average Pause', `${session.avgPause}ms`],
        ['Paste Events', session.pasteCount],
        ['Duration', `${(session.duration / 60000).toFixed(2)} minutes`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [124, 58, 237] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Writing Transcript", 14, finalY + 15);
    
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(session.text || "No text recorded.", 180);
    doc.text(splitText, 14, finalY + 25);

    doc.save(`Forensic_Report_${session._id.substring(0, 8)}.pdf`);
  };

  if (loading) return <div style={d.page}>Loading forensic breakdown...</div>;
  if (!session) return <div style={d.page}>Session not found.</div>;

  const score = calculateScore();
  const totalPasted = session.pasteEvents?.reduce((sum, p) => sum + p.charsAdded, 0) || 0;
  const pastePercentage = session.charCount > 0 ? Math.round((totalPasted / session.charCount) * 100) : 0;
  
  const statusColor = score > 80 ? '#4ade80' : score > 50 ? '#fbbf24' : '#f87171';

  return (
    <div style={d.page}>
      <div style={d.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate('/sessions')} style={d.backBtn}>
            ← Back to Archive
          </button>
          <button onClick={generatePDF} style={d.downloadBtn}>
            Download PDF Report
          </button>
        </div>

        <header style={d.header}>
          <h1 style={sh.title}>Session Analysis</h1>
          <p style={sh.subtitle}>Captured on {new Date(session.createdAt).toLocaleString()}</p>
        </header>

        <div style={d.grid}>
          <div style={d.card}>
            <div style={d.label}>AUTHENTICITY SCORE</div>
            <div style={{ ...d.score, color: statusColor }}>{score}%</div>
            
            <div style={{ marginBottom: '20px', color: '#888', fontSize: '13px' }}>
  {totalPasted > 0 
    ? `${pastePercentage}% of text was pasted.` 
    : '100% of text was typed manually.'}
</div>

            <div style={d.statsList}>
              <div style={d.statItem}><span>Words</span><span>{session.wordCount}</span></div>
              <div style={d.statItem}><span>Characters</span><span>{session.charCount}</span></div>
              <div style={d.statItem}><span>Average Pause</span><span>{session.avgPause}ms</span></div>
              <div style={d.statItem}>
                <span>Pastes</span>
                <span style={{ color: session.pasteCount > 0 ? '#f87171' : '#4ade80' }}>{session.pasteCount}</span>
              </div>
            </div>
          </div>

          <div style={{ ...d.card, flex: 2 }}>
            <div style={d.label}>WRITING TRANSCRIPT</div>
            <div style={d.transcript}>{session.text || "No text content available."}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const d: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: '40px 20px' },
  container: { maxWidth: '1100px', margin: '0 auto' },
  backBtn: { background: 'transparent', border: 'none', color: '#7c3aed', cursor: 'pointer', fontWeight: 'bold' },
  downloadBtn: { background: '#111', border: '1px solid #7c3aed', color: '#7c3aed', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  header: { margin: '30px 0' },
  grid: { display: 'flex', gap: '25px' },
  card: { background: '#111', border: '1px solid #222', padding: '30px', borderRadius: '12px' },
  label: { fontSize: '10px', color: '#555', letterSpacing: '2px', marginBottom: '20px' },
  score: { fontSize: '48px', fontWeight: 'bold', marginBottom: '5px' },
  statsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  statItem: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a', paddingBottom: '8px', color: '#888', fontSize: '13px' },
  transcript: { whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#ccc', fontSize: '16px' }
};

const sh = {
  title: { fontSize: '28px', margin: 0 },
  subtitle: { color: '#666', fontSize: '14px', margin: '5px 0 0 0' }
};

export default SessionDetails;