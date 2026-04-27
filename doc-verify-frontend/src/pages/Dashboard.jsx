import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { ExternalLink, CheckCircle, Clock, XCircle, ShieldCheck } from 'lucide-react'; 
import UploadDoc from '../components/UploadDoc';
// 1. IMPORT YOUR SETTINGS COMPONENT
import Settings from '../components/Settings'; 

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    try {
      const endpoint = localStorage.getItem('role') === 'admin' ? '/admin/documents' : '/documents';
      const res = await api.get(endpoint);
      setDocs(res.data);
    } catch (err) {
      console.error("Failed to fetch docs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const StatusBadge = ({ status }) => {
    const s = status?.toUpperCase();
    const styles = {
      APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[s] || styles.PENDING}`}>
        {s || 'PENDING'}
      </span>
    );
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Anchor this document to Sepolia? (Costs Gas ETH)")) return;

    setLoading(true);
    try {
      const res = await api.patch(`/admin/documents/${id}`, { status: 'APPROVED' });
      alert("Blockchain Transaction Successful! Hash: " + res.data.blockchain_proof);
      await fetchDocs();
    } catch (err) {
      console.error("Approval failed", err);
      alert("Blockchain Error: " + (err.response?.data?.details || "Transaction failed. Check wallet ETH."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Document Console</h1>
            <p className="text-slate-400 mt-1">Manage and verify your blockchain-anchored records.</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Role</p>
            <p className="text-blue-400 font-mono uppercase">{localStorage.getItem('role')}</p>
          </div>
        </header>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <p className="text-slate-400 text-sm font-medium">Total Documents</p>
                <p className="text-4xl font-bold mt-2 text-white">{docs.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <p className="text-slate-400 text-sm font-medium">Blockchain Verified</p>
                <p className="text-4xl font-bold mt-2 text-emerald-400">
                  {docs.filter(d => d.tx_hash).length}
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <p className="text-slate-400 text-sm font-medium">Pending Review</p>
                <p className="text-4xl font-bold mt-2 text-amber-400">
                  {docs.filter(d => d.status?.toUpperCase() === 'PENDING').length}
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Document Name</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Hash (Fingerprint)</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading && docs.length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-500 text-sm italic">Synchronizing with Secure Ledger...</td></tr>
                  ) : docs.length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-500">No documents found.</td></tr>
                  ) : (
                    docs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-white">{doc.name}</p>
                          <p className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="p-4">
                          <code className="text-xs text-blue-400 bg-blue-400/5 px-2 py-1 rounded">
                            {doc.hash?.substring(0, 16)}...
                          </code>
                        </td>
                        <td className="p-4 text-right">
                          {doc.tx_hash ? (
                            <a 
                              href={`https://sepolia.etherscan.io/tx/${doc.tx_hash}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 text-sm font-semibold"
                            >
                              Verified <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            localStorage.getItem('role') === 'admin' && doc.status?.toUpperCase() === 'PENDING' ? (
                              <button
                                onClick={() => handleApprove(doc.id)}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                              >
                                {loading ? "Anchoring..." : "Approve & Anchor"}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-500 flex items-center justify-end gap-1 font-mono italic">
                                <Clock className="w-3 h-3" /> Awaiting Admin
                              </span>
                            )
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'upload' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UploadDoc onUploadSuccess={() => {
              setActiveTab('overview');
              fetchDocs();
            }} />
          </div>
        )}

        {/* 2. ADD THE SETTINGS TAB HERE */}
        {activeTab === 'settings' && (
          <Settings />
        )}

        {activeTab === 'verify' && (
          <div className="flex flex-col items-center justify-center h-[50vh] bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
            <ShieldCheck className="w-16 h-16 text-slate-700 mb-4" />
            <h2 className="text-xl font-bold text-slate-300">Public Verification Tool</h2>
            <p className="text-slate-500 mt-2">This feature is coming in the next deployment phase.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;