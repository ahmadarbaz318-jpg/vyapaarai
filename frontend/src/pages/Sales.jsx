import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiShoppingCart, FiCheckCircle, FiMic, FiMicOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Layout from '../components/Layout.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import api from '../api/axios.js';

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [submitting, setSubmitting] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/products', { params: { search, limit: 20 } }).then((res) => setProducts(res.data.products)).finally(() => setLoading(false));
  }, [search]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.error(`Only ${product.quantity} units of ${product.name} available.`);
          return prev;
        }
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1, maxQty: product.quantity }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart((prev) => prev.map((i) => {
      if (i.productId !== productId) return i;
      const newQty = i.quantity + delta;
      if (newQty > i.maxQty) { toast.error('Not enough stock available.'); return i; }
      return { ...i, quantity: Math.max(1, newQty) };
    }));
  };

  const removeFromCart = (productId) => setCart((prev) => prev.filter((i) => i.productId !== productId));

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) { toast.error('Add at least one product to the cart.'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/sales', {
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customerName: customerName || 'Walk-in Customer',
        paymentMethod,
      });
      toast.success('Sale recorded successfully!');
      setLastInvoice(data.sale);
      setCart([]);
      setCustomerName('');
      api.get('/products', { params: { search, limit: 20 } }).then((res) => setProducts(res.data.products));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record sale.');
    } finally {
      setSubmitting(false);
    }
  };

  const parseVoiceCommand = (text) => {
    const cleanText = text.toLowerCase();
    
    // Check for utility commands
    if (cleanText.includes('clear') || cleanText.includes('hatao sab') || cleanText.includes('reset')) {
      setCart([]);
      toast.success("Cart cleared.");
      return;
    }
    
    if (cleanText.includes('checkout') || cleanText.includes('complete') || cleanText.includes('bill generate') || cleanText.includes('done') || cleanText.includes('bhugtan')) {
      handleCheckout();
      return;
    }
    
    let isRemove = cleanText.includes('remove') || cleanText.includes('hatao') || cleanText.includes('delete');
    
    // Match numbers in text
    let quantity = 1;
    const numberMatches = cleanText.match(/\d+/);
    if (numberMatches) {
      quantity = parseInt(numberMatches[0]);
    } else {
      if (cleanText.includes('one') || cleanText.includes('ek')) quantity = 1;
      else if (cleanText.includes('two') || cleanText.includes('do')) quantity = 2;
      else if (cleanText.includes('three') || cleanText.includes('teen')) quantity = 3;
      else if (cleanText.includes('four') || cleanText.includes('chaar')) quantity = 4;
      else if (cleanText.includes('five') || cleanText.includes('paanch')) quantity = 5;
    }
    
    // Match product name
    const foundProduct = products.find(p => {
      const name = p.name.toLowerCase();
      return cleanText.includes(name) || name.split(' ').some(word => word.length > 2 && cleanText.includes(word));
    });
    
    if (foundProduct) {
      if (isRemove) {
        removeFromCart(foundProduct.id);
        toast.success(`Removed ${foundProduct.name} from cart.`);
      } else {
        // Add to cart with quantity
        setCart((prev) => {
          const existing = prev.find((i) => i.productId === foundProduct.id);
          const currentQty = existing ? existing.quantity : 0;
          const targetQty = currentQty + quantity;
          if (targetQty > foundProduct.quantity) {
            toast.error(`Only ${foundProduct.quantity} units of ${foundProduct.name} available.`);
            return prev;
          }
          toast.success(`Added ${quantity} × ${foundProduct.name} to cart.`);
          if (existing) {
            return prev.map((i) => (i.productId === foundProduct.id ? { ...i, quantity: targetQty } : i));
          }
          return [...prev, { productId: foundProduct.id, name: foundProduct.name, price: foundProduct.price, quantity, maxQty: foundProduct.quantity }];
        });
      }
    } else {
      toast.error(`Could not match product in command: "${text}"`);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    
    rec.onstart = () => {
      setIsListening(true);
      toast('Listening... Try saying "Add 2 Milk" or "Remove Milk" or "Clear Cart"', { icon: '🎙️' });
    };
    
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      toast(`Heard: "${text}"`, { icon: '🗣️' });
      parseVoiceCommand(text);
    };
    
    rec.onerror = (e) => {
      console.error(e);
      toast.error("Voice input error. Try again.");
      setIsListening(false);
    };
    
    rec.onend = () => {
      setIsListening(false);
    };
    
    rec.start();
  };

  const currencyFmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  return (
    <Layout title="New Sale" subtitle="Select products and create an invoice">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products to add..." className="input-field pl-10" />
            </div>
            <button
              type="button"
              onClick={startSpeechRecognition}
              className={`w-12 h-12 rounded-xl border flex items-center justify-center transition shadow-sm shrink-0 ${
                isListening 
                  ? 'bg-red-500 border-red-500 text-white animate-pulse' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
              }`}
              title="Voice Billing Assistant"
            >
              {isListening ? <FiMicOff className="text-xl" /> : <FiMic className="text-xl" />}
            </button>
          </div>

          {loading ? <LoadingSpinner /> : products.length === 0 ? (
            <EmptyState icon={FiShoppingCart} title="No products found" description="Try a different search term." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {products.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => addToCart(p)}
                  disabled={p.quantity === 0}
                  className="card p-4 text-left flex items-center gap-3 hover:shadow-glow transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg bg-slate-50 object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.quantity} in stock</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{currencyFmt(p.price)}</p>
                  </div>
                  <FiPlus className="text-primary shrink-0" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="card p-6 h-fit sticky top-24">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-5"><FiShoppingCart /> Cart ({cart.length})</h3>

          {cart.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">Your cart is empty. Add products from the left to get started.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((i) => (
                <div key={i.productId} className="flex items-center gap-2 pb-3 border-b border-slate-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{i.name}</p>
                    <p className="text-xs text-slate-400">{currencyFmt(i.price)} each</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(i.productId, -1)} className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"><FiMinus className="text-xs" /></button>
                    <span className="text-sm font-semibold w-5 text-center">{i.quantity}</span>
                    <button onClick={() => updateQty(i.productId, 1)} className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"><FiPlus className="text-xs" /></button>
                  </div>
                  <button onClick={() => removeFromCart(i.productId)} className="text-danger ml-1"><FiTrash2 className="text-sm" /></button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 space-y-3">
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name (optional)" className="input-field text-sm" />
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field text-sm">
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Total</span>
            <span className="text-xl font-bold text-slate-800">{currencyFmt(total)}</span>
          </div>

          <button onClick={handleCheckout} disabled={submitting || cart.length === 0} className="btn-primary w-full py-3 mt-5 disabled:opacity-50">
            {submitting ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>

      {lastInvoice && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mt-6 border-l-4 border-success">
          <div className="flex items-start gap-3">
            <FiCheckCircle className="text-success text-2xl shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">Sale recorded — {lastInvoice.invoice_number}</h4>
              <p className="text-sm text-slate-500 mt-1">Total: {currencyFmt(lastInvoice.total_amount)} • Profit: {currencyFmt(lastInvoice.total_profit)}</p>
              <div className="mt-3 space-y-1.5">
                {lastInvoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-slate-500">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span className="font-medium text-slate-700">{currencyFmt(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </Layout>
  );
}
