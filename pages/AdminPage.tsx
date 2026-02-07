import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRegistrations, exportToCSV, clearRegistrations, deleteRegistration, copyForGoogleSheets } from '../services/storageService';
import { RegistrationData } from '../types';
import { Download, Trash2, ArrowLeft, Search, Users, Shield, Trash, Copy, Check, Database, Loader2 } from 'lucide-react';

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
          alert('Incorrect password.');
      }
  };

  const handleClearAll = async () => {
      if (window.confirm('Are you sure you want to delete ALL registrations? This cannot be undone.')) {
          setIsLoading(true);
          try {
            await clearRegistrations();
            await loadData(); // Reload from server
            alert('Database cleared successfully.');
          } catch (e) {
            alert('Failed to clear database.');
          } finally {
            setIsLoading(false);
          }
      }
  };

  const handleDeleteOne = async (id: string, teamName: string) => {
      if (window.confirm(`Are you sure you want to delete team "${teamName}"?`)) {
          setIsLoading(true);
          try {
            await deleteRegistration(id);
            await loadData(); // Reload from server
          } catch (e) {
            alert('Failed to delete registration.');
          } finally {
            setIsLoading(false);
          }
      }
  };

  const handleCopyForSheets = async () => {
      const success = await copyForGoogleSheets(registrations);
      if (success) {
          setCopySuccess(true);
          alert("✅ Data copied!\n\n1. Open Google Sheets (sheets.new)\n2. Click the first cell (A1)\n3. Press Ctrl+V (Paste)");
          setTimeout(() => setCopySuccess(false), 3000);
      } else {
          alert("Failed to copy data or no data available.");
      }
  };

  // Safe lower case helper to prevent crashes on bad data
  const safeLower = (str?: string) => (str || '').toLowerCase();

  const filteredData = registrations.filter(r => 
    safeLower(r.teamName).includes(searchTerm.toLowerCase()) ||
    safeLower(r.leaderName).includes(searchTerm.toLowerCase()) || 
    safeLower(r.gameName).includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
              <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                  <div className="flex justify-center mb-6">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Shield className="w-8 h-8 text-purple-600" />
                      </div>
                  </div>
                  <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Access</h2>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                          <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="Enter admin password"
                          />
                      </div>
                      <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
                          Login
                      </button>
                      <Link to="/" className="block text-center text-sm text-gray-500 hover:text-purple-600 mt-4">
                          Back to Form
                      </Link>
                  </form>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
        {/* Admin Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                        {registrations.length}
                    </span>
                    <span className="hidden md:flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200" title="Data is synchronized with Google Sheets">
                         <Database className="w-3 h-3" /> Cloud
                    </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button 
                        type="button"
                        onClick={handleCopyForSheets}
                        className={`flex items-center gap-2 ${copySuccess ? 'bg-green-700' : 'bg-green-600'} text-white px-3 py-2 sm:px-4 rounded-md hover:bg-green-700 text-xs sm:text-sm font-medium transition shadow-sm`}
                        disabled={registrations.length === 0 || isLoading}
                        title="Copy data to paste into Google Sheets or Excel"
                    >
                        {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden sm:inline">{copySuccess ? 'Copied!' : 'Copy for Sheets'}</span>
                    </button>

                    <button 
                        type="button"
                        onClick={() => exportToCSV(registrations)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-md hover:bg-blue-700 text-xs sm:text-sm font-medium transition shadow-sm"
                        disabled={registrations.length === 0 || isLoading}
                    >
                        <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export CSV</span>
                    </button>
                    
                    <div className="h-6 w-px bg-gray-300 mx-1"></div>

                    <button 
                        type="button"
                        onClick={handleClearAll}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 sm:px-4 rounded-md hover:bg-red-100 text-xs sm:text-sm font-medium transition"
                        disabled={registrations.length === 0 || isLoading}
                    >
                        <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Clear All</span>
                    </button>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Search */}
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by team, leader, or game..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white"
                />
            </div>

            {/* Table Card */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <Loader2 className="w-10 h-10 mb-4 text-purple-600 animate-spin" />
                        <p className="text-sm">Syncing with server...</p>
                    </div>
                ) : registrations.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <Users className="w-12 h-12 mb-4 text-gray-300" />
                        <p className="text-lg">No registrations found.</p>
                        <p className="text-sm">Share the form link to start collecting teams.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leader</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{reg.teamName}</div>
                                            <div className="text-xs text-gray-500">ID: {reg.ingameId || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {reg.gameName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{reg.leaderName}</div>
                                            <div className="text-xs text-gray-500">{reg.discordUsername}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{reg.leaderPhone}</div>
                                            <div className="text-xs text-gray-500">{reg.leaderEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{reg.paymentMethod}</div>
                                            <div className="text-xs text-gray-500 font-mono">{reg.transactionId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(reg.timestamp).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteOne(reg.id, reg.teamName);
                                                }}
                                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                                title="Delete Team"
                                            >
                                                <Trash className="w-4 h-4" />
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