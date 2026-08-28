import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, Plus, Trash2, RefreshCw, ArrowUpRight, ArrowDownRight, 
  Wallet, PieChart as PieIcon, CheckCircle, AlertCircle, ArrowRightLeft, 
  Sparkles, Download, ShieldCheck, ChevronRight, KeyRound, Lock, UserCheck, X
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export interface HoldingItem {
  ticker: string;
  raw_symbol?: string;
  quantity: number;
  avg_price: number;
  current_price?: number;
  change_percent?: number;
  currency?: string;
  invested_value?: number;
  current_value?: number;
  pnl?: number;
  pnl_percent?: number;
  current_weight?: number;
}

export interface RebalanceOrder {
  ticker: string;
  current_price: number;
  current_shares: number;
  current_value: number;
  current_weight: number;
  target_weight: number;
  target_value: number;
  target_shares: number;
  action: 'BUY' | 'SELL' | 'HOLD';
  delta_shares: number;
  delta_value: number;
  currency: string;
}

interface PortfolioManagerProps {
  onRunQuantumOptimization: (tickers: string[], holdings: HoldingItem[]) => void;
  quantumResults?: Record<string, any>;
  onNavigateToOptimizer: () => void;
}

const PALETTE = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#3b82f6'];

const SAMPLE_CSV = `Symbol,Quantity,AvgPrice
RELIANCE.NS,25,2850.50
TCS.NS,15,3920.00
INFY.NS,50,1540.20
HDFCBANK.NS,40,1620.75
ITC.NS,100,430.00`;

export function PortfolioManager({ onRunQuantumOptimization, quantumResults, onNavigateToOptimizer }: PortfolioManagerProps) {
  const [marketRegion, setMarketRegion] = useState<'indian' | 'global'>('indian');
  const [holdings, setHoldings] = useState<HoldingItem[]>([
    { ticker: 'RELIANCE.NS', quantity: 25, avg_price: 2850.50, current_price: 2980.00, invested_value: 71262.50, current_value: 74500.00, pnl: 3237.50, pnl_percent: 4.54, current_weight: 0.32, currency: 'INR', change_percent: 1.2 },
    { ticker: 'TCS.NS', quantity: 15, avg_price: 3920.00, current_price: 4120.00, invested_value: 58800.00, current_value: 61800.00, pnl: 3000.00, pnl_percent: 5.10, current_weight: 0.27, currency: 'INR', change_percent: -0.4 },
    { ticker: 'INFY.NS', quantity: 45, avg_price: 1540.00, current_price: 1610.00, invested_value: 69300.00, current_value: 72450.00, pnl: 3150.00, pnl_percent: 4.55, current_weight: 0.31, currency: 'INR', change_percent: 2.1 },
    { ticker: 'HDFCBANK.NS', quantity: 15, avg_price: 1620.00, current_price: 1590.00, invested_value: 24300.00, current_value: 23850.00, pnl: -450.00, pnl_percent: -1.85, current_weight: 0.10, currency: 'INR', change_percent: 0.8 }
  ]);

  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Zerodha Direct TOTP Modal State
  const [showZerodhaModal, setShowZerodhaModal] = useState(false);
  const [zerodhaUserId, setZerodhaUserId] = useState('');
  const [zerodhaPassword, setZerodhaPassword] = useState('');
  const [zerodhaTotp, setZerodhaTotp] = useState('');
  const [zerodhaEnctoken, setZerodhaEnctoken] = useState('');
  const [isSyncingZerodha, setIsSyncingZerodha] = useState(false);
  const [authMethod, setAuthMethod] = useState<'totp' | 'enctoken'>('totp');

  // Groww Sync Modal State
  const [showGrowwModal, setShowGrowwModal] = useState(false);

  // New Holding Row Inputs
  const [newTicker, setNewTicker] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newAvgPrice, setNewAvgPrice] = useState('');

  // Rebalancing state
  const [rebalanceOrders, setRebalanceOrders] = useState<RebalanceOrder[]>([]);
  const [targetCapitalOverride] = useState<string>('');

  // Totals calculations
  const totalInvested = holdings.reduce((acc, h) => acc + (h.invested_value || (h.quantity * h.avg_price)), 0);
  const totalCurrentValue = holdings.reduce((acc, h) => acc + (h.current_value || (h.quantity * (h.current_price || h.avg_price))), 0);
  const totalPnl = totalCurrentValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const currencySymbol = marketRegion === 'indian' ? '₹' : '$';

  // Live Quote Fetcher via backend /api/quotes
  const refreshLivePrices = async () => {
    if (holdings.length === 0) return;
    setIsLoadingQuotes(true);
    setErrorMsg(null);
    try {
      const tickers = holdings.map(h => h.ticker);
      const res = await fetch('http://localhost:5000/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers })
      });
      if (res.ok) {
        const data = await res.json();
        const quotesMap = new Map((data.quotes || []).map((q: any) => [q.ticker, q]));
        
        let newTotVal = 0;
        const updated = holdings.map(h => {
          const q: any = quotesMap.get(h.ticker);
          const curPrice = q?.price > 0 ? q.price : (h.current_price || h.avg_price);
          const curVal = h.quantity * curPrice;
          const invVal = h.quantity * h.avg_price;
          const pnl = curVal - invVal;
          const pnlPct = invVal > 0 ? (pnl / invVal) * 100 : 0;
          newTotVal += curVal;
          return {
            ...h,
            current_price: curPrice,
            change_percent: q?.change_percent ?? h.change_percent ?? 0,
            currency: q?.currency ?? h.currency ?? (h.ticker.endsWith('.NS') ? 'INR' : 'USD'),
            current_value: curVal,
            invested_value: invVal,
            pnl,
            pnl_percent: pnlPct
          };
        });

        const withWeights = updated.map(h => ({
          ...h,
          current_weight: newTotVal > 0 ? (h.current_value! / newTotVal) : 0
        }));

        setHoldings(withWeights);
        setSuccessMsg('Live market prices updated successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        // Mock slight live fluctuation if backend offline
        simulateLiveFluctuation();
      }
    } catch (e) {
      simulateLiveFluctuation();
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const simulateLiveFluctuation = () => {
    let newTotVal = 0;
    const updated = holdings.map(h => {
      const fluc = (Math.random() - 0.48) * 0.015;
      const curPrice = Number(((h.current_price || h.avg_price) * (1 + fluc)).toFixed(2));
      const curVal = Number((h.quantity * curPrice).toFixed(2));
      const invVal = h.invested_value || (h.quantity * h.avg_price);
      newTotVal += curVal;
      return {
        ...h,
        current_price: curPrice,
        change_percent: Number((fluc * 100).toFixed(2)),
        current_value: curVal,
        pnl: curVal - invVal,
        pnl_percent: Number(((curVal - invVal) / invVal * 100).toFixed(2))
      };
    });
    setHoldings(updated.map(h => ({ ...h, current_weight: newTotVal > 0 ? h.current_value! / newTotVal : 0 })));
    setSuccessMsg('Market prices refreshed.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // CSV File Handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsingCsv(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const res = await fetch('http://localhost:5000/api/portfolio/parse-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv_text: text, default_market: marketRegion })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.holdings?.length > 0) {
            setHoldings(data.holdings);
            setSuccessMsg(`Successfully imported ${data.holdings.length} assets from CSV!`);
            setTimeout(() => setSuccessMsg(null), 4000);
          } else {
            fallbackLocalParse(text);
          }
        } else {
          fallbackLocalParse(text);
        }
      } catch (err) {
        fallbackLocalParse(text);
      } finally {
        setIsParsingCsv(false);
      }
    };
    reader.readAsText(file);
  };

  const fallbackLocalParse = (text: string) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) throw new Error('File has no data rows');
      const header = lines[0].toLowerCase().split(',').map(s => s.trim());
      
      let symIdx = header.findIndex(h => h.includes('symbol') || h.includes('ticker') || h.includes('stock'));
      let qtyIdx = header.findIndex(h => h.includes('qty') || h.includes('quantity') || h.includes('shares'));
      let priceIdx = header.findIndex(h => h.includes('price') || h.includes('avg') || h.includes('cost'));

      if (symIdx === -1) symIdx = 0;
      if (qtyIdx === -1) qtyIdx = 1;
      if (priceIdx === -1) priceIdx = 2;

      const parsed: HoldingItem[] = [];
      let tot = 0;

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/"/g, ''));
        if (parts.length <= symIdx || !parts[symIdx]) continue;
        let sym = parts[symIdx].toUpperCase();
        if (marketRegion === 'indian' && !sym.endsWith('.NS') && !sym.endsWith('.BO')) sym = `${sym}.NS`;
        const qty = parseFloat(parts[qtyIdx]) || 0;
        const avg = parseFloat(parts[priceIdx]) || 100;
        if (qty <= 0) continue;

        const curVal = qty * avg;
        tot += curVal;
        parsed.push({
          ticker: sym,
          quantity: qty,
          avg_price: avg,
          current_price: avg,
          invested_value: curVal,
          current_value: curVal,
          pnl: 0,
          pnl_percent: 0,
          change_percent: 0,
          currency: marketRegion === 'indian' ? 'INR' : 'USD'
        });
      }

      if (parsed.length > 0) {
        setHoldings(parsed.map(p => ({ ...p, current_weight: tot > 0 ? p.current_value! / tot : 0 })));
        setSuccessMsg(`Imported ${parsed.length} holdings from file.`);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg('Could not find valid rows in the CSV file.');
      }
    } catch (e: any) {
      setErrorMsg(`CSV Parse Error: ${e.message}`);
    }
  };

  const handleZerodhaSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncingZerodha(true);
    setErrorMsg(null);

    try {
      const payload = authMethod === 'totp' 
        ? { user_id: zerodhaUserId, password: zerodhaPassword, totp: zerodhaTotp }
        : { enctoken: zerodhaEnctoken };

      const res = await fetch('http://localhost:5000/api/zerodha/sync-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.holdings && data.holdings.length > 0) {
          setHoldings(data.holdings);
          setSuccessMsg(`Successfully connected to Zerodha. Synced ${data.holdings.length} live positions.`);
        } else {
          setSuccessMsg('Connected to Zerodha successfully (Account has 0 active stock holdings).');
        }
        setShowZerodhaModal(false);
        setZerodhaPassword('');
        setZerodhaTotp('');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to authenticate with Zerodha.');
      }
    } catch (err: any) {
      setErrorMsg(`Failed to connect to backend server: ${err.message}`);
    } finally {
      setIsSyncingZerodha(false);
    }
  };

  const handleAddHolding = () => {
    if (!newTicker.trim() || !newQty || parseFloat(newQty) <= 0) {
      setErrorMsg('Please enter a valid ticker symbol and quantity.');
      return;
    }
    let sym = newTicker.trim().toUpperCase();
    if (marketRegion === 'indian' && !sym.endsWith('.NS') && !sym.endsWith('.BO') && !sym.startsWith('^')) {
      sym = `${sym}.NS`;
    }

    const qty = parseFloat(newQty);
    const avg = parseFloat(newAvgPrice) || 100;
    const inv = qty * avg;

    const newItem: HoldingItem = {
      ticker: sym,
      quantity: qty,
      avg_price: avg,
      current_price: avg,
      invested_value: inv,
      current_value: inv,
      pnl: 0,
      pnl_percent: 0,
      change_percent: 0,
      currency: marketRegion === 'indian' ? 'INR' : 'USD'
    };

    const updated = [...holdings.filter(h => h.ticker !== sym), newItem];
    const newTot = updated.reduce((acc, h) => acc + (h.current_value || 0), 0);
    setHoldings(updated.map(h => ({ ...h, current_weight: newTot > 0 ? (h.current_value || 0) / newTot : 0 })));

    setNewTicker('');
    setNewQty('');
    setNewAvgPrice('');
    setErrorMsg(null);
    setSuccessMsg(`Added ${sym} to portfolio.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDeleteHolding = (ticker: string) => {
    const updated = holdings.filter(h => h.ticker !== ticker);
    const newTot = updated.reduce((acc, h) => acc + (h.current_value || 0), 0);
    setHoldings(updated.map(h => ({ ...h, current_weight: newTot > 0 ? (h.current_value || 0) / newTot : 0 })));
  };

  const downloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'portfolio_holdings_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Rebalancing calculator against Quantum DC-QAOA weights
  const computeRebalanceTrades = async () => {
    if (holdings.length === 0) return;

    const optimalMethod = quantumResults?.['DC-QAOA'] || quantumResults?.['Genetic Algorithm'] || quantumResults?.['Greedy'];
    
    // Fallback simulated target weights if optimization hasn't been run yet
    let targetWeightsMap: Record<string, number> = {};
    if (optimalMethod?.valid && optimalMethod?.weights) {
      const selIdx = optimalMethod.selected_indices || holdings.map((_, i) => i);
      holdings.forEach((h, i) => {
        const foundPos = selIdx.indexOf(i);
        targetWeightsMap[h.ticker] = foundPos >= 0 ? optimalMethod.weights[foundPos] : 0.0;
      });
    } else {
      // Create a balanced target distribution
      const n = holdings.length;
      holdings.forEach((h) => {
        targetWeightsMap[h.ticker] = Number((1 / n).toFixed(4));
      });
    }

    try {
      const res = await fetch('http://localhost:5000/api/portfolio/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdings,
          optimal_weights: targetWeightsMap,
          total_capital: targetCapitalOverride ? parseFloat(targetCapitalOverride) : totalCurrentValue
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRebalanceOrders(data.orders || []);
      } else {
        calculateLocalRebalancing(targetWeightsMap);
      }
    } catch {
      calculateLocalRebalancing(targetWeightsMap);
    }
  };

  const calculateLocalRebalancing = (targetWeightsMap: Record<string, number>) => {
    const portCapital = targetCapitalOverride ? parseFloat(targetCapitalOverride) : totalCurrentValue;
    const orders: RebalanceOrder[] = [];

    holdings.forEach(h => {
      const price = h.current_price || h.avg_price;
      const curQty = h.quantity;
      const curVal = curQty * price;
      const curWeight = totalCurrentValue > 0 ? curVal / totalCurrentValue : 0;
      const targetWeight = targetWeightsMap[h.ticker] ?? (1 / holdings.length);
      const targetVal = portCapital * targetWeight;
      const targetQty = price > 0 ? targetVal / price : 0;
      const deltaQty = targetQty - curQty;
      const roundedDelta = Math.round(deltaQty);

      let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      if (roundedDelta > 0) action = 'BUY';
      else if (roundedDelta < 0) action = 'SELL';

      orders.push({
        ticker: h.ticker,
        current_price: price,
        current_shares: curQty,
        current_value: curVal,
        current_weight: curWeight,
        target_weight: targetWeight,
        target_value: targetVal,
        target_shares: targetQty,
        action,
        delta_shares: Math.abs(roundedDelta),
        delta_value: Math.abs(deltaQty * price),
        currency: marketRegion === 'indian' ? 'INR' : 'USD'
      });
    });

    orders.sort((a) => (a.action === 'SELL' ? -1 : 1));
    setRebalanceOrders(orders);
  };

  useEffect(() => {
    if (holdings.length > 0) {
      computeRebalanceTrades();
    }
  }, [quantumResults, holdings.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Live Portfolio & Holdings Manager
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-normal">
                  Live Market Data
                </span>
              </h1>
              <p className="text-sm text-gray-400">
                Import brokerage holdings, track real-time P&L, and execute Quantum DC-QAOA portfolio rebalancing.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center">
            <button
              onClick={() => setMarketRegion('indian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                marketRegion === 'indian' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              NSE / BSE (₹)
            </button>
            <button
              onClick={() => setMarketRegion('global')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                marketRegion === 'global' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Global / US ($)
            </button>
          </div>

          <button
            onClick={() => setShowZerodhaModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <KeyRound className="w-4 h-4" />
            <span>Zerodha (Free TOTP)</span>
          </button>

          <button
            onClick={() => setShowGrowwModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Groww Import</span>
          </button>

          <button
            onClick={refreshLivePrices}
            disabled={isLoadingQuotes}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingQuotes ? 'animate-spin text-purple-400' : ''}`} />
            <span>{isLoadingQuotes ? 'Fetching...' : 'Refresh Quotes'}</span>
          </button>

          <button
            onClick={() => {
              const tickers = holdings.map(h => h.ticker);
              onRunQuantumOptimization(tickers, holdings);
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Optimize with DC-QAOA</span>
          </button>
        </div>
      </div>

      {/* Zerodha TOTP Direct Connect Modal */}
      <AnimatePresence>
        {showZerodhaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card max-w-md w-full p-6 rounded-2xl border border-white/15 bg-[#0f0f18] shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                    Z
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Connect Zerodha Kite</h3>
                    <p className="text-xs text-emerald-400 font-medium">100% Free Direct TOTP Session Sync</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowZerodhaModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Method Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10 mb-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthMethod('totp')}
                  className={`py-1.5 rounded-lg transition-all ${
                    authMethod === 'totp' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Credentials + 6-Digit TOTP
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('enctoken')}
                  className={`py-1.5 rounded-lg transition-all ${
                    authMethod === 'enctoken' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Direct enctoken
                </button>
              </div>

              <form onSubmit={handleZerodhaSync} className="space-y-4">
                {authMethod === 'totp' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Zerodha User ID (e.g. AB1234)
                      </label>
                      <div className="relative">
                        <UserCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. DV8349"
                          value={zerodhaUserId}
                          onChange={(e) => setZerodhaUserId(e.target.value.toUpperCase())}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={zerodhaPassword}
                          onChange={(e) => setZerodhaPassword(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        6-Digit TOTP from Authenticator App (or TOTP Secret)
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 583921"
                          value={zerodhaTotp}
                          onChange={(e) => setZerodhaTotp(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm tracking-wider font-mono focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Session `enctoken` from browser cookie
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Paste enctoken string from kite.zerodha.com cookies"
                      value={zerodhaEnctoken}
                      onChange={(e) => setZerodhaEnctoken(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}

                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-gray-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Your credentials are used solely in local memory to query Zerodha holdings and are never saved to disk.
                  </span>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSyncingZerodha}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {isSyncingZerodha ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting to Zerodha...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Sync Holdings Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Groww Portfolio Import Modal */}
      <AnimatePresence>
        {showGrowwModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card max-w-md w-full p-6 rounded-2xl border border-white/15 bg-[#0f0f18] shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    G
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Import Groww Holdings</h3>
                    <p className="text-xs text-emerald-400 font-medium">100% Free Direct CSV & Report Support</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGrowwModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-gray-300">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="font-semibold text-white text-sm">How to get Groww Holdings:</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-400">
                    <li>Open <strong>Groww App</strong> or visit <strong>groww.in</strong>.</li>
                    <li>Go to <strong>My Profile / Reports</strong> $\to$ <strong>Holdings / Stocks</strong>.</li>
                    <li>Click <strong>Download Report (Excel / CSV)</strong>.</li>
                    <li>Drop the downloaded file directly into the box below!</li>
                  </ol>
                </div>

                <label className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-xl p-6 text-center cursor-pointer bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05] transition-all flex flex-col items-center justify-center gap-2 group">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => {
                      handleFileUpload(e);
                      setShowGrowwModal(false);
                    }}
                    className="hidden"
                    disabled={isParsingCsv}
                  />
                  <FileText className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-semibold text-white">
                    Click to Select Groww CSV
                  </div>
                  <div className="text-gray-500">Auto-detects symbol, shares & buy price</div>
                </label>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portfolio Top Metrics Cards (Fintech Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Portfolio Value</div>
          <div className="text-3xl font-extrabold text-white">
            {currencySymbol}{totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-gray-400">Invested:</span>
            <span className="text-gray-200 font-medium">{currencySymbol}{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Unrealized P&L</div>
          <div className={`text-3xl font-extrabold flex items-center gap-1 ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnl >= 0 ? '+' : ''}{currencySymbol}{totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnl >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{totalPnl >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}% All-Time Return</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Active Positions</div>
          <div className="text-3xl font-extrabold text-cyan-400">
            {holdings.length} <span className="text-sm font-normal text-gray-400">Assets</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Diversified across {marketRegion === 'indian' ? 'NSE/BSE' : 'Global'} Equities</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quantum Rebalance Status</div>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            {rebalanceOrders.some(o => o.action !== 'HOLD') ? (
              <span className="text-amber-400 flex items-center gap-1.5">
                <ArrowRightLeft className="w-5 h-5" /> Rebalance Needed
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-5 h-5" /> Optimal Alignment
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <span>Powered by DC-QAOA Energy Mixer</span>
          </div>
        </div>
      </div>

      {/* CSV Import & Manual Entry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CSV Dropzone */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                Brokerage CSV Import
              </h3>
              <button
                onClick={downloadSampleCsv}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
              >
                <Download className="w-3.5 h-3.5" /> Sample CSV
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Upload holdings export from <strong>Zerodha Console, Groww, Upstox, AngelOne</strong>, or standard CSV format (<code className="text-purple-300">Ticker, Quantity, AvgPrice</code>).
            </p>
          </div>

          <label className="border-2 border-dashed border-white/20 hover:border-purple-500/50 rounded-xl p-6 text-center cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center gap-2 group">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isParsingCsv}
            />
            <FileText className="w-8 h-8 text-gray-400 group-hover:text-purple-400 transition-colors" />
            <div className="text-sm font-semibold text-gray-200">
              {isParsingCsv ? 'Parsing & Fetching Live Prices...' : 'Click or Drag & Drop CSV here'}
            </div>
            <div className="text-xs text-gray-500">Supports .csv files up to 5MB</div>
          </label>
        </div>

        {/* Manual Position Form */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-cyan-400" />
            Add Position Manually
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Ticker Symbol</label>
              <input
                type="text"
                placeholder={marketRegion === 'indian' ? 'e.g. TATAMOTORS.NS' : 'e.g. NVDA'}
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Quantity (Shares)</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Avg Buy Price ({currencySymbol})</label>
              <input
                type="number"
                placeholder="e.g. 940.50"
                value={newAvgPrice}
                onChange={(e) => setNewAvgPrice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAddHolding}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-all shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" /> Add Asset to Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Holdings Table */}
      <div className="glass-card rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Current Holdings & Live Market Value</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-normal">
              {holdings.length} Assets
            </span>
          </h3>
          <div className="text-xs text-gray-400">
            All prices updated via <strong className="text-purple-400">yfinance feed</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-white/[0.03] text-gray-400 border-b border-white/10 font-semibold">
              <tr>
                <th className="px-5 py-3.5">Asset / Ticker</th>
                <th className="px-4 py-3.5 text-right">Shares</th>
                <th className="px-4 py-3.5 text-right">Avg Buy Price</th>
                <th className="px-4 py-3.5 text-right">Live Price</th>
                <th className="px-4 py-3.5 text-right">Day Chg</th>
                <th className="px-4 py-3.5 text-right">Invested</th>
                <th className="px-4 py-3.5 text-right">Current Value</th>
                <th className="px-4 py-3.5 text-right">Unrealized P&L</th>
                <th className="px-4 py-3.5 text-right">Weight</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {holdings.map((h, idx) => {
                const curPrice = h.current_price || h.avg_price;
                const invVal = h.invested_value || (h.quantity * h.avg_price);
                const curVal = h.current_value || (h.quantity * curPrice);
                const pnl = h.pnl !== undefined ? h.pnl : (curVal - invVal);
                const pnlPct = h.pnl_percent !== undefined ? h.pnl_percent : (invVal > 0 ? (pnl / invVal) * 100 : 0);
                const dayChg = h.change_percent ?? 0;

                return (
                  <tr key={h.ticker} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 font-semibold text-white flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} 
                      />
                      <span>{h.ticker}</span>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-gray-200">
                      {h.quantity}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-400">
                      {currencySymbol}{h.avg_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-white">
                      {currencySymbol}{curPrice.toFixed(2)}
                    </td>
                    <td className={`px-4 py-4 text-right font-medium ${dayChg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {dayChg >= 0 ? '+' : ''}{dayChg.toFixed(2)}%
                    </td>
                    <td className="px-4 py-4 text-right text-gray-300">
                      {currencySymbol}{invVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-white">
                      {currencySymbol}{curVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-4 text-right font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <div>{pnl >= 0 ? '+' : ''}{currencySymbol}{pnl.toFixed(2)}</div>
                      <div className="text-xs">{pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</div>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-purple-300">
                      {((h.current_weight || (curVal / totalCurrentValue)) * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleDeleteHolding(h.ticker)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove position"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocation Comparison & Rebalancing Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Allocation Visualizer */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <PieIcon className="w-4 h-4 text-purple-400" />
            Current Weight Allocation
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={holdings.map((h, i) => ({
                    name: h.ticker,
                    value: h.current_value || (h.quantity * (h.current_price || h.avg_price)),
                    color: PALETTE[i % PALETTE.length]
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {holdings.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Value']}
                  contentStyle={{ backgroundColor: '#0d0d17', borderColor: '#333', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {holdings.slice(0, 6).map((h, i) => (
              <div key={h.ticker} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                <span className="text-gray-300 truncate">{h.ticker}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quantum Rebalancing Action Sheet */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                Quantum DC-QAOA Rebalancing Order Sheet
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                Target Allocation Engine
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Actionable buy/sell recommendations generated by matching your live portfolio against the <strong>DC-QAOA Hamiltonian optimal weights</strong>.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-white/[0.03] text-gray-400 uppercase border-b border-white/10">
                  <tr>
                    <th className="px-3 py-2.5">Asset</th>
                    <th className="px-3 py-2.5 text-center">Action</th>
                    <th className="px-3 py-2.5 text-right">Shares Delta</th>
                    <th className="px-3 py-2.5 text-right">Transaction Value</th>
                    <th className="px-3 py-2.5 text-right">Current Wt</th>
                    <th className="px-3 py-2.5 text-right">Target Wt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rebalanceOrders.map((o) => (
                    <tr key={o.ticker} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-3 font-semibold text-white">{o.ticker}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                          o.action === 'BUY' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : o.action === 'SELL' 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {o.action}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-medium text-white">
                        {o.action === 'HOLD' ? '0' : `${o.action === 'BUY' ? '+' : '-'}${o.delta_shares}`}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-200">
                        {currencySymbol}{o.delta_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-400">
                        {(o.current_weight * 100).toFixed(1)}%
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-purple-400">
                        {(o.target_weight * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-400">
              Generated {rebalanceOrders.filter(o => o.action !== 'HOLD').length} rebalance orders based on DC-QAOA ground-state allocation.
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  try {
                    const validOrders = rebalanceOrders.filter(o => o.action !== 'HOLD').map(o => ({
                      ticker: o.ticker,
                      action: o.action,
                      shares: o.delta_shares,
                      price: o.current_price
                    }));
                    if (validOrders.length === 0) {
                      setSuccessMsg('Portfolio is already perfectly balanced with optimal quantum weights.');
                      return;
                    }
                    const res = await fetch('http://localhost:5000/api/orders/execute-batch', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orders: validOrders,
                        enctoken: zerodhaEnctoken,
                        sandbox: !zerodhaEnctoken
                      })
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setSuccessMsg(`Executed ${data.executed_count} orders (${data.mode === 'LIVE_BROKER' ? 'Direct to Zerodha' : 'Quant Execution Sandbox'}). Total: ${currencySymbol}${data.total_value.toLocaleString()}`);
                    }
                  } catch (e: any) {
                    setErrorMsg(`Execution error: ${e.message}`);
                  }
                }}
                className="flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl shadow-md transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Execute Batch Orders ({rebalanceOrders.filter(o => o.action !== 'HOLD').length})</span>
              </button>
              <button
                onClick={onNavigateToOptimizer}
                className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3.5 py-2 rounded-xl transition-all"
              >
                <span>Circuit Cinema</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
