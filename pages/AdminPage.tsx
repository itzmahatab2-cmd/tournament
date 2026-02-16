import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRegistrations, exportToCSV, clearRegistrations, deleteRegistration, copyForGoogleSheets } from '../services/storageService';
import { RegistrationData } from '../types';
import { Download, Trash2, ArrowLeft, Search, Shield, Copy, Check, Database, Loader2, Lock, Terminal } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
        loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
      setIsLoading(true);
      try {
          const data = await getRegistrations();
          setRegistrations(data);
      } catch (e) {
          console.error(e);
          alert('Failed to load data from server.');
      } finally {
          setIsLoading(false);
      }
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Simple mock authentication
      if (password === 'mahatab') {
          setIsAuthenticated(true);
      } else {
          alert('Access Denied: Invalid Credentials');
      }
  };

  const handleClearAll = async () => {
      if (window.confirm('WARNING: Purge all database entries? This action is irreversible.')) {
          setIsLoading(true);
          try {
            await clearRegistrations();
            await loadData();
            alert('Database purged.');
          } catch (e) {
            alert('Purge failed.');
          } finally {
            setIsLoading(false);
          }
      }
  };

  const handleDeleteOne = async (id: string, teamName: string) => {
      if (window.confirm(`Delete entry for "${teamName}"?`)) {
          setIsLoading(true);
          try {
            await deleteRegistration(id);
            await loadData();
          } catch (e) {
            alert('Delete failed.');
          } finally {
            setIsLoading(false);
          }
      }
  };

  const handleCopyForSheets = async () => {
      const success = await copyForGoogleSheets(registrations);
      if (success) {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 3000);
      } else {
          alert("Clipboard Error");
      }
  };

  const safeLower = (str?: string) => (str || '').toLowerCase();

  const filteredData = registrations.filter(r => 
    safeLower(r.teamName).includes(searchTerm.toLowerCase()) ||
    safeLower(r.leaderName).includes(searchTerm.toLowerCase()) || 
    safeLower(r.gameName).includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.5)] w-full max-w-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyber-primary"></div>
                  <div className="flex justify-center mb-6">
                      <div className="p-4 bg-slate-800 rounded-full border border-slate-700 shadow-inner">
                        <Lock className="w-8 h-8 text-cyber-primary" />
                      </div>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-center text-white mb-2">RESTRICTED AREA</h2>
                  <p className="text-center text-gray-500 font-tech text-sm mb-6">Enter authorization code to proceed</p>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                          <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-slate-700 text-white px-4 py-3 rounded focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary focus:outline-none font-mono tracking-widest text-center"
                            placeholder="•••••••"
                          />
                      </div>
                      <button type="submit" className="w-full bg-cyber-primary hover:bg-violet-600 text-white font-tech font-bold uppercase py-3 rounded transition shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                          Authenticate
                      </button>
                      <Link to="/" className="block text-center text-xs font-tech text-slate-500 hover:text-white mt-6 uppercase tracking-wider">
                          Return to Public Access
                      </Link>
                  </form>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen pb-12">
        {/* Admin Header */}
        <div className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-display font-bold text-white tracking-wide">COMMAND CENTER</h1>
                        <span className="text-[10px] text-cyber-primary font-mono flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> SYSTEM ONLINE
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden md:flex items-center gap-2 mr-4 text-xs font-mono text-slate-500 bg-black/30 px-3 py-1 rounded border border-slate-800">
                        <Database className="w-3 h-3" />
                        ENTRIES: <span className="text-white">{registrations.length}</span>
                    </div>

                    <button 
                        type="button"
                        onClick={handleCopyForSheets}
                        className={`flex items-center gap-2 ${copySuccess ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-700'} text-white px-3 py-2 rounded border border-slate-600 hover:border-cyber-primary text-xs font-tech font-bold uppercase transition`}
                        disabled={registrations.length === 0 || isLoading}
                    >
                        {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden sm:inline">{copySuccess ? 'COPIED' : 'COPY TSV'}</span>
                    </button>

                    <button 
                        type="button"
                        onClick={() => exportToCSV(registrations)}
                        className="flex items-center gap-2 bg-cyber-primary hover:bg-violet-600 text-white px-3 py-2 rounded text-xs font-tech font-bold uppercase transition shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                        disabled={registrations.length === 0 || isLoading}
                    >
                        <Download className="w-4 h-4" /> <span className="hidden sm:inline">EXPORT CSV</span>
                    </button>
                    
                    <button 
                        type="button"
                        onClick={handleClearAll}
                        className="flex items-center gap-2 bg-red-900/20 text-red-400 border border-red-900/50 px-3 py-2 rounded hover:bg-red-900/40 text-xs font-tech font-bold uppercase transition"
                        disabled={registrations.length === 0 || isLoading}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500" />
                </div>
                <input
                    type="text"
                    placeholder="Search database..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 block w-full bg-slate-900 border border-slate-700 rounded text-gray-200 py-2 px-3 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary focus:outline-none placeholder-slate-600 font-tech"
                />
            </div>

            {/* Table Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
                {isLoading ? (
                    <div className="p-20 text-center flex flex-col items-center">
                        <Loader2 className="w-12 h-12 mb-4 text-cyber-primary animate-spin" />
                        <p className="text-gray-400 font-tech uppercase tracking-widest">Retrieving Data...</p>
                    </div>
                ) : registrations.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center text-gray-500">
                        <Terminal className="w-16 h-16 mb-6 opacity-20" />
                        <p className="text-xl font-display uppercase">Database Empty</p>
                        <p className="text-sm font-tech">Waiting for incoming signals.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-slate-950">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-cyber-accent uppercase tracking-widest font-display">Squad</th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-cyber-accent uppercase tracking-widest font-display">Game</th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-cyber-accent uppercase tracking-widest font-display">Leader</th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-cyber-accent uppercase tracking-widest font-display">Comms</th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-cyber-accent uppercase tracking-widest font-display">Payment</th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-cyber-accent uppercase tracking-widest font-display">Timestamp</th>
                                    <th scope="col" className="px-6 py-4 text-right text-[10px] font-bold text-cyber-accent uppercase tracking-widest font-display">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-900 divide-y divide-slate-800/50">
                                {filteredData.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-slate-800 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-white font-tech">{reg.teamName}</div>
                                            <div className="text-xs text-slate-500 font-mono">ID: {reg.ingameId || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-bold rounded bg-slate-800 text-cyan-400 border border-slate-700">
                                                {reg.gameName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-300 font-tech">{reg.leaderName}</div>
                                            <div className="text-xs text-slate-500">{reg.discordUsername}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-300 font-mono">{reg.leaderPhone}</div>
                                            <div className="text-xs text-slate-500">{reg.leaderEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-slate-400">{reg.paymentMethod}</div>
                                            <div className="text-xs text-yellow-500 font-mono bg-yellow-900/20 px-1 rounded border border-yellow-900/30 inline-block">{reg.transactionId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                                            {new Date(reg.timestamp).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteOne(reg.id, reg.teamName);
                                                }}
                                                className="text-slate-600 hover:text-red-500 transition-colors"
                                                title="Delete Entry"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};