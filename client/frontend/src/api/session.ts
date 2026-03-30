export const saveSession = async (data: {
  text: string;
  wordCount: number;
  charCount: number;
  duration: number;
  keystrokeTimings: number[];
  avgPause: number;
  pasteEvents: { at: number; charsAdded: number }[];
  pasteCount: number;
  startTime: Date;
  endTime: Date;
}, token: string) => {
  
  const API = import.meta.env.VITE_API_URL;

  const res = await fetch(`${API}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Ensure token is passed here
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    // This helper helps you see the actual error message from the backend
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to save session');
  }

  return res.json();
};