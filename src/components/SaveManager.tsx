import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ShieldCheck, ShieldAlert, Key, Download, Upload, Copy, Check } from 'lucide-react';

export const SaveManager: React.FC = () => {
  const {
    exportEncryptedSave,
    importEncryptedSave
  } = useGame();

  const [passcode, setPasscode] = useState('');
  const [saveString, setSaveString] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  const handleExport = async () => {
    if (!passcode) {
      alert('Please enter a passcode to sign your save file.');
      return;
    }
    try {
      const encryptedData = await exportEncryptedSave(passcode);
      setSaveString(encryptedData);
      
      // Auto download as a text file
      const blob = new Blob([encryptedData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poke_emerald_signed_save_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCopied(false);
    } catch (e) {
      alert('Export failed.');
    }
  };

  const handleCopyToClipboard = () => {
    if (!saveString) return;
    navigator.clipboard.writeText(saveString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    if (!passcode) {
      alert('Please enter the passcode that was used to encrypt/sign this save.');
      return;
    }
    if (!saveString) {
      alert('Please paste the base64 save string.');
      return;
    }

    setImportStatus('idle');
    const result = await importEncryptedSave(saveString, passcode);
    if (result) {
      setImportStatus('success');
    } else {
      setImportStatus('fail');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-950/80 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-6">
      
      {/* Description header */}
      <div className="flex items-center gap-3 border-b border-gray-850 pb-4">
        <Key className="w-6 h-6 text-emerald-400" />
        <div>
          <h2 className="text-xl font-black text-emerald-400">Cybersecure Backup Vault</h2>
          <span className="text-xs font-mono text-gray-400">Government-level cryptographic signature anti-cheat</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Backup & Signature Configuration */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-mono tracking-widest text-slate-400 uppercase">1. SECURE PASSCODE</h3>
          <p className="text-xs text-gray-400">
            Set a key passcode. This passcode is combined with a dynamic client-side key to generate a SHA-256 HMAC signature. 
            If the JSON payload is edited, the signature will break, preventing cheat injection.
          </p>

          <input
            type="password"
            placeholder="Enter security passcode..."
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-gray-850 focus:border-emerald-500/40 focus:outline-none font-mono text-sm"
          />

          <div className="flex gap-3 mt-2">
            <button
              onClick={handleExport}
              disabled={!passcode}
              className="flex-1 py-3 bg-emerald-600/25 border border-emerald-500/50 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT &amp; DOWNLOAD</span>
            </button>
          </div>
        </div>

        {/* Right Side: Paste / Load Backup code */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-mono tracking-widest text-slate-400 uppercase">2. RESTORE VAULT DATA</h3>
          
          <textarea
            placeholder="Paste encrypted save text string here..."
            value={saveString}
            onChange={(e) => setSaveString(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-gray-850 focus:border-emerald-500/40 focus:outline-none font-mono text-xs resize-none"
          />

          <div className="flex gap-3">
            {saveString && (
              <button
                onClick={handleCopyToClipboard}
                className="px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all flex items-center justify-center"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={handleImport}
              disabled={!passcode || !saveString}
              className="flex-1 py-3 bg-blue-600/25 border border-blue-500/50 hover:bg-blue-600/40 text-blue-300 font-bold text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Upload className="w-4 h-4" />
              <span>VERIFY &amp; RESTORE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security alert verification popup */}
      {importStatus !== 'idle' && (
        <div className={`mt-2 p-4 rounded-xl border flex items-center gap-3 shadow-md ${
          importStatus === 'success' 
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-950/20 border-rose-500/30 text-rose-400'
        }`}>
          {importStatus === 'success' ? (
            <>
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div className="flex flex-col">
                <span className="font-bold text-sm">CRYPTOGRAPHIC VERIFICATION SUCCESS</span>
                <span className="text-[10px] font-mono opacity-80">SHA-256 matches header signature. Save restored successfully!</span>
              </div>
            </>
          ) : (
            <>
              <ShieldAlert className="w-6 h-6 text-rose-400" />
              <div className="flex flex-col">
                <span className="font-bold text-sm">SECURITY INTEGRITY VERIFICATION FAILURE</span>
                <span className="text-[10px] font-mono opacity-80">Cheat detected! Signature mismatch or invalid passcode. Save rejected.</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default SaveManager;
