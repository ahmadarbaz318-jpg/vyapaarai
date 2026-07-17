import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiSend, FiUser, FiZap } from 'react-icons/fi';
import Layout from '../components/Layout.jsx';
import api from '../api/axios.js';

export default function AIAdvisor() {
  const [questions, setQuestions] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your AI Business Advisor. I've looked at your sales and inventory data — ask me anything about restocking, profit, marketing, or trends." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    api.get('/ai/suggested-questions').then((res) => setQuestions(res.data.questions));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const question = text || input;
    if (!question.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/ask', { question });
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', text: "Sorry, I couldn't process that right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="AI Advisor" subtitle="Get personalized business advice powered by Gemini">
      <div className="card flex flex-col h-[calc(100vh-13rem)] lg:h-[calc(100vh-11rem)]">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center text-white">
            <FiCpu />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Vyapaar AI Advisor</p>
            <p className="text-xs text-emerald-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Grounded in your live business data</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${m.role === 'user' ? 'bg-slate-700' : 'bg-gradient-accent'}`}>
                {m.role === 'user' ? <FiUser className="text-sm" /> : <FiZap className="text-sm" />}
              </div>
              <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                m.role === 'user' ? 'bg-gradient-primary text-white rounded-tr-sm' : 'bg-slate-50 text-slate-700 rounded-tl-sm'
              }`}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center text-white shrink-0"><FiZap className="text-sm" /></div>
              <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3.5 flex gap-1.5">
                {[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && questions.length > 0 && (
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {questions.map((q) => (
              <button key={q} onClick={() => sendMessage(q)} className="text-xs font-medium px-3.5 py-2 rounded-full bg-blue-50 text-primary hover:bg-blue-100 transition">
                {q}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-3 border-t border-slate-100 px-6 py-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about profit, restocking, marketing..."
            className="input-field flex-1"
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary w-11 h-11 flex items-center justify-center shrink-0 disabled:opacity-50">
            <FiSend />
          </button>
        </form>
      </div>
    </Layout>
  );
}
