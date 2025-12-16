import { Participant } from '../types';
import { read, utils } from 'xlsx';

export const parseCSV = (content: string): Participant[] => {
  const lines = content.split(/\r\n|\n/);
  const result: Participant[] = [];
  
  // Simple heuristic: Is the first line a header?
  // If it contains "name" or "id", we skip it.
  const firstLine = lines[0]?.toLowerCase() || '';
  let startIndex = 0;
  if (firstLine.includes('name') || firstLine.includes('姓名')) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(/,|，/); // Handle English and Chinese commas
    const name = parts[0]?.trim();
    const id = parts[1]?.trim() || `auto-${Date.now()}-${i}`;
    const department = parts[2]?.trim();

    if (name) {
      result.push({
        id: parts[1] ? id : `${name}-${Math.random().toString(36).substr(2, 9)}`, // Generate ID if not provided
        name,
        department
      });
    }
  }
  return result;
};

export const parseExcel = async (file: File): Promise<Participant[]> => {
  const data = await file.arrayBuffer();
  const workbook = read(data);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to array of arrays to handle headers flexibly
  const jsonData = utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  const result: Participant[] = [];
  let startIndex = 0;
  
  // Default column indices
  let nameCol = 0;
  let idCol = 1;
  let deptCol = 2;

  // Heuristic: Scan first 5 rows to find header
  for(let i = 0; i < Math.min(jsonData.length, 5); i++) {
     const row = jsonData[i].map(c => String(c).toLowerCase().trim());
     // Look for Name/姓名 column
     const nIndex = row.findIndex(c => c.includes('name') || c.includes('姓名'));
     if (nIndex !== -1) {
       startIndex = i + 1;
       nameCol = nIndex;
       
       // Try to find ID/工号
       const iIndex = row.findIndex(c => c.includes('id') || c.includes('工号') || c.includes('编号'));
       if (iIndex !== -1) idCol = iIndex;
       
       // Try to find Dept/部门
       const dIndex = row.findIndex(c => c.includes('dept') || c.includes('部门') || c.includes('department'));
       if (dIndex !== -1) deptCol = dIndex;
       break;
     }
  }

  for (let i = startIndex; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;
    
    // Ensure we have at least a name
    const name = row[nameCol] ? String(row[nameCol]).trim() : '';
    if (!name) continue;

    const rawId = row[idCol] ? String(row[idCol]).trim() : '';
    // If no ID provided, generate a random one
    const id = rawId || `${name}-${Math.random().toString(36).substr(2, 9)}`;
    const department = row[deptCol] ? String(row[deptCol]).trim() : '';

    result.push({ id, name, department });
  }
  
  return result;
};

export const exportToCSV = (data: Participant[], filename: string) => {
  const headers = ['Name', 'ID', 'Department'];
  const rows = data.map(p => [
    `"${p.name}"`,
    `"${p.id}"`,
    `"${p.department || ''}"`
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};
