
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Shield, Zap, TrendingUp, CheckCircle2, 
  Lock, PieChart, Star, ChevronRight, X, Sparkles,
  BarChart3, Smartphone, FileText
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">CreditFix AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block"
            >
              Log In
            </button>
            <button 
              onClick={() => navigate('/onboarding')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-lg shadow-indigo-500/25"
            >
              Start Free Analysis
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
              <Sparkles className="w-3 h-3" /> AI-Powered Credit Repair
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              Fix Your Credit <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                With AI Precision
              </span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
              Stop paying expensive agencies monthly fees to do nothing. Our AI analyzes your report, identifies errors, and generates legal dispute letters instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/onboarding')}
                className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2"
              >
                Start Repairing Now <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 rounded-full font-bold text-lg border border-slate-700 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> See How It Works
              </button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {String.fromCharCode(64+i)}
                  </div>
                ))}
              </div>
              <p>Trusted by 10,000+ users</p>
            </div>
          </div>

          {/* Hero Visual - Dashboard Mockup */}
          <div className="relative mx-auto lg:ml-auto w-full max-w-lg">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl blur-2xl opacity-40 animate-pulse" />
            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
              {/* Fake UI Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="h-2 w-24 bg-slate-700 rounded mb-2" />
                  <div className="h-2 w-16 bg-slate-700 rounded" />
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-700" />
              </div>
              
              {/* Score Circle */}
              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                    <circle cx="96" cy="96" r="88" stroke="#6366f1" strokeWidth="12" fill="transparent" strokeDasharray="400 552" strokeLinecap="round" />
                  </svg>
                  <div className="text-center">
                    <span className="text-5xl font-bold text-white">724</span>
                    <div className="text-green-400 text-sm font-bold flex items-center justify-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" /> +42 pts
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {[
                  { name: 'Chase Bank', status: 'DELETED', color: 'text-green-400', bg: 'bg-green-400/10' },
                  { name: 'Midland Credit', status: 'DELETED', color: 'text-green-400', bg: 'bg-green-400/10' },
                  { name: 'Capital One', status: 'DISPUTED', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-medium">{item.name}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${item.color} ${item.bg}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -right-6 top-10 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="bg-green-500/20 p-2 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="font-bold text-white">Item Removed</p>
                <p className="text-xs text-slate-400">Just now</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- PROBLEM / SOLUTION --- */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h2 className="text-3xl font-bold mb-4">Why the old way <br /> is broken.</h2>
              <p className="text-slate-400">
                Traditional credit repair is slow, expensive, and opaque. You pay monthly fees regardless of results.
              </p>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Expensive Agencies</h3>
                <p className="text-sm text-slate-400">They charge $100-$150/month and drag out the process to keep you paying.</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">The AI Advantage</h3>
                <p className="text-sm text-slate-400">Our AI identifies violations instantly and drafts legal letters in seconds, not months.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">Repair your credit in <br /><span className="text-indigo-400">3 Simple Steps</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">No legal knowledge required. Our guided process makes it easy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-800 -z-10" />

            {[
              { 
                icon: FileText, 
                step: "01", 
                title: "Upload Report", 
                desc: "Import your 3-bureau credit report. Our AI reads it instantly to find negative items." 
              },
              { 
                icon: Sparkles, 
                step: "02", 
                title: "AI Analysis", 
                desc: "We identify errors and FCRA violations, then generate custom dispute letters." 
              },
              { 
                icon: TrendingUp, 
                step: "03", 
                title: "Mail & Track", 
                desc: "Send the letters (or let us do it). Track deletions and watch your score rise." 
              }
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-slate-900 border-4 border-slate-800 rounded-full flex items-center justify-center mb-6 z-10 shadow-xl">
                  <item.icon className="w-10 h-10 text-indigo-500" />
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 w-full hover:border-indigo-500/50 transition-colors">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Step {item.step}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
             <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need to <br />win against the bureaus.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Smart Dispute Engine", desc: "Uses Metro 2 compliance logic to challenge items effectively." },
              { icon: Lock, title: "Bank-Level Security", desc: "Your data is encrypted with AES-256 and never shared." },
              { icon: BarChart3, title: "Score Simulator", desc: "See exactly how much your score will increase before you dispute." },
              { icon: Smartphone, title: "Mobile Friendly", desc: "Manage your disputes from your phone, anywhere, anytime." },
              { icon: FileText, title: "Letter Library", desc: "Access to 50+ templates for every unique credit situation." },
              { icon: PieChart, title: "Progress Dashboard", desc: "Visual tracking of deleted items across all three bureaus." }
            ].map((feat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors group">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                  <feat.icon className="w-6 h-6 text-indigo-400 group-hover:text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF --- */}
      <section id="reviews" className="py-24 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Real Results from Real People</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Marcus J.", score: "+127 points", quote: "I was denied for a mortgage. 4 months using CreditFix AI and I closed on my house last week!" },
              { name: "Sarah L.", score: "+95 points", quote: "Agencies quoted me $1500. I did it myself here for a fraction of the cost. The AI letters are legit." },
              { name: "David P.", score: "+60 points", quote: "Removed a 4-year old collection that wouldn't budge. The Metro 2 strategy actually works." }
            ].map((review, i) => (
              <div key={i} className="bg-slate-950 p-8 rounded-2xl border border-slate-800 relative">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-slate-300 mb-6 italic">"{review.quote}"</p>
                <div className="flex justify-between items-center border-t border-slate-900 pt-4">
                  <span className="font-bold">{review.name}</span>
                  <span className="text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded text-xs">{review.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-800 rounded-3xl p-1 overflow-hidden border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* The "Other Guys" */}
              <div className="p-8 md:p-12 text-center md:text-left opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <h3 className="text-xl font-bold mb-2">Traditional Agencies</h3>
                <div className="text-3xl font-bold text-slate-400 mb-6">$129<span className="text-lg font-normal">/mo</span></div>
                <ul className="space-y-4 text-slate-400 mb-8">
                  <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-500" /> High monthly retainer</li>
                  <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-500" /> Slow manual process</li>
                  <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-500" /> Intentionally dragged out</li>
                  <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-500" /> Hard to cancel</li>
                </ul>
              </div>

              {/* CreditFix AI */}
              <div className="p-8 md:p-12 bg-indigo-900/20 rounded-2xl border border-indigo-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
                <h3 className="text-xl font-bold mb-2 text-white">CreditFix AI</h3>
                <div className="flex items-end gap-2 mb-6">
                  <div className="text-5xl font-bold text-white">$29</div>
                  <span className="text-lg text-slate-400 mb-2">/mo</span>
                </div>
                <p className="text-sm text-indigo-200 mb-8">Cancel anytime. 30-day money-back guarantee.</p>
                <ul className="space-y-4 text-white mb-8">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Unlimited Disputes</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> 3-Bureau Analysis</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Instant Letter Generation</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Score Tracking</li>
                </ul>
                <button 
                  onClick={() => navigate('/onboarding')}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-[1.02]"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 blur-[100px] opacity-20 -z-10" />
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">Ready to reclaim your <br />financial future?</h2>
          <p className="text-xl text-slate-400 mb-10">Join thousands of Americans fixing their credit today.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button 
               onClick={() => navigate('/onboarding')}
               className="bg-white text-indigo-900 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
             >
               Start Your Repair
             </button>
          </div>
          <p className="mt-6 text-sm text-slate-500">No credit card required for analysis.</p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
               <Shield className="w-6 h-6 text-indigo-500" />
               <span className="text-lg font-bold text-white">CreditFix AI</span>
            </div>
            <p className="max-w-xs">Empowering consumers to take control of their financial destiny through AI technology.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-indigo-400">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400">Success Stories</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-indigo-400">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-900 text-center">
          &copy; 2024 CreditFix AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
