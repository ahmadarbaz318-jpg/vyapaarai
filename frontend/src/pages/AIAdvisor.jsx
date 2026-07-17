import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiSend, FiUser, FiZap, FiMessageSquare, FiShare2, FiCopy, FiCheck, FiTrendingUp } from 'react-icons/fi';
import Layout from '../components/Layout.jsx';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function AIAdvisor() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'campaign'
  const [questions, setQuestions] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your AI Business Advisor. I've looked at your sales and inventory data — ask me anything about restocking, profit, marketing, or trends." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Campaign generator states
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('Discount Offer');
  const [discount, setDiscount] = useState('10%');
  const [customGoal, setCustomGoal] = useState('');
  const [generatedCampaign, setGeneratedCampaign] = useState('');
  const [generatingCampaign, setGeneratingCampaign] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/ai/suggested-questions').then((res) => setQuestions(res.data.questions));
    // Fetch products list for campaign generator
    api.get('/products', { params: { limit: 100 } }).then((res) => {
      setProducts(res.data.products || []);
      if (res.data.products?.length > 0) {
        setSelectedProduct(res.data.products[0].name);
      }
    });
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

  const handleGenerateCampaign = async () => {
    setGeneratingCampaign(true);
    setGeneratedCampaign('');
    
    const goalText = campaignGoal === 'Other' ? customGoal : campaignGoal;
    const prompt = `Write a high-converting, creative marketing WhatsApp broadcast message.
Business Details: Shop name is "${user?.business_name || 'our shop'}", owned by "${user?.owner_name || 'us'}".
Goal: Promote "${selectedProduct}" for "${goalText}".
Offer/Details: "${discount} discount/offer".
Format instructions:
- Write it in a highly engaging "Hinglish" style (Hindi written in English alphabets) which local customers find friendly and natural.
- Keep it under 150 words.
- Use spacing, line breaks, and emojis (like 🛒, 🎉, 🚀) to make it visually attractive.
- Clearly call out the offer/benefit.
- End with a friendly greeting and call to action to visit the shop.`;

    try {
      const { data } = await api.post('/ai/ask', { question: prompt });
      // Remove any system prefixes if present
      let cleanResponse = data.answer;
      if (cleanResponse.includes(':')) {
        const parts = cleanResponse.split(':');
        if (parts[0].toLowerCase().includes('here') || parts[0].toLowerCase().includes('message')) {
          cleanResponse = parts.slice(1).join(':').trim();
        }
      }
      setGeneratedCampaign(cleanResponse);
      toast.success('Campaign message generated!');
    } catch (err) {
      toast.error('Failed to generate campaign. Please try again.');
      // Local fallback template
      setGeneratedCampaign(`🎉 *Special Offer from ${user?.business_name || 'Sharma General Store'}!* 🎉\n\nNamaste customers, hum aapke liye laye hain special deal on *${selectedProduct}*!\n\nAbhi purchase karne par paiye flat *${discount}* off! 🤑\n\nStock limited hai, toh aaj hi shop par visit karein ya order kijiye.\n\nWarm regards,\n*${user?.owner_name || 'Rahul Sharma'}*\n${user?.business_name || 'Sharma General Store'} 🛒`);
    } finally {
      setGeneratingCampaign(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCampaign);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(generatedCampaign)}`;
    window.open(url, '_blank');
  };

  return (
    <Layout title="AI Growth Hub" subtitle="AI tools to grow your business, sales, and customer engagement">
      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition ${
            activeTab === 'chat'
              ? 'border-b-2 border-primary text-primary'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FiMessageSquare /> AI Business Advisor
        </button>
        <button
          onClick={() => setActiveTab('campaign')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition ${
            activeTab === 'campaign'
              ? 'border-b-2 border-primary text-primary'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FiTrendingUp /> WhatsApp Campaign Generator
        </button>
      </div>

      {activeTab === 'chat' ? (
        <div className="card flex flex-col h-[calc(100vh-16rem)] lg:h-[calc(100vh-14rem)]">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center text-white">
              <FiCpu />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Vyapaar AI Advisor</p>
              <p className="text-xs text-emerald-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Grounded in your live business data</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${m.role === 'user' ? 'bg-slate-700' : 'bg-gradient-accent'}`}>
                  {m.role === 'user' ? <FiUser className="text-sm" /> : <FiZap className="text-sm" />}
                </div>
                <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'user' ? 'bg-gradient-primary text-white rounded-tr-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center text-white shrink-0"><FiZap className="text-sm" /></div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3.5 flex gap-1.5">
                  {[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && questions.length > 0 && (
            <div className="px-6 pb-3 flex flex-wrap gap-2">
              {questions.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} className="text-xs font-medium px-3.5 py-2 rounded-full bg-blue-50 text-primary hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition">
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about profit, restocking, marketing..."
              className="input-field flex-1 text-sm"
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary w-11 h-11 flex items-center justify-center shrink-0 disabled:opacity-50">
              <FiSend />
            </button>
          </form>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls Card */}
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center text-white"><FiTrendingUp /></div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">AI Campaign Configurator</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Select Target Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="input-field text-sm"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.quantity} left)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Campaign Type</label>
                <select
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="Discount Offer">Discount Offer (Discounts & Bargains)</option>
                  <option value="Festive Greeting">Festive Greeting (Holi, Diwali Special)</option>
                  <option value="Weekly Special">Weekly Special (Stock Clearout)</option>
                  <option value="New Arrivals">New Arrivals (Fresh Stock Arrival)</option>
                  <option value="Other">Custom Reason...</option>
                </select>
              </div>

              {campaignGoal === 'Other' && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Specify Custom Campaign Goal</label>
                  <input
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="e.g. Clearance sale, Buy 1 Get 1"
                    className="input-field text-sm"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Discount / Offer Detail</label>
                <input
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="e.g. 10% Off, Buy 1 Get 1 Free, ₹50 Discount"
                  className="input-field text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateCampaign}
                disabled={generatingCampaign || !selectedProduct}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60 font-semibold"
              >
                <FiCpu className="animate-spin" style={{ animationDuration: generatingCampaign ? '2s' : '0s' }} />
                {generatingCampaign ? 'Generating AI Campaign...' : 'Generate Marketing Message'}
              </button>
            </div>
          </div>

          {/* Results Card */}
          <div className="card p-6 flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                📋 Generated WhatsApp Message
              </h3>
              
              {generatedCampaign ? (
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
                  {generatedCampaign}
                </div>
              ) : (
                <div className="h-48 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-center p-4">
                  <FiCpu className="text-3xl mb-3 text-slate-300 animate-pulse" />
                  <p className="text-xs">Configure the fields on the left and click Generate to create an engaging WhatsApp marketing template.</p>
                </div>
              )}
            </div>

            {generatedCampaign && (
              <div className="grid grid-cols-2 gap-3 mt-5">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 font-semibold py-2.5 rounded-xl text-slate-600 dark:text-slate-200 text-sm transition"
                >
                  {copied ? <FiCheck className="text-success" /> : <FiCopy />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd59] text-white font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  <FiShare2 />
                  Share on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
