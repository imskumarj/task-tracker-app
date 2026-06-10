"use client";

import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
  new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

export default function PdfViewer({
  url,
}: {
  url: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Document file={url}>
        <Page pageNumber={1} />
      </Document>
    </div>
  );
}