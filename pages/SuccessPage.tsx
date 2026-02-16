import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Info, Share2, ShieldCheck, ChevronLeft } from 'lucide-react';
import { RegistrationData } from '../types';

export const SuccessPage: React.FC = () => {
  const location = useLocation();
  const submissionData = location.state?.data as RegistrationData | undefined;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
       <div className="max-w-2xl w-full relative">
          
          {/* Decorative Elements */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyber-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyber-accent/20 rounded-full blur-3xl animate-pulse delay-700"></div>

          <div className="bg-slate-900/90 backdrop-blur-xl border border-cyber-primary/50 rounded-lg p-1 relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)]">
              {/* Top Bar Decoration */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-green-500 to-transparent absolute top-0 left-0"></div>

              <div className="p-8 md:p-12 text-center">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-500/10 border border-green-500/50 mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    <CheckCircle className="h-10 w-10 text-green-400" />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-2 uppercase tracking-wide">
                    Registration <span className="text-green-400">Complete</span>
                </h1>
                <p className="text-gray-400 font-tech text-lg mb-8">
                    Your squad has been added to the roster. Prepare for deployment.
                </p>

                {submissionData && (
                    <div className="bg-black/40 p-6 rounded border border-slate-700/50 mb-8 text-left relative group">
                        <div className="absolute top-0 right-0 p-2 opacity-50">
                            <ShieldCheck className="w-12 h-12 text-slate-800" />
                        </div>
                        
                        <h3 className="text-xs font-bold text-cyber-accent uppercase tracking-[0.2em] mb-4 border-b border-slate-700 pb-2">
                            Mission Ticket
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm font-tech">
                            <div>
                                <p className="text-slate-500 uppercase text-[10px]">Squad Name</p>
                                <p className="font-semibold text-white text-lg">{submissionData.teamName}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 uppercase text-[10px]">Game</p>
                                <p className="font-semibold text-white">{submissionData.gameName}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 uppercase text-[10px]">Squad Leader</p>
                                <p className="font-semibold text-gray-300">{submissionData.leaderName}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 uppercase text-[10px]">Transaction Hash</p>
                                <p className="font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded inline-block border border-yellow-500/20">
                                    {submissionData.transactionId}
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex items-start gap-2 text-xs text-cyan-400/80 bg-cyan-950/30 p-3 rounded border border-cyan-900/50">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>Data securely transmitted to central command (Admin DB). Awaiting manual verification of payment.</p>
                        </div>
                    </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/" className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-tech uppercase tracking-wider text-sm rounded border border-slate-600 hover:border-cyber-primary transition-all flex items-center justify-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Register Another Squad
                    </Link>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};