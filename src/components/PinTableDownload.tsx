'use client';

import { pinTableCsv } from '../lib/elyssa-docs';

export default function PinTableDownload({ className = 'docs-dl-card' }: { className?: string }) {
  const download = () => {
    const blob = new Blob([pinTableCsv()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elyssa-pin-table.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button type="button" className={className} onClick={download}>
      <small>CSV</small>
      <strong>Pin safety table</strong>
      <span>Every pin, its GPIO and what it is safe for</span>
      <b>↓</b>
    </button>
  );
}
