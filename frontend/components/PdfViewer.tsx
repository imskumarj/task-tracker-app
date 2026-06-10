"use client";

export default function PdfViewer({
  url,
}: {
  url: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <iframe
        src={url}
        className="w-full h-[700px]"
        title="PDF Viewer"
      />
    </div>
  );
}