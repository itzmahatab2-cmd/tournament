import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { GameOptions, PaymentMethods, RegistrationData, FormErrors } from '../types';
import { saveRegistration, getRegistrations } from '../services/storageService';
import { generateTeamName } from '../services/geminiService';
import { Wand2, Loader2, ShieldAlert, Trophy, Map, CreditCard, Gamepad2, ChevronRight, Shield } from 'lucide-react';

const INITIAL_STATE: Omit<RegistrationData, 'id' | 'timestamp'> = {
  teamName: '',
  gameName: '',
  leaderName: '',
  leaderPhone: '',
  leaderEmail: '',
  player1: '',
  player2: '',
  player3: '',
  player4: '',
  discordUsername: '',
  ingameId: '',
  paymentMethod: '',
  transactionId: '',
  agreedToRules: false,
};

// Simple ID generator that doesn't rely on crypto API for better compatibility
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const FormPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [existingRegistrations, setExistingRegistrations] = useState<RegistrationData[]>([]);

  // Fetch existing registrations on mount for duplicate checking
  useEffect(() => {
    getRegistrations()
      .then(data => setExistingRegistrations(data))
      .catch(err => {
        console.warn("Could not load existing data for duplicate checking. Proceeding offline.", err);
      });
  }, []);

  // Sync leader name with player 1
  useEffect(() => {
    setFormData(prev => ({ ...prev, player1: prev.leaderName }));
  }, [formData.leaderName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, agreedToRules: e.target.checked }));
    if (errors.agreedToRules) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.agreedToRules;
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.teamName.trim()) newErrors.teamName = 'Team name is required';
    if (existingRegistrations.some(r => r.teamName.toLowerCase() === formData.teamName.trim().toLowerCase())) {
        newErrors.teamName = 'Team name taken';
    }

    if (!formData.gameName) newErrors.gameName = 'Select a game';
    
    if (!formData.leaderName.trim()) newErrors.leaderName = 'Leader name required';
    if (!formData.leaderPhone.trim()) newErrors.leaderPhone = 'Phone required';
    else if (!/^\d{10,15}$/.test(formData.leaderPhone.replace(/\D/g,''))) newErrors.leaderPhone = 'Invalid phone';
    
    if (formData.leaderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leaderEmail)) {
      newErrors.leaderEmail = 'Invalid email';
    }

    if (!formData.player1.trim()) newErrors.player1 = 'P1 required';
    if (!formData.player2.trim()) newErrors.player2 = 'P2 required';
    if (!formData.player3.trim()) newErrors.player3 = 'P3 required';
    if (!formData.player4.trim()) newErrors.player4 = 'P4 required';

    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method required';
    if (!formData.transactionId.trim()) newErrors.transactionId = 'Tx ID required';

    if (!formData.agreedToRules) newErrors.agreedToRules = 'Accept rules';

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const submission: RegistrationData = {
      ...formData,
      id: generateId(),
      timestamp: new Date().toISOString()
    };

    try {
      await saveRegistration(submission);
      setIsSubmitting(false);
      navigate('/success', { state: { data: submission } });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert("System Error: Submission Failed.");
    }
  };

  const handleGenerateName = async () => {
    if (!formData.gameName) {
        setErrors(prev => ({ ...prev, gameName: 'Select Game First' }));
        return;
    }
    setIsGeneratingName(true);
    const name = await generateTeamName(formData.gameName);
    setFormData(prev => ({ ...prev, teamName: name }));
    setIsGeneratingName(false);
    setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.teamName;
        return newErrors;
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 relative">
      
      {/* Cinematic Header */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden mb-8 group shadow-[0_0_40px_rgba(139,92,246,0.3)] border border-slate-800">
         <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop" 
            alt="Tournament Banner" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter brightness-50 contrast-125" 
         />
         
         <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-transparent to-transparent"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay"></div>

         <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-3 mb-2 animate-fade-in-down">
                <Trophy className="text-yellow-400 w-8 h-8 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                <span className="text-cyber-accent font-tech tracking-[0.3em] text-sm font-bold uppercase">Official Tournament</span>
                <Trophy className="text-yellow-400 w-8 h-8 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 tracking-tighter uppercase text-center drop-shadow-2xl italic"
                style={{ textShadow: '0 0 30px rgba(139,92,246,0.5)' }}>
               CHAMPIONS<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-pink-500">LEAGUE</span>
            </h1>
         </div>

         {/* Organizer Badge */}
         <div className="absolute bottom-4 right-4 z-10">
            <div className="flex items-center gap-2 bg-black/80 backdrop-blur border border-cyber-primary/30 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.2)]">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]"></span>
               <p className="text-gray-300 text-xs font-tech tracking-wider uppercase">Host: <span className="text-white font-bold">Mahatab</span></p>
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Info Panel (Desktop) */}
        <div className="w-full md:w-1/3 space-y-6">
            
            {/* Mission Briefing / Rules */}
            <div className="bg-slate-900/90 border border-cyber-primary/30 rounded-lg p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-primary to-transparent"></div>
                <h2 className="text-lg font-display text-white mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-cyber-accent" />
                    MISSION BRIEFING
                </h2>
                
                <div className="space-y-4 text-sm font-tech text-gray-400">
                    <div className="p-3 bg-slate-800/50 rounded border-l-2 border-cyber-accent">
                        <p className="text-white font-bold mb-1">📅 DEPLOYMENT DATE</p>
                        <p> Every Friday</p>
                    </div>

                    <div>
                        <h3 className="text-cyber-primary font-bold mb-2 flex items-center gap-2">
                            <Map className="w-4 h-4" /> MAP ROTATION
                        </h3>
                        <ul className="space-y-1 ml-6 list-disc marker:text-cyber-accent">
                            <li>Barmuda</li>
                            <li>Solora</li>
                            <li>Nexttrera</li>
                            <li>Alpine</li>
                            <li>Kalahari</li>
                        </ul>
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                        <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> ENTRY FEE: 80 BDT
                        </h3>
                        <p className="text-xs mb-1">Send Money (Bkash): <span className="text-white font-mono select-all">01755913070</span></p>
                        <p className="text-[10px] text-red-400 uppercase tracking-wide">⚠ Fee is Non-Refundable</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                         <h3 className="text-white font-bold mb-1">SCORING INTEL</h3>
                         <div className="grid grid-cols-2 gap-2 text-xs text-center">
                            <div className="bg-slate-800 p-1 rounded text-cyan-300">KILL = +1 PT</div>
                            <div className="bg-slate-800 p-1 rounded text-yellow-300">BOOYAH = +12 PTS</div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                 <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-tech text-slate-500 hover:text-cyber-primary transition-colors uppercase tracking-widest">
                    <Shield className="w-3 h-3" /> Admin Access
                 </Link>
            </div>
        </div>

        {/* Main Form Area */}
        <div className="w-full md:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Team Info */}
                <div onClick={() => setActiveSection(1)}>
                    <SectionCard title="SQUAD DETAILS" description="Identify your unit" isActive={activeSection === 1}>
                    <Select 
                        label="Combat Simulation (Game)"
                        name="gameName"
                        value={formData.gameName}
                        onChange={handleChange}
                        options={Object.values(GameOptions)}
                        required
                        error={errors.gameName}
                    />
                    
                    <div className="relative">
                        <Input 
                            label="Squad Callsign (Team Name)"
                            name="teamName"
                            value={formData.teamName}
                            onChange={handleChange}
                            placeholder="e.g. PHANTOM REAPERS"
                            required
                            error={errors.teamName}
                        />
                        <button
                            type="button"
                            onClick={handleGenerateName}
                            disabled={isGeneratingName}
                            className="absolute right-0 top-8 text-cyber-primary hover:text-white transition-colors p-2 bg-slate-800/80 rounded-l border border-slate-700 hover:border-cyber-primary"
                            title="AI Suggest"
                        >
                            {isGeneratingName ? <Loader2 className="animate-spin w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                        </button>
                    </div>
                    </SectionCard>
                </div>

                {/* Leader Info */}
                <div onClick={() => setActiveSection(2)}>
                    <SectionCard title="SQUAD LEADER" description="Point of Contact" isActive={activeSection === 2}>
                    <Input 
                        label="Leader Callsign"
                        name="leaderName"
                        value={formData.leaderName}
                        onChange={handleChange}
                        required
                        error={errors.leaderName}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Comms (Phone)"
                            name="leaderPhone"
                            type="tel"
                            value={formData.leaderPhone}
                            onChange={handleChange}
                            required
                            error={errors.leaderPhone}
                            placeholder="017..."
                        />
                        <Input 
                            label="Email (Optional)"
                            name="leaderEmail"
                            type="email"
                            value={formData.leaderEmail}
                            onChange={handleChange}
                            error={errors.leaderEmail}
                        />
                    </div>
                    </SectionCard>
                </div>

                {/* Player Info */}
                <div onClick={() => setActiveSection(3)}>
                    <SectionCard title="OPERATIVES" description="Roster Manifest" isActive={activeSection === 3}>
                    <Input 
                        label="Operative 1 (Leader)"
                        name="player1"
                        value={formData.player1}
                        onChange={handleChange}
                        required
                        disabled
                        className="opacity-50 cursor-not-allowed"
                        error={errors.player1}
                    />
                    <Input 
                        label="Operative 2"
                        name="player2"
                        value={formData.player2}
                        onChange={handleChange}
                        required
                        error={errors.player2}
                    />
                    <Input 
                        label="Operative 3"
                        name="player3"
                        value={formData.player3}
                        onChange={handleChange}
                        required
                        error={errors.player3}
                    />
                    <Input 
                        label="Operative 4"
                        name="player4"
                        value={formData.player4}
                        onChange={handleChange}
                        required
                        error={errors.player4}
                    />
                    </SectionCard>
                </div>

                {/* Additional Info */}
                <div onClick={() => setActiveSection(4)}>
                    <SectionCard title="VERIFICATION" description="Payment & IDs" isActive={activeSection === 4}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Discord Tag"
                            name="discordUsername"
                            value={formData.discordUsername}
                            onChange={handleChange}
                            placeholder="User#0000"
                        />
                        <Input 
                            label="In-Game ID"
                            name="ingameId"
                            value={formData.ingameId}
                            onChange={handleChange}
                        />
                    </div>
                    <Select 
                        label="Payment Channel"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        options={Object.values(PaymentMethods)}
                        required
                        error={errors.paymentMethod}
                    />
                    <Input 
                        label="Transaction Hash (Trx ID)"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={handleChange}
                        required
                        error={errors.transactionId}
                        placeholder="e.g. 8J2K9L1M"
                    />
                    </SectionCard>
                </div>

                {/* Agreement */}
                <div onClick={() => setActiveSection(5)}>
                    <div className={`p-4 rounded border transition-colors ${errors.agreedToRules ? 'bg-red-900/20 border-red-500' : 'bg-slate-900/50 border-slate-700'}`}>
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    name="agreedToRules"
                                    checked={formData.agreedToRules}
                                    onChange={handleCheckboxChange}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-slate-500 bg-slate-800 transition-all checked:border-cyber-primary checked:bg-cyber-primary"
                                />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                <span className="font-bold text-gray-200">I ACKNOWLEDGE THE RULES OF ENGAGEMENT</span>
                                <p className="text-xs mt-1 font-tech">Data provided is accurate. False intel leads to immediate disqualification.</p>
                            </div>
                        </label>
                    </div>
                     {errors.agreedToRules && <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-wider text-right">{errors.agreedToRules}</p>}
                </div>

                {/* Submit Actions */}
                <div className="flex justify-between items-center py-6">
                    <button type="button" 
                        onClick={() => {
                            setFormData(INITIAL_STATE);
                            setErrors({});
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-slate-500 hover:text-red-400 font-tech uppercase tracking-wider text-xs transition-colors"
                    >
                        [ Reset Form ]
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative overflow-hidden group bg-cyber-primary hover:bg-violet-600 text-white font-display font-bold uppercase tracking-widest py-4 px-10 clip-button transition-all transform hover:translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Gamepad2 className="w-5 h-5" />}
                            {isSubmitting ? 'INITIALIZING...' : 'CONFIRM REGISTRATION'}
                        </span>
                        {/* Button Glow Effect */}
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                    </button>
                </div>
            </form>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-[10px] text-slate-600 font-tech tracking-[0.2em] uppercase">Secured by TournaForm v2.0 // System Online</p>
      </div>
    </div>
  );
};
