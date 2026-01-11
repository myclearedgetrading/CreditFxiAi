
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Shield, Zap, TrendingUp, CheckCircle2, 
  Lock, PieChart, Star, ChevronRight, X, Sparkles,
  BarChart3, Smartphone, FileText, ChevronDown, 
  Users, Home, Briefcase, Building2, ShieldCheck
} from 'lucide-react';

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-800">
      <button 
        className="w-full py-6 flex justify-between items-center text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-lg text-slate-200">{question}</span>
        <ChevronDown className={`w-5 h-5 text-orange-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg group-hover:shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-shadow duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">CreditFix AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => scrollToSection('benefits')} className="hover:text-orange-400 transition-colors">Benefits</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-orange-400 transition-colors">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-orange-400 transition-colors">Pricing</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-orange-400 transition-colors">FAQ</button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-full transition-all"
            >
              Log In
            </button>
            <button 
              onClick={() => navigate('/onboarding')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(234,88,12,0.3)]"
            >
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Neon Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-600/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[80px] -z-10" />

        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-orange-400 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in shadow-sm hover:border-orange-500/50 transition-colors cursor-default">
            <Sparkles className="w-3 h-3" /> New: Metro 2 Compliance Check
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
            Reclaim Your Financial <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 drop-shadow-[0_0_25px_rgba(249,115,22,0.3)]">
              Freedom with AI
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The first automated credit repair platform that uses AI to identify legal violations and remove negative items permanently. No expensive monthly agencies.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/onboarding')}
              className="bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:bg-orange-500 hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] flex items-center justify-center gap-2 active:scale-95"
            >
              Start Repairing Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-center items-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-500" /> No Credit Card Required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-500" /> 256-bit Encryption
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-500" /> 3-Bureau Analysis
            </div>
          </div>
        </div>
        
        {/* Hero Visual Mockup */}
        <div className="mt-16 max-w-5xl mx-auto px-6 relative">
           <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 h-full w-full pointer-events-none" />
           <div className="bg-[#0A0A0A] border border-slate-800 rounded-2xl p-2 shadow-2xl shadow-orange-900/10 rotate-1 hover:rotate-0 transition-transform duration-700">
              <div className="bg-[#0F0F0F] rounded-xl overflow-hidden border border-slate-800">
                 {/* Fake Browser Bar */}
                 <div className="bg-[#151515] px-4 py-3 flex gap-2 border-b border-slate-800">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                 </div>
                 {/* Dashboard Content Mock */}
                 <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-4">
                       <div className="h-32 bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
                          <div>
                             <div className="text-sm text-slate-500 mb-1">Equifax Score</div>
                             <div className="text-4xl font-bold text-white">724 <span className="text-sm text-green-500">+42</span></div>
                          </div>
                          <div className="h-16 w-32 bg-gradient-to-t from-orange-500/20 to-transparent rounded-lg relative overflow-hidden">
                             <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
                          </div>
                       </div>
                       <div className="h-12 bg-slate-900 rounded-lg border border-slate-800 w-3/4" />
                       <div className="h-12 bg-slate-900 rounded-lg border border-slate-800 w-full" />
                    </div>
                    <div className="col-span-1 bg-slate-900 rounded-xl border border-slate-800 p-4">
                       <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 text-orange-500"><Zap /></div>
                       <div className="text-sm font-bold text-white mb-1">Dispute Ready</div>
                       <div className="text-xs text-slate-500">2 Collections Identified</div>
                       <div className="mt-4 h-8 bg-orange-600 rounded-md w-full" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </header>

      {/* --- WHAT YOU GET (Benefits) --- */}
      <section id="benefits" className="py-24 bg-[#0A0A0A] relative border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">What you get</h2>
            <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Legal Dispute Letters",
                desc: "Don't write generic letters. Our AI generates Metro 2 compliant challenges tailored to your specific situation."
              },
              {
                icon: Zap,
                title: "Instant Analysis",
                desc: "Upload your report and get a detailed breakdown of negative items and errors in under 30 seconds."
              },
              {
                icon: TrendingUp,
                title: "Score Tracking",
                desc: "Monitor your progress across Equifax, Experian, and TransUnion with real-time score updates."
              }
            ].map((item, i) => (
              <div key={i} className="bg-[#0F0F0F] p-8 rounded-2xl border border-slate-800 hover:border-orange-500/30 transition-colors group">
                <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500/10 transition-colors">
                  <item.icon className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOR WHO --- */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Who is this for?</h2>
            <p className="text-slate-400">Tailored strategies for every financial goal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-b from-[#0F0F0F] to-[#0A0A0A] p-8 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
               <div className="w-20 h-20 mx-auto bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-lg border border-slate-800">
                  <Users className="w-8 h-8 text-orange-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">The DIYer</h3>
               <p className="text-slate-400 text-sm">You want to fix your credit yourself to save money but need the right tools.</p>
            </div>

            <div className="bg-gradient-to-b from-[#0F0F0F] to-[#0A0A0A] p-8 rounded-2xl border border-slate-800 text-center relative overflow-hidden transform md:-translate-y-4 shadow-xl shadow-orange-900/5">
               <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
               <div className="w-20 h-20 mx-auto bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-lg border border-slate-800">
                  <Home className="w-8 h-8 text-orange-500" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">The Homebuyer</h3>
               <p className="text-slate-400 text-sm">You need a rapid score boost to qualify for a mortgage with better rates.</p>
            </div>

            <div className="bg-gradient-to-b from-[#0F0F0F] to-[#0A0A0A] p-8 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
               <div className="w-20 h-20 mx-auto bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-lg border border-slate-800">
                  <Briefcase className="w-8 h-8 text-orange-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">The Entrepreneur</h3>
               <p className="text-slate-400 text-sm">You're building business credit and need a clean personal profile to start.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-[#0A0A0A] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
             <h2 className="text-3xl font-bold text-white mb-4">Features you'll love</h2>
             <div className="h-1 w-10 bg-orange-500 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[
              { icon: Zap, title: "Smart Dispute Engine", desc: "Uses Metro 2 compliance logic to challenge items effectively." },
              { icon: Lock, title: "Bank-Level Security", desc: "Your data is encrypted with AES-256 and never shared." },
              { icon: BarChart3, title: "Score Simulator", desc: "See exactly how much your score will increase before you dispute." },
              { icon: Smartphone, title: "Mobile Friendly", desc: "Manage your disputes from your phone, anywhere, anytime." },
              { icon: FileText, title: "Letter Library", desc: "Access to 50+ templates for every unique credit situation." },
              { icon: PieChart, title: "Progress Dashboard", desc: "Visual tracking of deleted items across all three bureaus." }
            ].map((feat, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 group-hover:border-orange-500/50 transition-colors">
                    <feat.icon className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-2 group-hover:text-orange-400 transition-colors">{feat.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section id="reviews" className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Don't just take our word for it</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Marcus J.", score: "+127 points", quote: "I was denied for a mortgage. 4 months using CreditFix AI and I closed on my house last week!" },
              { name: "Sarah L.", score: "+95 points", quote: "Agencies quoted me $1500. I did it myself here for a fraction of the cost. The AI letters are legit." },
              { name: "David P.", score: "+60 points", quote: "Removed a 4-year old collection that wouldn't budge. The Metro 2 strategy actually works." }
            ].map((review, i) => (
              <div key={i} className="bg-[#0F0F0F] p-8 rounded-2xl border border-slate-800 relative">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-orange-500 fill-orange-500" />)}
                </div>
                <p className="text-slate-300 mb-6 italic leading-relaxed">"{review.quote}"</p>
                <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-400">
                      {review.name.charAt(0)}
                    </div>
                    <span className="font-bold text-sm text-white">{review.name}</span>
                  </div>
                  <span className="text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded text-xs border border-green-400/20">{review.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TOOLS & INTEGRATIONS --- */}
      <section className="py-16 bg-[#0A0A0A] border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
           <p className="text-center text-slate-500 text-sm font-semibold uppercase tracking-widest mb-10">Works with all major bureaus & providers</p>
           <div className="flex flex-wrap justify-center gap-12 lg:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Simple Text Logos for Demo */}
              <div className="flex items-center gap-2 text-xl font-bold text-slate-300"><Shield className="w-6 h-6" /> IdentityIQ</div>
              <div className="flex items-center gap-2 text-xl font-bold text-slate-300"><ShieldCheck className="w-6 h-6" /> SmartCredit</div>
              <div className="flex items-center gap-2 text-xl font-bold text-slate-300"><Building2 className="w-6 h-6" /> Equifax</div>
              <div className="flex items-center gap-2 text-xl font-bold text-slate-300"><Building2 className="w-6 h-6" /> Experian</div>
              <div className="flex items-center gap-2 text-xl font-bold text-slate-300"><Building2 className="w-6 h-6" /> TransUnion</div>
           </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
             <p className="text-slate-400">Invest in your future for less than a coffee a day.</p>
          </div>

          <div className="bg-[#0A0A0A] rounded-3xl p-1 overflow-hidden border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* The "Other Guys" */}
              <div className="p-12 text-center md:text-left bg-[#080808]">
                <h3 className="text-xl font-bold mb-2 text-slate-400">Traditional Agencies</h3>
                <div className="text-4xl font-bold text-slate-500 mb-6 line-through decoration-red-500 decoration-2">$129<span className="text-lg font-normal">/mo</span></div>
                <ul className="space-y-4 text-slate-500 mb-8">
                  <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-900" /> High monthly retainer</li>
                  <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-900" /> Slow manual process</li>
                  <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-900" /> Intentionally dragged out</li>
                  <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-900" /> Hard to cancel</li>
                </ul>
              </div>

              {/* CreditFix AI */}
              <div className="p-12 bg-gradient-to-br from-orange-900/20 to-[#0A0A0A] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg">RECOMMENDED</div>
                <div className="absolute inset-0 border-l border-slate-800 md:block hidden" />
                
                <h3 className="text-xl font-bold mb-2 text-white">CreditFix AI</h3>
                <div className="flex items-end gap-2 mb-6">
                  <div className="text-5xl font-bold text-white">$29</div>
                  <span className="text-lg text-slate-400 mb-2">/mo</span>
                </div>
                <p className="text-sm text-slate-400 mb-8">Cancel anytime. 30-day money-back guarantee.</p>
                <ul className="space-y-4 text-white mb-8">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Unlimited Disputes</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-orange-500" /> 3-Bureau Analysis</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Instant Letter Generation</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Score Tracking</li>
                </ul>
                <button 
                  onClick={() => navigate('/onboarding')}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all hover:scale-[1.02]"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-24 bg-[#0A0A0A] border-t border-slate-900">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-2">
            <FaqItem 
              question="Is my data safe?" 
              answer="Absolutely. We use bank-level AES-256 encryption to protect your personal information. We never sell your data to third parties." 
            />
            <FaqItem 
              question="How fast will I see results?" 
              answer="Many users see their first deletions within 30-45 days, which is the standard investigation period for credit bureaus. Score improvements follow shortly after." 
            />
            <FaqItem 
              question="Can I cancel anytime?" 
              answer="Yes. There are no long-term contracts. You can cancel your subscription instantly from your dashboard settings." 
            />
            <FaqItem 
              question="Do you guarantee results?" 
              answer="While no company can legally guarantee specific score increases, we offer a 30-day money-back guarantee if you're not satisfied with our platform's capabilities." 
            />
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 px-6 text-center bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl lg:text-6xl font-bold mb-8 tracking-tight text-white">
            Ready to reclaim your <br />
            <span className="text-orange-500">financial future?</span>
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button 
               onClick={() => navigate('/onboarding')}
               className="bg-white text-orange-900 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-slate-100 transition-all hover:-translate-y-1"
             >
               Start Your Repair
             </button>
          </div>
          <p className="mt-6 text-sm text-slate-500">No credit card required for analysis.</p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#020202] border-t border-slate-900 py-16 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
               <div className="bg-orange-600 p-1.5 rounded-lg">
                 <Shield className="w-5 h-5 text-white" />
               </div>
               <span className="text-xl font-bold text-white">CreditFix AI</span>
            </div>
            <p className="max-w-xs leading-relaxed text-slate-400">
              Empowering consumers to take control of their financial destiny through advanced AI technology and automation.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Product</h4>
            <ul className="space-y-4">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-orange-500 transition-colors">Features</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-orange-500 transition-colors">Pricing</button></li>
              <li><button onClick={() => scrollToSection('reviews')} className="hover:text-orange-500 transition-colors">Success Stories</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-orange-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2024 CreditFix AI. All rights reserved.</p>
          <div className="flex gap-6">
             <a href="#" className="hover:text-white transition-colors">Twitter</a>
             <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
             <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
