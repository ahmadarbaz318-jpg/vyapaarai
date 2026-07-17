import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiZap, FiBox, FiBarChart2, FiCpu, FiShoppingCart, FiBell, FiArrowRight, FiCheck,
  FiTrendingUp, FiStar, FiChevronDown, FiPlayCircle,
} from 'react-icons/fi';

const features = [
  { icon: FiBox, title: 'Smart Inventory', desc: 'Track stock levels, get low-stock alerts, and never run out of your best sellers again.', color: 'from-blue-500 to-sky-400' },
  { icon: FiShoppingCart, title: 'One-Tap Sales', desc: 'Record sales in seconds with auto-calculated totals, profit, and invoice numbers.', color: 'from-teal-500 to-emerald-400' },
  { icon: FiBarChart2, title: 'Live Analytics', desc: 'See daily, weekly, and monthly trends with beautiful charts that actually make sense.', color: 'from-indigo-500 to-blue-400' },
  { icon: FiCpu, title: 'AI Business Advisor', desc: 'Ask Gemini-powered AI what to restock, how to boost profit, and why sales dipped.', color: 'from-sky-500 to-cyan-400' },
  { icon: FiBell, title: 'Low Stock Alerts', desc: 'Automatic notifications the moment any product falls below your set threshold.', color: 'from-amber-500 to-orange-400' },
  { icon: FiTrendingUp, title: 'Growth Insights', desc: 'Understand your best and worst sellers, and where your money is really coming from.', color: 'from-emerald-500 to-teal-400' },
];

const stats = [
  { value: '10,000+', label: 'Shops digitized' },
  { value: '₹2Cr+', label: 'Sales tracked' },
  { value: '4.9/5', label: 'Owner rating' },
  { value: '5 min', label: 'To get started' },
];

const testimonials = [
  { name: 'Rahul Sharma', shop: 'Sharma General Store, Kolkata', text: 'I finally know which products make me money. The AI advisor told me to restock oil before I even noticed it was low.', rating: 5 },
  { name: 'Anjali Mehta', shop: 'Mehta Medical Store, Pune', text: 'Setup took ten minutes and I have zero technical background. My billing is faster and my stock count is finally accurate.', rating: 5 },
  { name: 'Suresh Iyer', shop: 'Iyer Stationery, Chennai', text: 'The analytics page showed me my slow-moving stock instantly. I cleared it out and freed up real cash.', rating: 5 },
];

const faqs = [
  { q: 'Do I need any technical knowledge to use Vyapaar AI?', a: 'None at all. Vyapaar AI is built specifically for shop owners with no technical background — if you can use WhatsApp, you can use Vyapaar AI.' },
  { q: 'What kind of businesses is this for?', a: 'Grocery shops, pharmacies, cafes, clothing stores, stationery shops, hardware stores, and pretty much any local retail business that sells physical products.' },
  { q: 'How does the AI Business Advisor work?', a: 'It looks at your real sales and inventory data and answers questions like what to restock, how to increase profit, or why sales dropped — powered by Google Gemini.' },
  { q: 'Is my business data secure?', a: 'Yes. Every account is protected with encrypted passwords and secure authentication, and your data is only ever visible to you.' },
  { q: 'Can I use this on my phone?', a: 'Absolutely — Vyapaar AI is fully responsive and works smoothly on mobile, tablet, and desktop.' },
];

function FAQItem({ faq, isOpen, onClick }) {
  return (
    <div className="border-b border-slate-100 py-5">
      <button onClick={onClick} className="w-full flex items-center justify-between text-left">
        <span className="font-semibold text-slate-800 pr-6">{faq.q}</span>
        <FiChevronDown className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="text-slate-500 text-sm leading-relaxed pt-3 pr-6">{faq.a}</p>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white">
              <FiZap />
            </div>
            <span className="font-bold text-lg text-slate-800">Vyapaar<span className="text-primary">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-primary transition">Features</a>
            <a href="#ai" className="hover:text-primary transition">AI Advisor</a>
            <a href="#testimonials" className="hover:text-primary transition">Testimonials</a>
            <a href="#faq" className="hover:text-primary transition">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition hidden sm:block">Log in</Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2.5">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-36 pb-24 bg-gradient-hero overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-teal-200 text-xs font-semibold mb-6">
                <FiZap /> Powered by Gemini AI
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">Your AI Business Manager</h1>
              <p className="text-blue-100 text-lg mt-5 leading-relaxed max-w-lg">
                Manage inventory, track sales, predict growth and grow your business with AI — built for shop owners, not tech experts.
              </p>
              <div className="flex flex-wrap gap-4 mt-9">
                <Link to="/register" className="btn-primary px-7 py-3.5 flex items-center gap-2">
                  Get Started <FiArrowRight />
                </Link>
                <a href="#features" className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition border border-white/10">
                  <FiPlayCircle /> Watch Demo
                </a>
              </div>
              <div className="flex items-center gap-6 mt-10">
                {stats.slice(0, 3).map((s) => (
                  <div key={s.label}>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                    <p className="text-blue-200 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
              <div className="glass-dark rounded-2xl p-6 shadow-2xl float-anim">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-white font-semibold">Today's Overview</p>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300">Live</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-blue-200 text-xs">Revenue</p>
                    <p className="text-white text-xl font-bold mt-1">₹8,420</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-blue-200 text-xs">Profit</p>
                    <p className="text-white text-xl font-bold mt-1">₹2,180</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 flex items-end gap-1.5 h-24">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-teal-400 to-sky-400" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 bg-white/5 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center text-white text-sm shrink-0">
                    <FiCpu />
                  </div>
                  <p className="text-xs text-blue-100">"Restock Sunflower Oil — only 8 units left."</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold gradient-text">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider">Everything you need</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-3">Run your entire shop from one screen</h2>
          <p className="text-slate-500 mt-4">From billing to business advice, Vyapaar AI replaces your notebooks and guesswork with a system that actually works for you.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="card p-7"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white text-xl shadow-lg mb-5`}>
                <f.icon />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">{f.title}</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-primary font-semibold text-sm uppercase tracking-wider">AI Business Advisor</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-3">Ask it anything about your business</h2>
            <p className="text-slate-500 mt-4 leading-relaxed">Powered by Google's Gemini, your AI advisor reads your real sales and inventory data to give you specific, actionable answers — not generic tips.</p>
            <div className="mt-8 space-y-4">
              {[
                'How can I increase profit?',
                'Which products should I restock?',
                'Why are sales decreasing?',
                'Suggest marketing ideas for my shop.',
              ].map((q) => (
                <div key={q} className="flex items-center gap-3 text-sm font-medium text-slate-700 bg-white card px-4 py-3">
                  <FiCheck className="text-success shrink-0" /> {q}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="card p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center text-white">
                <FiCpu />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">Vyapaar AI Advisor</p>
                <p className="text-xs text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="bg-slate-50 rounded-2xl rounded-tl-sm p-3.5 text-sm text-slate-600 max-w-[85%]">Which products should I restock this week?</div>
              <div className="bg-gradient-primary rounded-2xl rounded-tr-sm p-3.5 text-sm text-white max-w-[90%] ml-auto leading-relaxed">
                Based on your data: restock <strong>Sunflower Oil</strong> (8 left) and <strong>Coffee Powder</strong> (6 left) — both are among your fastest sellers this month.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider">Loved by shop owners</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-3">Real results for real shops</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-7">
              <div className="flex gap-1 text-warning mb-4">
                {[...Array(t.rating)].map((_, j) => <FiStar key={j} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                  <p className="text-slate-400 text-xs">{t.shop}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-3">Frequently asked questions</h2>
          </motion.div>
          <div className="card px-7">
            {faqs.map((faq, i) => (
              <FAQItem key={faq.q} faq={faq} isOpen={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-hero rounded-3xl px-8 py-16 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-teal-400/20 blur-3xl" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white relative z-10">Ready to digitize your shop?</h2>
          <p className="text-blue-100 mt-4 max-w-xl mx-auto relative z-10">Join thousands of shop owners already using Vyapaar AI to manage inventory, sales, and growth.</p>
          <Link to="/register" className="btn-primary px-8 py-3.5 inline-flex items-center gap-2 mt-8 relative z-10">
            Get Started Free <FiArrowRight />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white text-sm">
              <FiZap />
            </div>
            <span className="font-bold text-slate-800">Vyapaar<span className="text-primary">AI</span></span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 Vyapaar AI. Built for small business owners, everywhere.</p>
          <div className="flex gap-5 text-slate-400 text-sm">
            <a href="#features" className="hover:text-primary transition">Features</a>
            <a href="#faq" className="hover:text-primary transition">FAQ</a>
            <Link to="/login" className="hover:text-primary transition">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
