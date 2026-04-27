import React, { useState } from 'react';
import { Upload, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';

const UploadDoc = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus({ type: '', msg: '' });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setStatus({ type: 'success', msg: 'Document uploaded and hashed successfully!' });
      setFile(null);
      if (onUploadSuccess) onUploadSuccess(); // Refresh the list
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Upload New Document</h2>
        <p className="text-slate-400 mb-8 text-sm">
          Files are automatically hashed using SHA-256 before being stored.
        </p>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* Custom Dropzone Area */}
          <label className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
            file ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-950/30'
          }`}>
            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg" />
            
            {file ? (
              <div className="flex flex-col items-center">
                <File className="w-12 h-12 text-blue-500 mb-4" />
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-slate-500 text-xs mt-1">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-slate-800 p-4 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-300 font-medium">Click to upload or drag and drop</p>
                <p className="text-slate-500 text-xs mt-2">PDF, PNG, or JPG (max 10MB)</p>
              </div>
            )}
          </label>

          {/* Status Messages */}
          {status.msg && (
            <div className={`flex items-center gap-3 p-4 rounded-xl text-sm border ${
              status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {status.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Submit for Verification"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadDoc;
