import React from 'react';

interface ForensicProps {
  wpm: number;
  pasteCount: number;
  avgPause: number;
  isPasting: boolean;
}

const ForensicPanel: React.FC<ForensicProps> = ({ wpm, pasteCount, avgPause, isPasting }) => {
  // Simple calculation for the live score
  const score = Math.max(0, 100 - (pasteCount * 25) - (wpm > 120 ? 10 : 0));
  
  const getStatus = () => {
    if (score > 80) return { label: 'AUTHENTIC', color: '#4ade80' };
    if (score > 50) return { label: 'UNCERTAIN', color: '#fbbf24' };
    return { label: 'SUSPICIOUS', color: '#f87171' };
  };

  const status = getStatus();

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#111',
      borderLeft: '2px solid #333',
      width: '250px',
      height: '100%',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ color: '#888', fontSize: '12px', letterSpacing: '2px' }}>FORENSIC ANALYSIS</h3>
      
      <div style={{ marginTop: '30px' }}>
        <div style={{ fontSize: '10px', color: '#555' }}>PROBABILITY SCORE</div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: status.color }}>
          {score}%
        </div>
        <div style={{ fontSize: '12px', color: status.color, marginTop: '-5px' }}>
          {status.label}
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <Stat label="WPM" value={wpm} />
        <Stat label="PASTES" value={pasteCount} color={pasteCount > 0 ? '#f87171' : '#555'} />
        <Stat label="AVG PAUSE" value={`${avgPause}ms`} />
      </div>

      {isPasting && (
        <div style={{ 
          marginTop: '20px', 
          color: '#f87171', 
          fontSize: '10px', 
          animation: 'pulse 1s infinite' 
        }}>
          ⚠ EXTERNAL DATA INJECTION DETECTED
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value, color = '#ccc' }: { label: string, value: string | number, color?: string }) => (
  <div>
    <div style={{ fontSize: '9px', color: '#555' }}>{label}</div>
    <div style={{ fontSize: '16px', color }}>{value}</div>
  </div>
);

export default ForensicPanel;