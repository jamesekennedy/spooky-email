import { ContactRow, GeneratedEmail } from "../types";

// specific parser that doesn't rely on external libs for this demo
export const parseCSV = (content: string): { headers: string[], data: ContactRow[] } => {
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return { headers: [], data: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data: ContactRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV split - handling quotes strictly would require a state machine parser
    // For this prototype, we assume standard CSVs without internal commas in quotes
    // or we use a slightly smarter split.
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"|"$/g, ''));
    
    if (values.length === headers.length) {
      const row: ContactRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }

  return { headers, data };
};

export const downloadCSV = (originalData: ContactRow[], generatedResults: GeneratedEmail[][], filename: string) => {
  if (originalData.length === 0) return;

  const originalHeaders = Object.keys(originalData[0]);
  
  // Find max sequence length to determine columns
  const maxEmails = Math.max(...generatedResults.map(r => r.length));
  
  const generatedHeaders: string[] = [];
  for (let i = 0; i < maxEmails; i++) {
    generatedHeaders.push(`Subject ${i + 1}`);
    generatedHeaders.push(`Email ${i + 1}`);
  }

  const allHeaders = [...originalHeaders, ...generatedHeaders];
  
  const rows = originalData.map((row, index) => {
    const result = generatedResults[index] || [];
    const rowValues = originalHeaders.map(h => `"${(row[h] || '').replace(/"/g, '""')}"`);
    
    for (let i = 0; i < maxEmails; i++) {
      const email = result[i];
      if (email) {
        rowValues.push(`"${email.subject.replace(/"/g, '""')}"`);
        rowValues.push(`"${email.body.replace(/"/g, '""')}"`);
      } else {
        rowValues.push(`""`);
        rowValues.push(`""`);
      }
    }
    return rowValues.join(',');
  });

  const csvContent = [allHeaders.join(','), ...rows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
