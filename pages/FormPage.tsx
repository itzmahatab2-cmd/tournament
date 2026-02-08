import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { GameOptions, PaymentMethods, RegistrationData, FormErrors } from '../types';
import { saveRegistration, getRegistrations } from '../services/storageService';
import { generateTeamName } from '../services/geminiService';
import { Wand2, Loader2, AlertCircle } from 'lucide-react';

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
        // Silent failure or warning only - don't alert user as this is just for validation optimization
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
    // Duplicate check using loaded data (if available)
    if (existingRegistrations.some(r => r.teamName.toLowerCase() === formData.teamName.trim().toLowerCase())) {
        newErrors.teamName = 'This team name is already taken';
    }

    if (!formData.gameName) newErrors.gameName = 'Please select a game';
    
    if (!formData.leaderName.trim()) newErrors.leaderName = 'Leader name is required';
    if (!formData.leaderPhone.trim()) newErrors.leaderPhone = 'Phone number is required';
    else if (!/^\d{10,15}$/.test(formData.leaderPhone.replace(/\D/g,''))) newErrors.leaderPhone = 'Invalid phone number format';
    
    if (formData.leaderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leaderEmail)) {
      newErrors.leaderEmail = 'Invalid email address';
    }

    if (!formData.player1.trim()) newErrors.player1 = 'Player 1 (Leader) is required';
    if (!formData.player2.trim()) newErrors.player2 = 'Player 2 is required';
    if (!formData.player3.trim()) newErrors.player3 = 'Player 3 is required';
    if (!formData.player4.trim()) newErrors.player4 = 'Player 4 is required';

    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    if (!formData.transactionId.trim()) newErrors.transactionId = 'Transaction ID is required';

    if (!formData.agreedToRules) newErrors.agreedToRules = 'You must agree to the rules';

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
        // Scroll to first error
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
      // Pass the submission data to the success page to show a receipt
      navigate('/success', { state: { data: submission } });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert("Failed to submit registration. Please try again or contact the admin.");
    }
  };

  const handleGenerateName = async () => {
    if (!formData.gameName) {
        setErrors(prev => ({ ...prev, gameName: 'Select a game first to generate a relevant name' }));
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
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header Image/Banner - Cinematic Free Fire Theme */}
      <div className="w-full h-80 bg-gray-900 rounded-t-lg mb-0 relative overflow-hidden shadow-xl group">
         {/* Background Image - Dark/Fire/Gaming Theme */}
         <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop" 
            alt="Free Fire Tournament Banner" 
            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" 
         />
         
         {/* Gradient Overlays for intensity and text readability */}
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-orange-900/30 to-purple-900/30 mix-blend-overlay"></div>

         {/* Cinematic Text Overlay */}
         <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 tracking-tighter uppercase text-center drop-shadow-2xl" 
                style={{
                  filter: 'drop-shadow(0 0 15px rgba(255, 69, 0, 0.6))',
                  fontFamily: "'Roboto', sans-serif"
                }}>
               Free Fire<br/><span className="text-white">Tournament</span>
            </h1>
            <div className="h-1 w-24 bg-orange-500 rounded-full mt-4 shadow-[0_0_10px_rgba(255,165,0,0.8)]"></div>
         </div>

         {/* Organizer Badge */}
         <div className="absolute bottom-4 right-4 z-10">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-orange-500/30 shadow-lg">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse box-shadow-[0_0_8px_red]"></span>
               <p className="text-gray-200 text-xs font-mono tracking-wide uppercase">Organiser: Mahatab</p>
            </div>
         </div>
      </div>

      {/* Title Card */}
      <div className="bg-white rounded-b-lg rounded-t-none shadow-sm border border-gray-200 border-t-8 border-t-orange-600 p-6 mb-4 relative z-10 -mt-2">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-normal text-gray-900 mb-4">Champions League Registration</h1>
                <p className="text-sm text-gray-600 mb-2">
                  Welcome to the ultimate esports showdown. Please fill out the form below carefully to register your team.
                  Ensure all player details are accurate as they will be verified before match start.
                </p>
                <p className="text-sm text-red-500 font-medium">* Required</p>
            </div>
            <Link to="/admin" className="text-xs text-gray-400 hover:text-orange-600 transition-colors">Admin</Link>
        </div>
      </div>

      {/* Rules & Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 text-sm text-gray-800">
        <h2 className="text-lg font-medium mb-4 text-orange-700 border-b pb-2">Tournament Rules & Information</h2>
        
        <div className="space-y-4">
            <p className="font-semibold text-center bg-gray-100 p-2 rounded text-gray-700">
                (Open to all School, College, and University Students)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="mb-1"><span className="font-bold">👤 Main Organiser:</span> Mahatab</p>
                    <p><span className="font-bold">📅 Start Date:</span> Every Friday</p>
                </div>
                <div>
                    <p><span className="font-bold">📞 Contact (WhatsApp):</span> 01755913070</p>
                </div>
            </div>

            <hr className="border-gray-100" />

            <div>
                <h3 className="font-bold text-gray-900 mb-2">🗺️ Total 5 Matches:</h3>
                <ol className="list-decimal list-inside ml-2 space-y-1 text-gray-600">
                    <li>Barmuda</li>
                    <li>Solora</li>
                    <li>Nexttrera</li>
                    <li>Alpine</li>
                    <li>Kalahari</li>
                </ol>
                <p className="text-red-500 text-xs mt-2 font-medium">⚠ নোট: অবশ্যই সকল ম্যাপ ডাউনলোড থাকতে হবে।</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-md border border-orange-100">
                <h3 className="font-bold text-orange-900 mb-2">✅ Registration & Payment</h3>
                <ul className="list-none space-y-1 text-gray-700">
                    <li>🔹 <strong>Entry Fee:</strong> 80 টাকা (Per Squad)</li>
                    <li>🔹 <strong>Payment Method (bKash):</strong> 01755913070</li>
                    <li>🔹 <strong>Payment Type:</strong> Send Money</li>
                </ul>
                <div className="mt-3 text-xs bg-white p-2 rounded border border-orange-100">
                    <p className="mb-1">💡 <strong>নির্দেশনা:</strong> Send Money করার সময় অবশ্যই রেফারেন্সে <strong>Team Name</strong> লিখবেন।</p>
                    <p className="text-red-600">⚠ <strong>সতর্কতা:</strong> রেজিস্ট্রেশন ফি অফেরতযোগ্য। ব্যক্তিগত ভুলের দায়ভার ক্লাব বহন করবে না।</p>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-gray-900 mb-2">🏆 Prize Pool</h3>
                <ul className="list-disc list-inside ml-2 space-y-1 text-gray-600">
                    <li><strong>Champion:</strong> Updating soon...</li>
                    <li><strong>Runner Up:</strong> Updating soon...</li>
                    <li>💰 <strong>Total Prize Money:</strong> খেলা শুরু হওয়ার আগের দিন জানিয়ে দেওয়া হবে (Team-এর উপর নির্ভর করবে)।</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2 italic">ℹ️ বিশেষ দ্রষ্টব্য: চ্যাম্পিয়ন এবং রানারআপ টিমের ক্যাশ প্রাইজের ১৫% Thalta FF Tournament Club-এর উন্নয়নের জন্য বরাদ্দ থাকবে।</p>
            </div>

            <div>
                <h3 className="font-bold text-gray-900 mb-2">🎮 Match Details & Point System</h3>
                <ul className="list-disc list-inside ml-2 space-y-1 text-gray-600">
                    <li>মোট ৫টি ম্যাচ হবে।</li>
                    <li>Gun Property: <strong>NO</strong> থাকবে (Official E-sports Tournament-এর মতো)।</li>
                    <li>Winner Selection: পয়েন্টের উপর ভিত্তি করে।</li>
                    <li className="list-none ml-5 text-xs text-gray-500">• Per Kill: 1 Point</li>
                    <li className="list-none ml-5 text-xs text-gray-500">• Booyah: 12 Points</li>
                    <li className="list-none ml-5 text-xs text-gray-500">• বাকিরা পজিশন অনুযায়ী পয়েন্ট পাবে।</li>
                </ul>
            </div>

            <div className="border-l-4 border-red-500 pl-3 py-1 bg-red-50">
                <h3 className="font-bold text-red-700 mb-2">🚫 Strict Rules & Regulations</h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-red-800">
                    <li>কোনো প্রকার গালিগালাজ, ট্রল বা অশোভন আচরণ করলে টিম ডিসকোয়ালিফাই করা হবে।</li>
                    <li>হ্যাকিং, এমুলেটর বা তৃতীয় পক্ষের সফটওয়্যার ব্যবহার করলে সাথে সাথে টিম বাতিল হবে।</li>
                    <li>সকল খেলোয়াড়কে শৃঙ্খলা বজায় রেখে ম্যাচ খেলতে হবে।</li>
                    <li>টুর্নামেন্ট চলাকালীন ক্লাব কমিটির সিদ্ধান্তই চূড়ান্ত সিদ্ধান্ত হিসেবে গণ্য হবে।</li>
                    <li>ক্লাব কমিটি যেকোনো সময় টুর্নামেন্টের তারিখ ও নিয়ম পরিবর্তন করার এক্তিয়ার রাখে।</li>
                </ul>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Team Info */}
        <div onClick={() => setActiveSection(1)}>
            <SectionCard title="1. Team Information" isActive={activeSection === 1}>
            <Select 
                label="Game Name"
                name="gameName"
                value={formData.gameName}
                onChange={handleChange}
                options={Object.values(GameOptions)}
                required
                error={errors.gameName}
            />
            
            <div className="relative">
                <Input 
                    label="Team Name"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    placeholder="e.g. Shadow Hunters"
                    required
                    error={errors.teamName}
                />
                <button
                    type="button"
                    onClick={handleGenerateName}
                    disabled={isGeneratingName}
                    className="absolute right-0 top-7 text-purple-600 hover:text-purple-800 text-xs font-medium flex items-center gap-1 p-2"
                    title="Generate a cool team name with AI"
                >
                    {isGeneratingName ? <Loader2 className="animate-spin w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                    <span>AI Suggest</span>
                </button>
            </div>
            </SectionCard>
        </div>

        {/* Leader Info */}
        <div onClick={() => setActiveSection(2)}>
            <SectionCard title="2. Team Leader Information" isActive={activeSection === 2}>
            <Input 
                label="Leader Name"
                name="leaderName"
                value={formData.leaderName}
                onChange={handleChange}
                required
                error={errors.leaderName}
            />
            <Input 
                label="Leader Phone Number"
                name="leaderPhone"
                type="tel"
                value={formData.leaderPhone}
                onChange={handleChange}
                required
                error={errors.leaderPhone}
                placeholder="01712345678"
            />
            <Input 
                label="Leader Email"
                name="leaderEmail"
                type="email"
                value={formData.leaderEmail}
                onChange={handleChange}
                error={errors.leaderEmail}
            />
            </SectionCard>
        </div>

        {/* Player Info */}
        <div onClick={() => setActiveSection(3)}>
            <SectionCard title="3. Player Information" description="Enter the full in-game names or real names of your squad." isActive={activeSection === 3}>
            <Input 
                label="Player 1 Name (Leader)"
                name="player1"
                value={formData.player1}
                onChange={handleChange}
                required
                disabled // Auto-filled from leader name
                className="opacity-70"
                error={errors.player1}
            />
            <Input 
                label="Player 2 Name"
                name="player2"
                value={formData.player2}
                onChange={handleChange}
                required
                error={errors.player2}
            />
            <Input 
                label="Player 3 Name"
                name="player3"
                value={formData.player3}
                onChange={handleChange}
                required
                error={errors.player3}
            />
            <Input 
                label="Player 4 Name"
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
            <SectionCard title="4. Additional Information" isActive={activeSection === 4}>
            <Input 
                label="Discord Username"
                name="discordUsername"
                value={formData.discordUsername}
                onChange={handleChange}
                placeholder="user#1234"
            />
            <Input 
                label="In-game ID / Character ID"
                name="ingameId"
                value={formData.ingameId}
                onChange={handleChange}
            />
            <Select 
                label="Payment Method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                options={Object.values(PaymentMethods)}
                required
                error={errors.paymentMethod}
            />
            <Input 
                label="Transaction ID"
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
            <SectionCard title="5. Agreement" isActive={activeSection === 5}>
            <div className={`flex items-start gap-3 p-2 rounded ${errors.agreedToRules ? 'bg-red-50' : ''}`}>
                <div className="flex items-center h-5">
                <input
                    id="agreement"
                    name="agreedToRules"
                    type="checkbox"
                    checked={formData.agreedToRules}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                </div>
                <div className="text-sm">
                <label htmlFor="agreement" className="font-medium text-gray-700">
                    I agree to the tournament rules and conditions
                </label>
                <p className="text-gray-500 text-xs mt-1">
                    By checking this box, you confirm that all information provided is accurate and you agree to abide by the official tournament handbook.
                </p>
                {errors.agreedToRules && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.agreedToRules}</p>}
                </div>
            </div>
            </SectionCard>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-between items-center py-4">
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-8 rounded shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>

            <button type="button" 
                onClick={() => {
                    setFormData(INITIAL_STATE);
                    setErrors({});
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-purple-600 hover:text-purple-800 font-medium text-sm"
            >
                Clear form
            </button>
        </div>
      </form>

      <div className="mt-8 text-center text-xs text-gray-500">
        <p>Never submit passwords through Google Forms (or this clone).</p>
        <p className="mt-2">This content is neither created nor endorsed by Google.</p>
      </div>
    </div>
  );
};
