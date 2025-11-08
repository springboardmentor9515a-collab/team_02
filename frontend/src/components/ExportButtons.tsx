import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';

interface ExportButtonsProps {
  reportData: {
    complaints: any[];
    polls: any[];
    petitions: any[];
  };
}

export const ExportButtons = ({ reportData }: ExportButtonsProps) => {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
      <Button
        onClick={() => {
          const { complaints, polls, petitions } = reportData;
          const data = [
            ['Category', 'Total', 'Assigned', 'Resolved'],
            ['Complaints', complaints.length, 
             complaints.filter(c => c.assigned_to).length,
             complaints.filter(c => c.status === 'resolved').length],
            ['Polls', polls.length,
             polls.filter(p => p.assigned_to).length,
             polls.filter(p => p.status === 'completed').length],
            ['Petitions', petitions.length,
             petitions.filter(p => p.assigned_to).length,
             petitions.filter(p => p.status === 'resolved').length]
          ];
          const csvContent = data.map(row => row.join(',')).join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
          saveAs(blob, `civix_report_${new Date().toISOString().split('T')[0]}.csv`);
          toast.success('Report exported as CSV');
        }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-civix-dark-brown dark:text-civix-sandal shadow-lg"
      >
        <Download className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
      <Button
        onClick={() => {
          const element = document.getElementById('reports-content');
          if (element) {
            const opt = {
              margin: 1,
              filename: `civix_report_${new Date().toISOString().split('T')[0]}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            // html2pdf types can be strict; cast options to any to avoid TS mismatch here
            // @ts-ignore
            html2pdf().set(opt as any).from(element).save();
            toast.success('Report exported as PDF');
          }
        }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-civix-dark-brown dark:text-civix-sandal shadow-lg"
      >
        <FileText className="w-4 h-4 mr-2" />
        Export PDF
      </Button>
    </div>
  );
};