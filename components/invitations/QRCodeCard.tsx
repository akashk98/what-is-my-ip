interface QRCodeCardProps {
  qrCodeUrl: string;
}

import CardShell from "./CardShell";

export default function QRCodeCard({ qrCodeUrl }: QRCodeCardProps) {
  return (
    <CardShell title="QR Code">
      <div className="text-sm text-slate-600">Scan to view invitation</div>
      <div className="mt-6 flex items-center justify-center overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4">
        <img
          src={qrCodeUrl}
          alt="Invitation QR code"
          className="h-56 w-56 max-w-full object-contain"
          loading="lazy"
        />
      </div>
    </CardShell>
  );
}
