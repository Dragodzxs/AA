import React, { useState } from 'react';
import { Shield } from 'lucide-react';

export const AuthModal = ({ onLogin, onCancel }) => {
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loginId === '11a' && loginPassword === '11b') {
      onLogin();
    } else {
      setLoginError('Invalid ID or Password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto">
      <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl max-w-sm w-full mx-4 border border-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">HR Authentication</h3>
            <p className="text-xs text-slate-500">Sign in to access internal records</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
            <input 
              type="text" 
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-800"
              placeholder="Enter ID (e.g. 11a)"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-800"
              placeholder="Enter Password (e.g. 11b)"
            />
          </div>
          
          {loginError && <p className="text-xs text-red-500 font-semibold">{loginError}</p>}
          
          <div className="flex gap-2 pt-2">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors shadow-lg shadow-purple-500/30"
            >
              Authenticate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
