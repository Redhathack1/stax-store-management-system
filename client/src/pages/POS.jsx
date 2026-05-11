import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Landmark, ShoppingCart, CheckCircle2, Loader2, ScanLine, X } from 'lucide-react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

const POS = ({ currentUser }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [cashTendered, setCashTendered] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const searchInputRef = useRef(null);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Barcode scanner auto-focus
  useEffect(() => {
    if (!showSuccess && !isScanning && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSuccess, isScanning]);

  useEffect(() => {
    let scanner = null;
    if (isScanning) {
      // Use a timeout to ensure the #reader div is mounted
      setTimeout(() => {
        scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 5 }, false);
        scanner.render(
          (text) => {
            scanner.clear();
            setIsScanning(false);
            const match = products.find(p => p.sku.toLowerCase() === text.toLowerCase().trim());
            if (match) addToCart(match);
            else alert(`No product found with SKU: ${text}`);
          },
          (err) => {}
        );
      }, 100);
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [isScanning, products]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map(item => item._id === product._id ? { ...item, qty: item.qty + 1 } : item);
      }
      if (product.stock <= 0) return prev;
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      const match = products.find(p => p.sku.toLowerCase() === search.toLowerCase().trim());
      if (match) {
        addToCart(match);
        setSearch('');
      } else {
        // If no exact SKU match, check if there's exactly one name match
        const nameMatches = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase().trim()));
        if (nameMatches.length === 1) {
          addToCart(nameMatches[0]);
          setSearch('');
        }
      }
    }
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = item.qty + delta;
        if (delta > 0 && newQty > item.stock) return item;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const changeDue = paymentMethod === 'Cash' && cashTendered !== '' 
    ? Math.max(0, parseFloat(cashTendered) - total) 
    : 0;

  const isPayDisabled = cart.length === 0 || isPaying || (paymentMethod === 'Cash' && (cashTendered === '' || parseFloat(cashTendered) < total));

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const formattedItems = cart.map(item => ({
        product: item._id,
        name: item.name,
        quantity: item.qty,
        price: item.price,
        cost: item.cost
      }));

      const payload = {
        items: formattedItems,
        subtotal,
        discount: 0,
        total,
        paymentMethod,
        cashTendered: paymentMethod === 'Cash' ? parseFloat(cashTendered) : undefined,
        changeDue,
        cashier: currentUser?.name || 'Admin'
      };

      const res = await axios.post(import.meta.env.VITE_API_URL + '/sales', payload);
      
      setReceiptData({ ...payload, _id: res.data._id, date: new Date() });
      setShowSuccess(true);
      fetchProducts();
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Payment failed. ' + (error.response?.data?.message || 'Please try again.'));
    } finally {
      setIsPaying(false);
    }
  };

  const closeSuccessAndReset = () => {
    setShowSuccess(false);
    setCart([]);
    setCashTendered('');
    setPaymentMethod('Card');
    setReceiptData(null);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
    <div className="h-[calc(100vh-4rem)] flex gap-6 relative print:hidden">
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="Search products or scan barcode..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleBarcodeScan}
            />
          </div>
          <button 
            onClick={() => setIsScanning(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-semibold transition-all shadow-sm"
          >
            <ScanLine className="w-5 h-5" /> Scan
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
              <p>Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div 
                  key={product._id}
                  onClick={() => addToCart(product)}
                  className={`bg-white p-4 rounded-2xl border shadow-sm transition-all cursor-pointer group active:scale-95 ${
                    product.stock === 0 ? 'border-red-200 opacity-60 grayscale' : 'border-slate-200 hover:shadow-md hover:border-indigo-300'
                  }`}
                >
                  <div className="h-32 bg-slate-50 rounded-xl mb-4 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <span className="text-4xl">📦</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 line-clamp-1">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-indigo-600 font-bold">${product.price.toFixed(2)}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                      product.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Current Order</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 line-clamp-1">{item.name}</h4>
                  <p className="text-indigo-600 font-medium">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-1">
                  <button onClick={() => updateQty(item._id, -1)} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="w-6 text-center font-semibold text-slate-800">{item.qty}</span>
                  <button onClick={() => updateQty(item._id, 1)} className="p-1 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30" disabled={item.qty >= item.stock}>
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item._id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors group">
                  <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-700">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax (8%)</span>
              <span className="font-medium text-slate-700">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-800 pt-3 border-t border-slate-200 mt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <PaymentBtn icon={Banknote} label="Cash" active={paymentMethod === 'Cash'} onClick={() => setPaymentMethod('Cash')} />
            <PaymentBtn icon={CreditCard} label="Card" active={paymentMethod === 'Card'} onClick={() => setPaymentMethod('Card')} />
            <PaymentBtn icon={Landmark} label="Transfer" active={paymentMethod === 'Transfer'} onClick={() => setPaymentMethod('Transfer')} />
          </div>

          {paymentMethod === 'Cash' && (
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Cash Tendered:</span>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input type="number" value={cashTendered} onChange={(e) => setCashTendered(e.target.value)} className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-right font-medium" placeholder="0.00" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-600">Change Due:</span>
                <span className="text-lg font-bold text-emerald-600">${changeDue.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button 
            onClick={handlePayment}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex justify-center items-center gap-2"
            disabled={isPayDisabled}
          >
            {isPaying ? <Loader2 className="w-6 h-6 animate-spin" /> : `Pay $${total.toFixed(2)}`}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
          <div className="bg-white p-8 rounded-3xl shadow-xl w-96 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
               <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
            <p className="text-slate-500 mb-6">The transaction has been recorded.</p>
            
            <div className="w-full flex gap-3">
              <button onClick={() => window.print()} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors shadow-sm">
                Print Receipt
              </button>
              <button onClick={closeSuccessAndReset} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm">
                New Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Printable Receipt (Hidden on screen) */}
    {receiptData && (
      <div className="hidden print:block text-black bg-white w-full max-w-[300px] mx-auto text-sm font-mono p-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold mb-1">STAX STORE</h2>
          <p>Receipt #{receiptData._id.slice(-6).toUpperCase()}</p>
          <p>{receiptData.date.toLocaleString()}</p>
          <p>Cashier: {receiptData.cashier}</p>
        </div>
        
        <div className="border-t border-b border-black py-2 mb-2">
          {receiptData.items.map((item, i) => (
            <div key={i} className="flex justify-between mb-1">
              <span>{item.quantity}x {item.name.slice(0, 15)}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${receiptData.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>${(receiptData.total - receiptData.subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-black">
          <span>Total:</span>
          <span>${receiptData.total.toFixed(2)}</span>
        </div>
        
        <div className="mt-4 pt-2 border-t border-black border-dashed">
          <div className="flex justify-between">
            <span>Method:</span>
            <span>{receiptData.paymentMethod}</span>
          </div>
          {receiptData.paymentMethod === 'Cash' && (
            <>
              <div className="flex justify-between">
                <span>Tendered:</span>
                <span>${receiptData.cashTendered.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Change:</span>
                <span>${receiptData.changeDue.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
        <div className="text-center mt-6">
          <p>Thank you for shopping!</p>
        </div>
      </div>
    )}

    {/* Camera Scanner Modal */}
    {isScanning && (
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl print:hidden">
        <div className="bg-white p-6 rounded-3xl shadow-xl w-[400px] flex flex-col items-center animate-in fade-in zoom-in duration-200">
          <div className="w-full flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Scan Barcode</h2>
            <button onClick={() => setIsScanning(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div id="reader" className="w-full h-[300px] bg-slate-50 rounded-2xl overflow-hidden"></div>
          <p className="text-sm text-slate-400 mt-4 text-center">Point your camera at the barcode.</p>
        </div>
      </div>
    )}
    </>
  );
};

const PaymentBtn = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${active ? 'border-indigo-600 bg-indigo-50 text-indigo-700 scale-105' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-slate-50'}`}>
    <Icon className="w-6 h-6" />
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

export default POS;
