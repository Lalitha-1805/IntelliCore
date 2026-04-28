import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Shield, Zap, BarChart3, ArrowRight, Lock, CheckCircle, Database, Server, Globe } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-brand-bg text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-brand-bg via-brand-primary/20 to-brand-accent/20 blur-[180px] rounded-full -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-r from-brand-border/20 via-brand-primary/10 to-transparent blur-[150px] rounded-full -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-gradient-to-r from-brand-bg via-brand-surface/20 to-brand-border/10 blur-[150px] rounded-full -z-10 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="bg-brand-bg/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl flex items-center justify-center shadow-lg neon-glow">
              <Shield className="text-white" size={22} />
            </div>
            <span className="text-2xl font-black tracking-tighter italic">Intelli<span className="text-brand-accent font-light italic">Core</span></span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="relative group px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-primary to-brand-accent text-white overflow-hidden shadow-lg neon-glow neon-glow-hover transition-all hover:scale-105">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 text-center px-6">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-3 glass-card border border-brand-border/50/50 px-5 py-2 rounded-full mb-10 shadow-lg backdrop-blur-sm transition-all hover:bg-brand-surface/60 hover:border-gray-600">
             <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(192,38,211,0.8)]"></div>
             <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300">IntelliCore Enterprise Architecture</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
            <span className="bg-gradient-to-br from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Enterprise Intelligence.</span> <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-hover to-brand-accent">Secured Context.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            The ultimate Knowledge Management System with strict RAG isolation. 
            Empower your workforce with AI that knows exactly what they're allowed to see.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link to="/signup" className="group relative bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl neon-glow neon-glow-hover flex items-center gap-3 hover:-translate-y-1">
              Explore Your Portal <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="glass-card px-10 py-5 rounded-2xl font-black text-lg transition-all hover:-translate-y-1 flex items-center gap-2 hover:bg-brand-surface/60">
              <Lock size={20} className="text-brand-accent" /> Existing Employee
            </Link>
          </div>
        </div>
      </section>



      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
         <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white">Engineered for the Enterprise</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Bank-grade security meets state-of-the-art language models. Built for organizations that cannot compromise on privacy.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 glass-card backdrop-blur-md border border-brand-border/50/50 rounded-[2rem] hover:bg-brand-surface/40 hover:border-brand-primary/50 transition-all duration-300 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-brand-primary/20 transition-all"></div>
               <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg neon-glow group-hover:scale-110 transition-all duration-300">
                  <Shield size={32} />
               </div>
               <h3 className="text-2xl font-bold mb-4 text-white">Walled-Garden RAG</h3>
               <p className="text-gray-400 font-medium leading-relaxed">
                  Contextual embeddings filtered by Department and Role before inference. True zero-leakage architecture ensuring absolute data isolation.
               </p>
               <ul className="mt-6 space-y-2 text-sm text-gray-300 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-brand-primary" /> Role-based access control</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-brand-primary" /> Department siloing</li>
               </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 glass-card backdrop-blur-md border border-brand-border/50/50 rounded-[2rem] hover:bg-brand-surface/40 hover:border-brand-primary/50 transition-all duration-300 group relative overflow-hidden md:-translate-y-4">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-brand-primary/20 transition-all"></div>
               <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg neon-glow group-hover:scale-110 transition-all duration-300">
                  <Zap size={32} />
               </div>
               <h3 className="text-2xl font-bold mb-4 text-white">Modular Tools (MCP)</h3>
               <p className="text-gray-400 font-medium leading-relaxed">
                  Extensible AI toolchains for Analysis, Summarization, Translation, and custom enterprise workflows integrated seamlessly.
               </p>
               <ul className="mt-6 space-y-2 text-sm text-gray-300 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-brand-primary" /> Pluggable architecture</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-brand-primary" /> Custom workflow pipelines</li>
               </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 glass-card backdrop-blur-md border border-brand-border/50/50 rounded-[2rem] hover:bg-brand-surface/40 hover:border-brand-primary/50 transition-all duration-300 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-brand-primary/20 transition-all"></div>
               <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg neon-glow group-hover:scale-110 transition-all duration-300">
                  <BarChart3 size={32} />
               </div>
               <h3 className="text-2xl font-bold mb-4 text-white">Audit Transparency</h3>
               <p className="text-gray-400 font-medium leading-relaxed">
                  Real-time pipeline logs showing confidence scores, latency metrics, and retrieved context citations for every single response.
               </p>
               <ul className="mt-6 space-y-2 text-sm text-gray-300 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-brand-primary" /> Complete observability</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-brand-primary" /> Immutable audit logs</li>
               </ul>
            </div>
         </div>
      </section>

       {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 relative z-10 mb-20">
         <div className="relative glass-card border-brand-primary/30 rounded-[3rem] p-12 md:p-20 text-center overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="relative z-10">
               <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to transform your knowledge base?</h2>
               <p className="text-xl text-brand-accent/80 mb-10 max-w-2xl mx-auto">Join the forward-thinking enterprises that trust IntelliCore to secure and accelerate their AI initiatives.</p>
               <Link to="/signup" className="inline-flex bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white px-12 py-5 rounded-2xl font-black text-lg transition-all shadow-xl neon-glow neon-glow-hover hover:scale-105 items-center gap-3">
                  Explore IntelliCore <ArrowRight size={20} />
               </Link>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center relative z-10 bg-brand-bg">
        <div className="flex justify-center items-center gap-2 mb-6 opacity-50">
           <Shield size={20} className="text-brand-primary" />
           <span className="font-bold tracking-widest text-lg">Intelli<span className="font-light">Core</span></span>
        </div>
        <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">
          &copy; {new Date().getFullYear()} IntelliCore • Standardized Intel Architecture
        </p>
      </footer>
    </div>
  );
}





