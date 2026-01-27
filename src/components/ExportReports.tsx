import { Visitor, Host } from '@/types/visitor';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportReportsProps {
  visitors: Visitor[];
  hosts: Host[];
}

export const ExportReports = ({ visitors, hosts }: ExportReportsProps) => {
  const getHostName = (hostId: string) => {
    const host = hosts.find((h) => h.id === hostId);
    return host ? `${host.flatNumber} - ${host.name}` : hostId;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Company', 'Host', 'Purpose', 'Check In', 'Check Out', 'Status', 'Approved By'];
    const rows = visitors.map((v) => [
      v.name,
      v.phone,
      v.company || '',
      getHostName(v.host),
      v.purpose,
      format(new Date(v.checkInTime), 'dd/MM/yyyy HH:mm'),
      v.checkOutTime ? format(new Date(v.checkOutTime), 'dd/MM/yyyy HH:mm') : '',
      v.status,
      v.approvedBy || '',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `visitor_report_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text('Visitor Entry Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 14, 28);
    doc.text(`Total Visitors: ${visitors.length}`, 14, 34);

    // Table
    const tableData = visitors.map((v) => [
      v.name,
      v.phone,
      getHostName(v.host),
      v.purpose.substring(0, 20) + (v.purpose.length > 20 ? '...' : ''),
      format(new Date(v.checkInTime), 'dd/MM HH:mm'),
      v.status,
    ]);

    autoTable(doc, {
      startY: 42,
      head: [['Name', 'Phone', 'Host', 'Purpose', 'Check In', 'Status']],
      body: tableData,
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
    });

    doc.save(`visitor_report_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
