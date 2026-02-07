import { RegistrationData } from '../types';

const API_URL = 'https://script.google.com/macros/s/AKfycbw-wPMfqc63MOdPCsnYZRJBWxEyXbqE_j93uv28Rw4-Td6-W80kcntQn5geRA2TAEhxrw/exec';

// ID generator helper (still useful for optimistic UI or if server doesn't generate one)
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const saveRegistration = async (data: RegistrationData): Promise<void> => {
  const payload = {
    action: 'create',
    ...data,
    id: data.id || generateId()
  };

  try {
    // We use no-cors mode as requested/required for GAS POST requests
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error saving registration:", error);
    throw error;
  }
};

export const getRegistrations = async (): Promise<RegistrationData[]> => {
  try {
    // Add timestamp to prevent caching issues with GAS
    const response = await fetch(`${API_URL}?t=${Date.now()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const result = await response.json();
    
    // Support different response structures (array or object with data property)
    const data = Array.isArray(result) ? result : (result.data || []);
    
    return data;
  } catch (error) {
    console.warn("Warning: Could not fetch registrations. This might be due to CORS permissions on the Google Script.", error);
    return [];
  }
};

export const deleteRegistration = async (id: string): Promise<void> => {
  await fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ action: 'delete', id }),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const clearRegistrations = async (): Promise<void> => {
  await fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ action: 'clear' }),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const exportToCSV = (data: RegistrationData[]): void => {
  if (data.length === 0) return;

  const headers = [
    "ID", "Timestamp", "Team Name", "Game", 
    "Leader Name", "Leader Phone", "Leader Email",
    "Player 1", "Player 2", "Player 3", "Player 4",
    "Discord", "In-Game ID", "Payment", "Trx ID"
  ];

  // Helper to escape CSV fields correctly (handle quotes and commas)
  const escapeCsv = (str: string | undefined) => {
      if (!str) return '';
      const stringValue = String(str);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
  }

  const rows = data.map(r => [
    r.id, r.timestamp, escapeCsv(r.teamName), r.gameName,
    escapeCsv(r.leaderName), escapeCsv(r.leaderPhone), escapeCsv(r.leaderEmail),
    escapeCsv(r.player1), escapeCsv(r.player2), escapeCsv(r.player3), escapeCsv(r.player4),
    escapeCsv(r.discordUsername), escapeCsv(r.ingameId), r.paymentMethod, escapeCsv(r.transactionId)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tournament_registrations_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyForGoogleSheets = async (data: RegistrationData[]): Promise<boolean> => {
  if (data.length === 0) return false;

  const headers = [
    "ID", "Timestamp", "Team Name", "Game", 
    "Leader Name", "Leader Phone", "Leader Email",
    "Player 1", "Player 2", "Player 3", "Player 4",
    "Discord", "In-Game ID", "Payment", "Trx ID"
  ];

  // Helper to escape for TSV (remove tabs and newlines from content to prevent breaking cells)
  const clean = (str: string | undefined) => {
      if (!str) return '';
      return String(str).replace(/\t/g, ' ').replace(/\n/g, ' ').trim();
  }

  const rows = data.map(r => [
    r.id, r.timestamp, clean(r.teamName), r.gameName,
    clean(r.leaderName), clean(r.leaderPhone), clean(r.leaderEmail),
    clean(r.player1), clean(r.player2), clean(r.player3), clean(r.player4),
    clean(r.discordUsername), clean(r.ingameId), r.paymentMethod, clean(r.transactionId)
  ]);

  // Join with Tabs (\t) for columns and Newlines (\n) for rows
  const tsvContent = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n');

  try {
    await navigator.clipboard.writeText(tsvContent);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};