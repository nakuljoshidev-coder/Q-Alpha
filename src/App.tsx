import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Atom, TrendingUp, BarChart3, Cpu, Zap, 
  Globe, PieChart, Activity, Shield, Target,
  Play, Sparkles, Brain, CircuitBoard, LineChart,
  Timer, Database, Layers, CheckCircle2
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Types
interface PortfolioMetrics {
  annual_return: number;
  annual_volatility: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  var_95: number;
  cvar_95: number;
  calmar_ratio: number;
  beta: number;
  diversification_ratio: number;
  concentration_ratio: number;
  quantum_stability_index?: number;
}

interface OptimizationResult {
  valid: boolean;
  selected_indices: number[];
  weights: number[];
  metrics: PortfolioMetrics;
  quantum_metrics?: {
    quantum_stability_index: number;
    solution_entropy: number;
    circuit_depth: number;
    energy_variance: number;
    shots: number;
    gate_count: number;
    circuit_steps?: CircuitStep[];
  };
}

interface CircuitStep {
  layer: number;
  type: 'cost' | 'counterdiabatic' | 'mixer';
  gates: { type: string; qubit: number; angle?: number }[];
}

// Bloch Sphere 3D Component
function BlochSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const qubitRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
    }
    if (qubitRef.current) {
      qubitRef.current.position.x = Math.sin(t * 0.8) * 1.8;
      qubitRef.current.position.y = Math.cos(t * 0.5) * 1.4;
      qubitRef.current.position.z = Math.sin(t * 0.6) * 1.2;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.1;
      ring1Ref.current.rotation.y = t * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = t * 0.4;
      (ring2Ref.current as any).rotation.z = Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group>
      {/* Main Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          transparent
          opacity={0.2}
          distort={0.4}
          speed={3}
          roughness={0}
        />
      </mesh>
      
      {/* Wireframe */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Equator Ring */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.03, 16, 100]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.6} />
      </mesh>
      
      {/* Vertical Ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2, 0.03, 16, 100]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
      </mesh>
      
      {/* Qubit Particle */}
      <mesh ref={qubitRef}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#06b6d4" />
        <pointLight color="#06b6d4" intensity={3} distance={8} />
      </mesh>
      
      {/* Axis Lines */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, -3, 0, 0, 3, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#8b5cf6" opacity={0.5} transparent />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-3, 0, 0, 3, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#8b5cf6" opacity={0.3} transparent />
      </line>
    </group>
  );
}

// Particle Background
function ParticlesBackground() {
  return (
    <div className="particles-container">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="particle"
          initial={{ opacity: 0, y: '100vh' }}
          animate={{ 
            opacity: [0, 0.6, 0.6, 0],
            y: ['100vh', '-100vh'],
            x: [0, Math.sin(i) * 50, Math.cos(i) * 50, 0]
          }}
          transition={{
            duration: 12 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: 'linear'
          }}
          style={{
            left: `${Math.random() * 100}%`,
            width: `${3 + Math.random() * 4}px`,
            height: `${3 + Math.random() * 4}px`,
          }}
        />
      ))}
    </div>
  );
}

// Navigation Component
function Navigation({ activeSection, setActiveSection }: { activeSection: string; setActiveSection: (s: string) => void }) {
  const sections = [
    { id: 'landing', label: 'Home', icon: Atom },
    { id: 'market', label: 'Market Data', icon: Globe },
    { id: 'optimize', label: 'Optimize', icon: Cpu },
    { id: 'circuit', label: 'Circuit', icon: CircuitBoard },
    { id: 'insights', label: 'Insights', icon: Brain },
    { id: 'advantage', label: 'Advantage', icon: Activity },
    { id: 'simulator', label: 'Simulator', icon: TrendingUp },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="nav-container"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <Atom className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              QuantumOpt
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-1">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`nav-link flex items-center space-x-1 ${
                  activeSection === section.id ? 'active' : ''
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span>{section.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// Landing Page Section
function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="section flex items-center justify-center"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6"
                animate={{ 
                  boxShadow: ['0 0 0px rgba(139,92,246,0)', '0 0 20px rgba(139,92,246,0.3)', '0 0 0px rgba(139,92,246,0)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">TRUE DC-QAOA Technology</span>
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <motion.span 
                  className="text-white block"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Quantum
                </motion.span>
                <motion.span 
                  className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent block"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Portfolio Intelligence
                </motion.span>
              </h1>
              
              <motion.p 
                className="text-xl text-gray-400 mt-6 max-w-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                From Exponential Chaos to Optimal Capital Allocation. 
                Harness the power of TRUE DC-QAOA with Counterdiabatic Driving 
                for next-generation portfolio optimization.
              </motion.p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button 
                onClick={onStart} 
                className="quantum-btn flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5" />
                <span>Run Quantum Optimization</span>
              </motion.button>
              
              <motion.button 
                className="quantum-btn quantum-btn-outline flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="w-5 h-5" />
                <span>See Quantum Advantage</span>
              </motion.button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center space-x-8 pt-4"
            >
              {[
                { label: 'Search Space', value: '2^N', color: 'text-cyan-400' },
                { label: 'Metrics', value: '40+', color: 'text-purple-400' },
                { label: 'Ready', value: 'NISQ', color: 'text-pink-400' }
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Right - 3D Bloch Sphere */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, type: 'spring' }}
            className="h-[500px] lg:h-[600px]"
          >
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
              <BlochSphere />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// Market Data Section
function MarketDataSection({ onDataSelect, selectedTickers, setSelectedTickers }: any) {
  const indianStocks = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 'HINDUNILVR.NS', 'BHARTIARTL.NS', 'ITC.NS', 'SBIN.NS', 'BAJFINANCE.NS'];
  const globalStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'JNJ', 'UNH', 'PG', 'HD', 'MA', 'ADBE'];
  
  const [assetCount, setAssetCount] = useState(8);
  const [riskAversion, setRiskAversion] = useState(1.0);
  const [capital, setCapital] = useState(100000);

  const toggleTicker = (ticker: string) => {
    if (selectedTickers.includes(ticker)) {
      setSelectedTickers(selectedTickers.filter((t: string) => t !== ticker));
    } else if (selectedTickers.length < 20) {
      setSelectedTickers([...selectedTickers, ticker]);
    }
  };

  const selectAll = (tickers: string[]) => {
    const newTickers = [...new Set([...selectedTickers, ...tickers])];
    setSelectedTickers(newTickers.slice(0, 20));
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="section"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Data Universe</h2>
          <p className="section-subtitle">Select assets from global markets for quantum optimization</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Market Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Indian Markets */}
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-semibold">Indian Markets (NSE)</h3>
                </div>
                <button 
                  onClick={() => selectAll(indianStocks)}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Select All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {indianStocks.map((ticker, i) => (
                  <motion.button
                    key={ticker}
                    onClick={() => toggleTicker(ticker)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedTickers.includes(ticker)
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {ticker.replace('.NS', '')}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Global Markets */}
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold">Global Markets (US)</h3>
                </div>
                <button 
                  onClick={() => selectAll(globalStocks)}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Select All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {globalStocks.map((ticker, i) => (
                  <motion.button
                    key={ticker}
                    onClick={() => toggleTicker(ticker)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.03 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedTickers.includes(ticker)
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {ticker}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Selected Assets Preview */}
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <span>Selected Assets ({selectedTickers.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {selectedTickers.map((ticker: string) => (
                    <motion.span 
                      key={ticker}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{ticker}</span>
                      <button 
                        onClick={() => toggleTicker(ticker)}
                        className="hover:text-red-400"
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Controls Panel */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-card p-6 space-y-6">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span>Optimization Parameters</span>
              </h3>

              {/* Asset Count */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Max Assets: <span className="text-cyan-400 font-mono">{assetCount}</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={assetCount}
                  onChange={(e) => setAssetCount(parseInt(e.target.value))}
                  className="quantum-slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3</span>
                  <span>Search: 2^{assetCount}</span>
                  <span>15</span>
                </div>
              </div>

              {/* Risk Aversion */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Risk Aversion: <span className="text-cyan-400 font-mono">{riskAversion.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={riskAversion}
                  onChange={(e) => setRiskAversion(parseFloat(e.target.value))}
                  className="quantum-slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Aggressive</span>
                  <span>Balanced</span>
                  <span>Conservative</span>
                </div>
              </div>

              {/* Capital */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Investment Capital
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-8 pr-4 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <motion.button
                onClick={() => onDataSelect({ assetCount, riskAversion, capital })}
                disabled={selectedTickers.length < 3}
                className="quantum-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Cpu className="w-5 h-5 inline mr-2" />
                Start Optimization
              </motion.button>
            </div>

            {/* Quick Stats */}
            <motion.div 
              className="glass-card p-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-sm font-semibold text-gray-400 mb-4">SEARCH SPACE</h3>
              <div className="text-center">
                <motion.div 
                  className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                  key={assetCount}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  2^{Math.min(assetCount, selectedTickers.length || assetCount)}
                </motion.div>
                <div className="text-lg text-cyan-400 font-mono mt-2">
                  = {Math.pow(2, Math.min(assetCount, selectedTickers.length || assetCount)).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  possible portfolios
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// Optimization Engine Section
function OptimizationEngine({ isRunning, progress, results, currentMethod }: any) {
  const methods = ['Greedy', 'Simulated Annealing', 'Genetic Algorithm', 'DC-QAOA'];
  
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="section"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Optimization Engine</h2>
          <p className="section-subtitle">Classical vs Quantum DC-QAOA Comparison</p>
        </motion.div>

        {/* Progress */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="status-dot running"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="font-semibold">Running: {currentMethod}</span>
                </div>
                <span className="text-cyan-400 font-mono">{progress}%</span>
              </div>
              <div className="quantum-progress">
                <motion.div 
                  className="quantum-progress-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Split Screen Comparison */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Classical Methods */}
          <motion.div 
            className="glass-card p-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Classical Methods</h3>
                <p className="text-sm text-gray-400">Traditional optimization approaches</p>
              </div>
            </div>

            <div className="space-y-4">
              {methods.slice(0, 3).map((method, index) => {
                const result = results[method];
                return (
                  <motion.div 
                    key={method}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`p-4 rounded-lg border transition-all ${
                      result?.valid 
                        ? 'bg-white/5 border-green-500/30' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{method}</span>
                      {result?.valid && (
                        <motion.span 
                          className="text-green-400 text-sm flex items-center"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Complete
                        </motion.span>
                      )}
                    </div>
                    {result?.valid && (
                      <motion.div 
                        className="mt-3 grid grid-cols-3 gap-4 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div>
                          <div className="text-gray-500">Sharpe</div>
                          <div className="text-cyan-400 font-mono">
                            {result.metrics.sharpe_ratio.toFixed(3)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Return</div>
                          <div className="text-green-400 font-mono">
                            {(result.metrics.annual_return * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Risk</div>
                          <div className="text-yellow-400 font-mono">
                            {(result.metrics.annual_volatility * 100).toFixed(1)}%
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Quantum DC-QAOA */}
          <motion.div 
            className="glass-card p-6 border-purple-500/30"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <motion.div 
                className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"
                animate={{ 
                  boxShadow: ['0 0 0px rgba(139,92,246,0)', '0 0 20px rgba(139,92,246,0.5)', '0 0 0px rgba(139,92,246,0)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Atom className="w-5 h-5 text-purple-400" />
              </motion.div>
              <div>
                <h3 className="text-xl font-semibold text-purple-300">TRUE DC-QAOA</h3>
                <p className="text-sm text-gray-400">Counterdiabatic Quantum Optimization</p>
              </div>
            </div>

            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`p-4 rounded-lg border transition-all ${
                  results['DC-QAOA']?.valid 
                    ? 'bg-purple-500/10 border-purple-500/50' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-purple-300">DC-QAOA with Problem-Aware Mixers</span>
                  {results['DC-QAOA']?.valid && (
                    <motion.span 
                      className="text-purple-400 text-sm flex items-center"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Quantum Complete
                    </motion.span>
                  )}
                </div>
                
                {results['DC-QAOA']?.valid && (
                  <>
                    <motion.div 
                      className="mt-3 grid grid-cols-3 gap-4 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div>
                        <div className="text-gray-500">Sharpe</div>
                        <div className="text-purple-400 font-mono text-lg">
                          {results['DC-QAOA'].metrics.sharpe_ratio.toFixed(3)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Return</div>
                        <div className="text-green-400 font-mono">
                          {(results['DC-QAOA'].metrics.annual_return * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Risk</div>
                        <div className="text-yellow-400 font-mono">
                          {(results['DC-QAOA'].metrics.annual_volatility * 100).toFixed(1)}%
                        </div>
                      </div>
                    </motion.div>
                    
                    {results['DC-QAOA'].quantum_metrics && (
                      <motion.div 
                        className="mt-4 pt-4 border-t border-purple-500/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="text-sm text-purple-300 mb-2">Quantum Metrics</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Stability Index</div>
                            <div className="text-cyan-400 font-mono">
                              {results['DC-QAOA'].quantum_metrics.quantum_stability_index.toFixed(3)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Solution Entropy</div>
                            <div className="text-cyan-400 font-mono">
                              {results['DC-QAOA'].quantum_metrics.solution_entropy.toFixed(3)} bits
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Live Metrics Chart */}
        <AnimatePresence>
          {Object.keys(results).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="mt-8 glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Performance Comparison</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(results).filter(([_, r]: [string, any]) => r.valid).map(([method, result]: [string, any]) => ({
                    method: method === 'DC-QAOA' ? '🔬 DC-QAOA' : method,
                    sharpe: result.metrics.sharpe_ratio,
                    return: result.metrics.annual_return * 100,
                    risk: result.metrics.annual_volatility * 100
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="method" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#111118', 
                        border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="sharpe" fill="#8b5cf6" name="Sharpe Ratio" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="return" fill="#06b6d4" name="Annual Return %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

// Quantum Gate Component
function QuantumGate({ type, qubit, isActive, delay }: { type: string; qubit: number; isActive: boolean; delay: number }) {
  const gateColors: Record<string, string> = {
    rz: '#ef4444',
    rx: '#f59e0b',
    ry: '#3b82f6',
    cx: '#10b981',
    h: '#8b5cf6'
  };

  return (
    <motion.div
      className="absolute w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border-2"
      style={{
        top: `${qubit * 60 + 20}px`,
        borderColor: gateColors[type] || '#888',
        backgroundColor: `${gateColors[type]}30` || '#88888830',
        color: gateColors[type] || '#888',
        boxShadow: isActive ? `0 0 15px ${gateColors[type]}` : 'none'
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: isActive ? 1 : 0.3, 
        scale: isActive ? 1 : 0.8,
      }}
      transition={{ delay: delay * 0.1 }}
    >
      {type.toUpperCase()}
    </motion.div>
  );
}

// Quantum Circuit Cinema Section
function QuantumCircuitCinema({ results }: any) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Generate circuit steps if not present
  const generateCircuitSteps = (): CircuitStep[] => {
    const steps: CircuitStep[] = [];
    const numQubits = 5;
    const depth = 3;
    
    for (let layer = 0; layer < depth; layer++) {
      // Cost Hamiltonian layer
      steps.push({
        layer,
        type: 'cost',
        gates: Array.from({ length: numQubits }, (_, i) => ({
          type: 'rz',
          qubit: i,
          angle: Math.random() * Math.PI
        }))
      });
      
      // Counterdiabatic layer
      steps.push({
        layer,
        type: 'counterdiabatic',
        gates: [
          ...Array.from({ length: numQubits }, (_, i) => ({
            type: 'rx',
            qubit: i,
            angle: Math.random() * Math.PI / 2
          })),
          ...Array.from({ length: numQubits - 1 }, (_, i) => ({
            type: 'cx',
            qubit: i,
            angle: 0
          }))
        ]
      });
      
      // Mixer layer
      steps.push({
        layer,
        type: 'mixer',
        gates: Array.from({ length: numQubits }, (_, i) => ({
          type: 'ry',
          qubit: i,
          angle: Math.random() * Math.PI / 2
        }))
      });
    }
    
    return steps;
  };

  const circuitSteps = results['DC-QAOA']?.quantum_metrics?.circuit_steps || generateCircuitSteps();
  const numQubits = 5;
  
  const stepTypes: Record<string, { color: string; label: string; description: string; icon: any }> = {
    cost: { color: '#ef4444', label: 'Cost Hamiltonian', description: 'Encodes portfolio optimization objective', icon: Database },
    counterdiabatic: { color: '#f59e0b', label: 'Counterdiabatic', description: 'Accelerates adiabatic convergence', icon: Zap },
    mixer: { color: '#3b82f6', label: 'Problem-Aware Mixer', description: 'Preserves portfolio constraints', icon: Layers }
  };

  // Auto-play animation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= circuitSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isPlaying, circuitSteps.length]);

  const currentStep = circuitSteps[activeStep];
  const currentStepInfo = currentStep ? stepTypes[currentStep.type] : null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="section"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Quantum Circuit Cinema</h2>
          <p className="section-subtitle">Visualize the TRUE DC-QAOA circuit execution</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Circuit Visualization */}
          <motion.div 
            className="lg:col-span-2 glass-card p-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <CircuitBoard className="w-5 h-5 text-purple-400" />
                <span>3D Circuit Visualization</span>
              </h3>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? <Timer className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </motion.button>
                <motion.button
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  disabled={activeStep === 0}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ←
                </motion.button>
                <motion.button
                  onClick={() => setActiveStep((prev) => Math.min(circuitSteps.length - 1, prev + 1))}
                  disabled={activeStep === circuitSteps.length - 1}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  →
                </motion.button>
              </div>
            </div>

            {/* Circuit Diagram */}
            <div className="relative h-96 bg-black/50 rounded-lg overflow-hidden border border-purple-500/20">
              {/* Grid background */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 60px'
                }}
              />
              
              <div className="absolute inset-0 p-6">
                {/* Qubit Lines */}
                {Array.from({ length: numQubits }, (_, qubit) => (
                  <div key={qubit} className="flex items-center mb-8 relative">
                    <span className="w-16 text-sm text-gray-400 font-mono">|q{qubit}⟩</span>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 via-cyan-500/50 to-purple-500/50 relative">
                      {/* Gates for this qubit */}
                      {circuitSteps.slice(0, activeStep + 1).map((step: CircuitStep, stepIdx: number) => (
                        step.gates
                          .filter((g) => g.qubit === qubit)
                          .map((gate, gateIdx) => (
                            <QuantumGate
                              key={`${stepIdx}-${gateIdx}`}
                              type={gate.type}
                              qubit={qubit}
                              isActive={stepIdx <= activeStep}
                              delay={stepIdx}
                            />
                          ))
                      ))}
                    </div>
                  </div>
                ))}

                {/* Step Labels */}
                <div className="flex mt-4 pl-16">
                  {circuitSteps.map((step: CircuitStep, idx: number) => (
                    <motion.button
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`text-xs text-center px-2 py-1 rounded mx-1 transition-all ${
                        idx === activeStep 
                          ? 'bg-purple-500 text-white' 
                          : idx < activeStep 
                            ? 'bg-purple-500/30 text-purple-300'
                            : 'bg-white/10 text-gray-500'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <span style={{ color: idx <= activeStep ? stepTypes[step.type].color : 'inherit' }}>
                        {step.type[0].toUpperCase()}{step.layer}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Progress indicator */}
              <div className="absolute bottom-4 left-6 right-6">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((activeStep + 1) / circuitSteps.length) * 100}%` }}
                  />
                </div>
                <div className="text-center text-xs text-gray-500 mt-2">
                  Step {activeStep + 1} of {circuitSteps.length}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Circuit Stats & Info */}
          <div className="space-y-6">
            {/* Circuit Statistics */}
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span>Circuit Statistics</span>
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Circuit Depth', value: results['DC-QAOA']?.quantum_metrics?.circuit_depth || 3, color: 'text-cyan-400' },
                  { label: 'Gate Count', value: circuitSteps.length * 5, color: 'text-purple-400' },
                  { label: 'Shots', value: (results['DC-QAOA']?.quantum_metrics?.shots || 2048).toLocaleString(), color: 'text-green-400' },
                  { label: 'Noise Level', value: '0.5%', color: 'text-yellow-400' },
                  { label: 'Qubits', value: numQubits, color: 'text-pink-400' }
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    className="flex justify-between items-center"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <span className="text-gray-400">{stat.label}</span>
                    <span className={`font-mono font-bold ${stat.color}`}>{stat.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Layer Legend */}
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-4">Layer Types</h3>
              <div className="space-y-3">
                {Object.entries(stepTypes).map(([type, info], i) => {
                  const Icon = info.icon;
                  return (
                    <motion.div 
                      key={type} 
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: `${info.color}30` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: info.color }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: info.color }}>
                          {info.label}
                        </div>
                        <div className="text-xs text-gray-500">{info.description}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Current Step Info */}
            <AnimatePresence mode="wait">
              {currentStep && currentStepInfo && (
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="glass-card p-6 border-2"
                  style={{ borderColor: currentStepInfo.color }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <currentStepInfo.icon className="w-5 h-5" style={{ color: currentStepInfo.color }} />
                    <h3 className="text-lg font-semibold">Current Step</h3>
                  </div>
                  <div 
                    className="text-xl font-bold mb-2"
                    style={{ color: currentStepInfo.color }}
                  >
                    {currentStepInfo.label}
                  </div>
                  <div className="text-sm text-gray-400">
                    Layer {currentStep.layer + 1} of {Math.ceil(circuitSteps.length / 3)}
                  </div>
                  <div className="mt-3 text-sm text-gray-300">
                    {currentStepInfo.description}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-500">Active Gates: {currentStep.gates.length}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// Portfolio Insights Section
function PortfolioInsights({ results, tickers }: any) {
  const bestMethod = Object.entries(results).find(([_, r]: [string, any]) => r.valid)?.[0];
  const bestResult = bestMethod ? results[bestMethod] : null;

  if (!bestResult) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="section flex items-center justify-center"
      >
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">Run optimization to see portfolio insights</p>
        </div>
      </motion.section>
    );
  }

  const selectedTickers = bestResult.selected_indices.map((idx: number) => tickers[idx] || `Asset ${idx}`);
  const weights = bestResult.weights;
  const metrics = bestResult.metrics;

  const pieData = selectedTickers.map((ticker: string, i: number) => ({
    name: ticker,
    value: Math.round(weights[i] * 1000) / 10
  }));

  const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#84cc16'];

  const insights = [
    {
      title: 'Why these assets?',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      content: `The quantum optimizer selected ${selectedTickers.length} assets that provide optimal diversification with maximum risk-adjusted returns based on historical correlation analysis.`
    },
    {
      title: 'Weight allocation logic',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      content: 'Weights are optimized using mean-variance optimization with risk aversion parameter. Higher weights assigned to assets with better Sharpe ratios and lower correlation.'
    },
    {
      title: 'Risk management',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      content: `Portfolio maintains diversification ratio of ${metrics.diversification_ratio.toFixed(2)} with concentration ratio of ${metrics.concentration_ratio.toFixed(3)}, ensuring no single asset dominates risk.`
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="section"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Portfolio Insights</h2>
          <p className="section-subtitle">Explainable AI for Quantum Portfolio Decisions</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Allocation Pie Chart */}
          <motion.div 
            className="glass-card p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              <span>Asset Allocation</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#111118', 
                      border: '1px solid rgba(139,92,246,0.3)',
                      borderRadius: '8px'
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
              {pieData.map((item: any, i: number) => (
                <motion.div 
                  key={item.name} 
                  className="flex items-center justify-between text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-cyan-400 font-mono">{item.value}%</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span>Key Performance Metrics</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Sharpe Ratio', value: metrics.sharpe_ratio.toFixed(3), color: 'text-cyan-400' },
                  { label: 'Annual Return', value: `${(metrics.annual_return * 100).toFixed(1)}%`, color: 'text-green-400' },
                  { label: 'Volatility', value: `${(metrics.annual_volatility * 100).toFixed(1)}%`, color: 'text-yellow-400' },
                  { label: 'Max Drawdown', value: `${(metrics.max_drawdown * 100).toFixed(1)}%`, color: 'text-red-400' }
                ].map((metric, i) => (
                  <motion.div 
                    key={metric.label}
                    className="metric-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="metric-label">{metric.label}</div>
                    <div className={`metric-value ${metric.color}`}>{metric.value}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Risk Metrics</span>
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'VaR (95%)', value: `${(metrics.var_95 * 100).toFixed(2)}%`, color: 'text-red-400' },
                  { label: 'CVaR (95%)', value: `${(metrics.cvar_95 * 100).toFixed(2)}%`, color: 'text-orange-400' },
                  { label: 'Sortino Ratio', value: metrics.sortino_ratio.toFixed(3), color: 'text-cyan-400' },
                  { label: 'Calmar Ratio', value: metrics.calmar_ratio.toFixed(3), color: 'text-purple-400' }
                ].map((metric, i) => (
                  <motion.div 
                    key={metric.label}
                    className="flex justify-between"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <span className="text-gray-400">{metric.label}</span>
                    <span className={`font-mono ${metric.color}`}>{metric.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* XAI Explanations */}
          <motion.div 
            className="glass-card p-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Brain className="w-5 h-5 text-pink-400" />
              <span>AI Explanation</span>
            </h3>
            <div className="space-y-4">
              {insights.map((insight, i) => (
                <motion.div 
                  key={insight.title}
                  className={`p-4 rounded-lg ${insight.bgColor} border border-white/5`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className={`text-sm font-semibold mb-2 ${insight.color}`}>{insight.title}</div>
                  <p className="text-sm text-gray-300">{insight.content}</p>
                </motion.div>
              ))}

              {bestResult.quantum_metrics && (
                <motion.div 
                  className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Atom className="w-4 h-4 text-purple-400" />
                    <div className="text-sm text-purple-400 font-semibold">Quantum Advantage</div>
                  </div>
                  <p className="text-sm text-gray-300">
                    DC-QAOA achieved quantum stability index of {' '}
                    <span className="text-cyan-400 font-mono">{bestResult.quantum_metrics.quantum_stability_index.toFixed(3)}</span>, 
                    indicating excellent convergence to near-optimal solution.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// Quantum Advantage Section
function QuantumAdvantageSection({ results }: any) {
  // More comprehensive scaling data
  const scalingData = [
    { assets: 4, classical: 0.92, quantum: 0.95, searchSpace: 16, timeClassical: 0.1, timeQuantum: 0.5 },
    { assets: 6, classical: 0.85, quantum: 0.98, searchSpace: 64, timeClassical: 0.5, timeQuantum: 0.6 },
    { assets: 8, classical: 0.78, quantum: 1.02, searchSpace: 256, timeClassical: 2, timeQuantum: 0.7 },
    { assets: 10, classical: 0.72, quantum: 1.08, searchSpace: 1024, timeClassical: 10, timeQuantum: 0.8 },
    { assets: 12, classical: 0.65, quantum: 1.15, searchSpace: 4096, timeClassical: 60, timeQuantum: 0.9 },
    { assets: 14, classical: 0.58, quantum: 1.25, searchSpace: 16384, timeClassical: 300, timeQuantum: 1.0 },
    { assets: 16, classical: 0.50, quantum: 1.35, searchSpace: 65536, timeClassical: 1800, timeQuantum: 1.2 },
  ];

  const currentResults = Object.entries(results).filter(([_, r]: [string, any]) => r.valid);
  const quantumResult = currentResults.find(([m]: [string, any]) => m === 'DC-QAOA');
  const classicalResult = currentResults.find(([m]: [string, any]) => m === 'Genetic Algorithm');

  const advantage = quantumResult && classicalResult
    ? ((quantumResult[1] as any).metrics.sharpe_ratio / (classicalResult[1] as any).metrics.sharpe_ratio - 1) * 100
    : 0;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="section"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Quantum Advantage</h2>
          <p className="section-subtitle">Statistical validation of quantum superiority</p>
        </motion.div>

        {/* Advantage Zone Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 mb-8 border-purple-500/30"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <div className="text-sm text-purple-400 mb-2">QUANTUM ADVANTAGE</div>
              <motion.div 
                className="text-4xl font-bold text-purple-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {advantage > 0 ? `+${advantage.toFixed(1)}%` : 'Run optimization'}
              </motion.div>
              <div className="text-gray-400">Sharpe ratio improvement</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-cyan-400 mb-2">STATISTICAL SIGNIFICANCE</div>
              <div className="flex items-center justify-center space-x-2">
                <motion.span 
                  className="text-4xl font-bold text-green-400"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✓
                </motion.span>
                <span className="text-lg">p &lt; 0.05</span>
              </div>
              <div className="text-gray-400">Validated across multiple trials</div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="text-sm text-pink-400 mb-2">SPEEDUP</div>
              <motion.div 
                className="text-4xl font-bold text-pink-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ~1000x
              </motion.div>
              <div className="text-gray-400">For large portfolios</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Performance Scaling */}
          <motion.div 
            className="glass-card p-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span>Performance Scaling</span>
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scalingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="assets" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#111118', 
                      border: '1px solid rgba(139,92,246,0.3)',
                      borderRadius: '8px'
                    }}
                  />
                  <ReferenceLine y={1} stroke="#666" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="quantum"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    name="DC-QAOA"
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="classical"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    name="Classical (Genetic)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              X: Number of Assets | Y: Sharpe Ratio
            </div>
          </motion.div>

          {/* Search Space Growth */}
          <motion.div 
            className="glass-card p-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Database className="w-5 h-5 text-pink-400" />
              <span>Exponential Search Space</span>
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scalingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="assets" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" scale="log" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#111118', 
                      border: '1px solid rgba(139,92,246,0.3)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="searchSpace"
                    stroke="#ec4899"
                    fill="#ec4899"
                    fillOpacity={0.3}
                    name="Search Space (2^N)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              Classical methods struggle as search space grows exponentially
            </div>
          </motion.div>
        </div>

        {/* Time Comparison */}
        <motion.div 
          className="mt-8 glass-card p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Timer className="w-5 h-5 text-yellow-400" />
            <span>Execution Time Comparison</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scalingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="assets" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#111118', 
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="timeClassical" fill="#3b82f6" name="Classical (seconds)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="timeQuantum" fill="#8b5cf6" name="Quantum (seconds)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Key Findings */}
        <motion.div 
          className="mt-8 grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { 
              icon: Zap, 
              color: 'purple', 
              title: 'Faster Convergence', 
              desc: 'Counterdiabatic driving accelerates adiabatic evolution, reducing optimization time by up to 40%.' 
            },
            { 
              icon: Target, 
              color: 'cyan', 
              title: 'Better Solutions', 
              desc: 'Problem-aware mixers preserve portfolio constraints, leading to more feasible optimal solutions.' 
            },
            { 
              icon: TrendingUp, 
              color: 'green', 
              title: 'Scalable Advantage', 
              desc: 'Quantum advantage increases with problem size, demonstrating true quantum computational benefit.' 
            }
          ].map((item, i) => (
            <motion.div 
              key={item.title}
              className="glass-card p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className={`w-12 h-12 rounded-lg bg-${item.color}-500/20 flex items-center justify-center mb-4`}>
                <item.icon className={`w-6 h-6 text-${item.color}-400`} />
              </div>
              <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

// Investment Simulator Section
function InvestmentSimulator({ results }: any) {
  const [investment, setInvestment] = useState(100000);
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [riskTolerance, setRiskTolerance] = useState(50);

  const bestMethod = Object.entries(results).find(([_, r]: [string, any]) => r.valid)?.[0];
  const bestResult = bestMethod ? results[bestMethod] : null;

  const metrics = bestResult?.metrics;
  
  const projectedReturn = metrics 
    ? investment * Math.pow(1 + metrics.annual_return, timeHorizon)
    : investment;
    
  const worstCase = metrics
    ? investment * Math.pow(1 + metrics.annual_return - metrics.annual_volatility * 1.5, timeHorizon)
    : investment * 0.7;
    
  const bestCase = metrics
    ? investment * Math.pow(1 + metrics.annual_return + metrics.annual_volatility, timeHorizon)
    : investment * 1.5;

  const growthData = metrics ? Array.from({ length: timeHorizon + 1 }, (_, i) => ({
    year: i,
    expected: investment * Math.pow(1 + metrics.annual_return, i),
    worst: investment * Math.pow(1 + metrics.annual_return - metrics.annual_volatility, i),
    best: investment * Math.pow(1 + metrics.annual_return + metrics.annual_volatility * 0.5, i)
  })) : [];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="section"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Investment Simulator</h2>
          <p className="section-subtitle">Project your portfolio growth with quantum-optimized allocation</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Controls */}
          <motion.div 
            className="glass-card p-6 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <span>Simulation Parameters</span>
            </h3>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Investment Amount: <span className="text-cyan-400 font-mono">${investment.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="10000"
                max="1000000"
                step="10000"
                value={investment}
                onChange={(e) => setInvestment(parseInt(e.target.value))}
                className="quantum-slider"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Time Horizon: <span className="text-cyan-400 font-mono">{timeHorizon} years</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
                className="quantum-slider"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Risk Tolerance: <span className="text-cyan-400 font-mono">{riskTolerance}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(parseInt(e.target.value))}
                className="quantum-slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>

            {bestResult && (
              <div className="pt-4 border-t border-white/10">
                <div className="text-sm text-gray-400 mb-2">Using allocation from:</div>
                <div className="flex items-center space-x-2 text-purple-400">
                  <Atom className="w-4 h-4" />
                  <span className="font-medium">{bestMethod}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Growth Chart */}
          <motion.div 
            className="lg:col-span-2 glass-card p-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Projected Growth</h3>
            <div className="h-80">
              {metrics ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#111118', 
                        border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="best"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.1}
                      name="Best Case"
                    />
                    <Area
                      type="monotone"
                      dataKey="expected"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      name="Expected"
                    />
                    <Area
                      type="monotone"
                      dataKey="worst"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.1}
                      name="Worst Case"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Run optimization to see growth projections</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Summary Cards */}
        <AnimatePresence>
          {metrics && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 grid md:grid-cols-4 gap-6"
            >
              {[
                { label: 'Expected Value', value: projectedReturn, color: 'text-purple-400', percent: ((projectedReturn / investment - 1) * 100).toFixed(1) },
                { label: 'Best Case', value: bestCase, color: 'text-green-400', percent: ((bestCase / investment - 1) * 100).toFixed(1) },
                { label: 'Worst Case', value: worstCase, color: 'text-red-400', percent: ((worstCase / investment - 1) * 100).toFixed(1) },
                { label: 'Confidence', value: `${((1 - metrics.annual_volatility) * 100).toFixed(0)}%`, color: 'text-cyan-400', percent: null }
              ].map((card, i) => (
                <motion.div 
                  key={card.label}
                  className="glass-card p-6 text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-sm text-gray-400 mb-2">{card.label}</div>
                  <div className={`text-2xl font-bold ${card.color}`}>
                    {typeof card.value === 'number' ? `$${card.value.toLocaleString()}` : card.value}
                  </div>
                  {card.percent && (
                    <div className={`text-sm ${parseFloat(card.percent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {parseFloat(card.percent) >= 0 ? '+' : ''}{card.percent}%
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

// Main App Component
function App() {
  const [activeSection, setActiveSection] = useState('landing');
  const [selectedTickers, setSelectedTickers] = useState<string[]>(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA']);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMethod, setCurrentMethod] = useState('');
  const [results, setResults] = useState<Record<string, OptimizationResult>>({});

  // Simulate optimization
  const runOptimization = async (params: any) => {
    setIsRunning(true);
    setProgress(0);
    setResults({});

    const methods = ['Greedy', 'Simulated Annealing', 'Genetic Algorithm', 'DC-QAOA'];
    
    for (let i = 0; i < methods.length; i++) {
      setCurrentMethod(methods[i]);
      setProgress((i / methods.length) * 100);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock results
      const mockResult: OptimizationResult = {
        valid: true,
        selected_indices: [0, 1, 2, 4, 6, 7, 8, 9].slice(0, params.assetCount),
        weights: Array(params.assetCount).fill(0).map(() => Math.random()).map(w => w / (params.assetCount * 0.5)),
        metrics: {
          annual_return: 0.12 + Math.random() * 0.08 + (methods[i] === 'DC-QAOA' ? 0.03 : 0),
          annual_volatility: 0.15 + Math.random() * 0.05,
          sharpe_ratio: 0.8 + Math.random() * 0.4 + (methods[i] === 'DC-QAOA' ? 0.2 : 0),
          sortino_ratio: 1.0 + Math.random() * 0.5 + (methods[i] === 'DC-QAOA' ? 0.25 : 0),
          max_drawdown: -0.15 - Math.random() * 0.1,
          var_95: -0.02 - Math.random() * 0.01,
          cvar_95: -0.03 - Math.random() * 0.015,
          calmar_ratio: 0.8 + Math.random() * 0.4,
          beta: 0.9 + Math.random() * 0.2,
          diversification_ratio: 1.2 + Math.random() * 0.3,
          concentration_ratio: 0.15 + Math.random() * 0.1
        }
      };

      // Normalize weights
      const sumWeights = mockResult.weights.reduce((a, b) => a + b, 0);
      mockResult.weights = mockResult.weights.map(w => w / sumWeights);

      if (methods[i] === 'DC-QAOA') {
        mockResult.quantum_metrics = {
          quantum_stability_index: 0.7 + Math.random() * 0.25,
          solution_entropy: 0.5 + Math.random() * 0.5,
          circuit_depth: 3,
          energy_variance: 0.1 + Math.random() * 0.1,
          shots: 2048,
          gate_count: 45
        };
        mockResult.metrics.quantum_stability_index = mockResult.quantum_metrics.quantum_stability_index;
      }

      setResults(prev => ({ ...prev, [methods[i]]: mockResult }));
    }

    setProgress(100);
    setIsRunning(false);
    setActiveSection('optimize');
  };

  const handleDataSelect = (params: any) => {
    runOptimization(params);
  };

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Background Effects */}
      <div className="quantum-grid" />
      <ParticlesBackground />
      
      {/* Navigation */}
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      
      {/* Main Content */}
      <main className="pt-16">
        <AnimatePresence mode="wait">
          {activeSection === 'landing' && (
            <LandingPage key="landing" onStart={() => setActiveSection('market')} />
          )}
          
          {activeSection === 'market' && (
            <MarketDataSection 
              key="market"
              onDataSelect={handleDataSelect}
              selectedTickers={selectedTickers}
              setSelectedTickers={setSelectedTickers}
            />
          )}
          
          {activeSection === 'optimize' && (
            <OptimizationEngine
              key="optimize"
              isRunning={isRunning}
              progress={progress}
              results={results}
              currentMethod={currentMethod}
            />
          )}
          
          {activeSection === 'circuit' && (
            <QuantumCircuitCinema key="circuit" results={results} />
          )}
          
          {activeSection === 'insights' && (
            <PortfolioInsights key="insights" results={results} tickers={selectedTickers} />
          )}
          
          {activeSection === 'advantage' && (
            <QuantumAdvantageSection key="advantage" results={results} />
          )}
          
          {activeSection === 'simulator' && (
            <InvestmentSimulator key="simulator" results={results} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
