import { useState } from 'react';

export default function CopyButton({ dataToCopy }: { dataToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(dataToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-lg transition-all flex items-center gap-2"
    >
      {copied ? '✅ Copiado' : '📋 Copiar para Reporte'}
    </button>
  );
}