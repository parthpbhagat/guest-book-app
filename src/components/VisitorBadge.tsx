import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Visitor, Host } from '@/types/visitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Printer, Building2, User, Phone, Clock, Home } from 'lucide-react';
import { format } from 'date-fns';

interface VisitorBadgeProps {
  visitor: Visitor;
  host?: Host;
}

export const VisitorBadge = ({ visitor, host }: VisitorBadgeProps) => {
  const badgeRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = badgeRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Visitor Badge - ${visitor.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', system-ui, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f5f5f5;
            }
            .badge {
              width: 320px;
              background: white;
              border-radius: 16px;
              padding: 24px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              border: 2px solid #2563eb;
            }
            .header {
              text-align: center;
              padding-bottom: 16px;
              border-bottom: 2px dashed #e5e7eb;
              margin-bottom: 16px;
            }
            .header h1 {
              font-size: 18px;
              font-weight: 700;
              color: #2563eb;
              margin-bottom: 4px;
            }
            .header p {
              font-size: 11px;
              color: #6b7280;
            }
            .visitor-photo {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              object-fit: cover;
              border: 3px solid #2563eb;
              margin: 0 auto 16px;
              display: block;
            }
            .visitor-avatar {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: #dbeafe;
              margin: 0 auto 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              color: #2563eb;
              font-weight: 600;
            }
            .visitor-name {
              font-size: 20px;
              font-weight: 700;
              text-align: center;
              color: #111827;
              margin-bottom: 4px;
            }
            .visitor-company {
              font-size: 13px;
              color: #6b7280;
              text-align: center;
              margin-bottom: 16px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 16px;
            }
            .info-item {
              background: #f9fafb;
              padding: 10px;
              border-radius: 8px;
            }
            .info-label {
              font-size: 10px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 2px;
            }
            .info-value {
              font-size: 13px;
              font-weight: 600;
              color: #111827;
            }
            .qr-section {
              text-align: center;
              padding-top: 16px;
              border-top: 2px dashed #e5e7eb;
            }
            .qr-section p {
              font-size: 10px;
              color: #6b7280;
              margin-top: 8px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              background: #dcfce7;
              color: #16a34a;
              margin-bottom: 16px;
            }
            @media print {
              body { background: white; }
              .badge { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const qrData = JSON.stringify({
    id: visitor.id,
    name: visitor.name,
    checkIn: visitor.checkInTime,
    host: host?.flatNumber || visitor.host,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Badge</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Visitor Badge</DialogTitle>
        </DialogHeader>

        <div ref={badgeRef} className="badge mx-auto w-full max-w-[320px] rounded-2xl border-2 border-primary bg-card p-6 shadow-lg">
          {/* Header */}
          <div className="header mb-4 border-b-2 border-dashed border-border pb-4 text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-primary">VISITOR PASS</h1>
            </div>
            <p className="text-xs text-muted-foreground">Entry Management System</p>
          </div>

          {/* Photo */}
          {visitor.photo ? (
            <img
              src={visitor.photo}
              alt={visitor.name}
              className="visitor-photo mx-auto mb-4 h-20 w-20 rounded-full border-[3px] border-primary object-cover"
            />
          ) : (
            <div className="visitor-avatar mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              {visitor.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name & Company */}
          <h2 className="visitor-name text-center text-xl font-bold">{visitor.name}</h2>
          {visitor.company && (
            <p className="visitor-company text-center text-sm text-muted-foreground">{visitor.company}</p>
          )}

          {/* Status */}
          <div className="my-4 text-center">
            <span className="status-badge inline-block rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
              ✓ APPROVED ENTRY
            </span>
          </div>

          {/* Info Grid */}
          <div className="info-grid mb-4 grid grid-cols-2 gap-3">
            <div className="info-item rounded-lg bg-muted p-3">
              <div className="info-label flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
                <Home className="h-3 w-3" /> Visiting
              </div>
              <div className="info-value text-sm font-semibold">
                {host ? host.flatNumber : 'N/A'}
              </div>
            </div>
            <div className="info-item rounded-lg bg-muted p-3">
              <div className="info-label flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
                <User className="h-3 w-3" /> Host
              </div>
              <div className="info-value text-sm font-semibold">
                {host ? host.name : 'N/A'}
              </div>
            </div>
            <div className="info-item rounded-lg bg-muted p-3">
              <div className="info-label flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
                <Clock className="h-3 w-3" /> Check-In
              </div>
              <div className="info-value text-sm font-semibold">
                {format(new Date(visitor.checkInTime), 'HH:mm')}
              </div>
            </div>
            <div className="info-item rounded-lg bg-muted p-3">
              <div className="info-label flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
                <Phone className="h-3 w-3" /> Phone
              </div>
              <div className="info-value text-sm font-semibold">
                {visitor.phone.slice(-4)}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="qr-section border-t-2 border-dashed border-border pt-4 text-center">
            <QRCodeSVG value={qrData} size={80} className="mx-auto" />
            <p className="mt-2 text-[10px] text-muted-foreground">
              Scan to verify • {format(new Date(visitor.checkInTime), 'dd MMM yyyy')}
            </p>
          </div>
        </div>

        <Button onClick={handlePrint} className="mt-4 w-full">
          <Printer className="mr-2 h-4 w-4" />
          Print Badge
        </Button>
      </DialogContent>
    </Dialog>
  );
};
