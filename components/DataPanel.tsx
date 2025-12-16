import React, { useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button, Card } from './ui-elements';
import { parseCSV, parseExcel } from '../utils/csvHelper';
import { Upload, Users, FileSpreadsheet } from 'lucide-react';

interface DataPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataPanel: React.FC<DataPanelProps> = ({ isOpen, onClose }) => {
  const { participants, setParticipants, clearParticipants } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let data: any[] = [];
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

      if (isExcel) {
        data = await parseExcel(file);
      } else {
        // Assume CSV/TXT
        const text = await file.text();
        data = parseCSV(text);
      }

      if (data.length > 0) {
        setParticipants(data);
        alert(`Successfully imported ${data.length} participants!`);
        onClose();
      } else {
        alert('No valid data found in file.');
      }
    } catch (error) {
      console.error(error);
      alert('Error parsing file. Please check the format.');
    }
    
    // Reset input so same file can be selected again if needed
    if (e.target) e.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg p-6 relative animate-in zoom-in-95">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Manage Participants</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">✕</button>
         </div>

         <div className="grid grid-cols-2 gap-4 mb-6">
            <div 
              onClick={triggerFileInput}
              className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <Upload className="w-8 h-8 mb-2 text-blue-500" />
              <span className="font-medium">Import CSV</span>
              <span className="text-xs text-slate-500 mt-1">UTF-8 Encoded</span>
            </div>

             <div 
              onClick={triggerFileInput}
              className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <FileSpreadsheet className="w-8 h-8 mb-2 text-green-500" />
              <span className="font-medium">Import Excel</span>
              <span className="text-xs text-slate-500 mt-1">.xlsx or .xls</span>
            </div>
         </div>
         <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv,.txt,.xlsx,.xls" 
            className="hidden" 
          />

         <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Current List ({participants.length})
              </span>
              {participants.length > 0 && (
                <button onClick={clearParticipants} className="text-xs text-red-500 hover:underline">Clear All</button>
              )}
            </div>
            {participants.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No participants loaded.</p>
            ) : (
              <ul className="text-sm space-y-1">
                {participants.slice(0, 10).map((p, i) => (
                  <li key={i} className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1 last:border-0">
                    <span>{p.name}</span>
                    <span className="text-slate-400 text-xs">{p.department}</span>
                  </li>
                ))}
                {participants.length > 10 && <li className="text-center text-xs text-slate-400 pt-2">...and {participants.length - 10} more</li>}
              </ul>
            )}
         </div>
      </Card>
    </div>
  );
};
