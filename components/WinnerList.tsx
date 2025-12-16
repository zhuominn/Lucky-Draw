import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button, Card } from './ui-elements';
import { exportToCSV, copyToClipboard } from '../utils/csvHelper';
import { Download, Copy, Trash2, Trophy } from 'lucide-react';
import { cn } from './ui-elements';

export const WinnerList: React.FC = () => {
  const { winners, removeWinner, clearWinners, settings } = useAppStore();

  const handleExport = () => {
    if (winners.length === 0) return;
    exportToCSV(winners, `winners-${new Date().toISOString().split('T')[0]}`);
  };

  const handleCopy = async () => {
    if (winners.length === 0) return;
    const text = winners.map(w => `${w.name} (${w.department || 'N/A'})`).join('\n');
    const success = await copyToClipboard(text);
    if (success) alert('Winners copied to clipboard!');
  };

  if (winners.length === 0) return null;

  return (
    <Card className="mt-8 overflow-hidden animate-in slide-in-from-bottom-10">
      <div className={cn("p-4 border-b flex justify-between items-center", settings.theme === 'pink' ? "bg-pink-100 border-pink-200" : "bg-slate-100 dark:bg-slate-900 dark:border-slate-800")}>
        <h3 className="font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Winners ({winners.length})
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy} title="Copy to Clipboard">
            <Copy className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport} title="Export CSV">
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={clearWinners} title="Clear Winners">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="max-h-[300px] overflow-y-auto p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-950/50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 font-medium text-slate-500">#</th>
              <th className="px-4 py-2 font-medium text-slate-500">Name</th>
              <th className="px-4 py-2 font-medium text-slate-500">Dept</th>
              <th className="px-4 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {winners.map((winner, idx) => (
              <tr key={winner.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{winners.length - idx}</td>
                <td className="px-4 py-3 font-medium">{winner.name}</td>
                <td className="px-4 py-3 text-slate-500">{winner.department || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => removeWinner(winner.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
