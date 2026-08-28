import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Atom, Cpu, Network, Zap, GitBranch, Layers, 
  ChevronDown, ChevronUp, BarChart3
} from 'lucide-react';

export function QuantumClassicalDeepDive() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'landscape' | 'math' | 'breakdown'>('architecture');
  const [expandedMethod, setExpandedMethod] = useState<string | null>('dc-qaoa');

  return (
    <div className="mt-12 space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider">
          <Atom className="w-3.5 h-3.5" />
          Algorithmic Mechanism & Quantum Advantage Explained
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
          Why DC-QAOA Outperforms Classical Heuristics
        </h3>
        <p className="text-sm text-gray-400 max-w-3xl mx-auto">
          In portfolio optimization with cardinality and transaction boundaries, the loss landscape is non-convex with millions of local traps. Here is the mathematical and architectural breakdown of each approach.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'architecture', label: '1. Mechanism Comparison', icon: GitBranch },
          { id: 'landscape', label: '2. Energy Landscape & Tunneling', icon: Layers },
          { id: 'math', label: '3. Hamiltonian Formulation (QUBO)', icon: Network },
          { id: 'breakdown', label: '4. Algorithm Cheat Sheet', icon: BarChart3 }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === t.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Mechanism Comparison Diagrams */}
      {activeTab === 'architecture' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Classical Method Card */}
          <div className="glass-card p-6 rounded-2xl border border-blue-500/20 bg-blue-950/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Classical Optimization Pipeline</h4>
                  <span className="text-[11px] text-blue-400 font-mono">Greedy / Simulated Annealing / Genetic</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Single-Path Exploration
              </span>
            </div>

            {/* ASCII Flow Diagram */}
            <div className="bg-black/60 rounded-xl p-4 font-mono text-xs text-gray-300 border border-white/5 space-y-2 overflow-x-auto">
              <div className="text-blue-400 font-bold">// Sequential / Stochastic State Transitions</div>
              <div className="text-gray-400">[Start: Random Portfolio State |x₀⟩]</div>
              <div className="text-gray-500 pl-4">│  (Greedy / Annealing / Genetic Crossover)</div>
              <div className="text-gray-400 pl-4">▼</div>
              <div className="text-gray-300 pl-4">Evaluate Objective: J(x) = -μᵀx + λ xᵀΣx</div>
              <div className="text-amber-400 pl-4">⚠ Hit Energy Barrier (High Volatility Asset Zone)</div>
              <div className="text-gray-500 pl-4">│  Thermal fluctuations struggle to jump high barriers</div>
              <div className="text-gray-400 pl-4">▼</div>
              <div className="text-rose-400 font-bold">[Stuck: Suboptimal Local Minimum x_local]</div>
            </div>

            <div className="text-xs text-gray-300 space-y-2">
              <p className="leading-relaxed">
                <strong>Why Classical Struggles:</strong> Real-world portfolios involve cardinality constraints (e.g. pick exactly $k=8$ stocks). This makes the configuration space $2^N$ discrete and fractured. Simulated annealing takes exponential steps to hop across high-risk barriers, frequently getting trapped in local minima.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block">Time Complexity</span>
                  <span className="font-bold text-rose-400 text-xs">O(2ᴺ) Worst-case</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block">Barrier Penetration</span>
                  <span className="font-bold text-amber-400 text-xs">Thermal Hopping only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quantum DC-QAOA Card */}
          <div className="glass-card p-6 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                  <Atom className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Quantum DC-QAOA Pipeline</h4>
                  <span className="text-[11px] text-purple-400 font-mono">Counterdiabatic Mixers + Superposition</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Quantum Superposition 2ᴺ
              </span>
            </div>

            {/* ASCII Flow Diagram */}
            <div className="bg-black/60 rounded-xl p-4 font-mono text-xs text-gray-300 border border-purple-500/20 space-y-2 overflow-x-auto">
              <div className="text-purple-400 font-bold">// Quantum Superposition State Evolution</div>
              <div className="text-gray-400">[Init: Superposition |ψ₀⟩ = ⊗ Hadamard |+⟩ᴺ]</div>
              <div className="text-purple-400 pl-4">│  Simultaneously explores ALL 2ᴺ candidate portfolios</div>
              <div className="text-gray-400 pl-4">▼</div>
              <div className="text-gray-300 pl-4">Apply Cost Phase: e^(-i γ H_C) (Encodes Return & Covariance)</div>
              <div className="text-cyan-400 pl-4">⚡ Apply Counterdiabatic Mixer: e^(-i β H_CD)</div>
              <div className="text-purple-400 pl-4">│  Forces quantum state to tunnel THROUGH energy barriers</div>
              <div className="text-gray-400 pl-4">▼</div>
              <div className="text-emerald-400 font-bold">[Collapse: Global Optimal Portfolio State |ψ_opt⟩]</div>
            </div>

            <div className="text-xs text-gray-300 space-y-2">
              <p className="leading-relaxed">
                <strong>Why DC-QAOA Wins:</strong> Digitized Counterdiabatic Quantum Approximate Optimization introduces extra non-commuting momentum operators (CD terms) into the mixer layer. This prevents non-adiabatic excitations and enables <strong>quantum tunneling</strong> through steep non-convex covariance barriers in polynomial circuit depth.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block">Exploration Speed</span>
                  <span className="font-bold text-cyan-400 text-xs">Simultaneous 2ᴺ States</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block">Barrier Penetration</span>
                  <span className="font-bold text-emerald-400 text-xs">Quantum Tunneling</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Energy Landscape & Tunneling Visualizer */}
      {activeTab === 'landscape' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-white">Loss Landscape: Thermal Hopping vs Quantum Tunneling</h4>
              <p className="text-xs text-gray-400">
                Visualizing how classical algorithms get trapped in local dips while quantum wavefunctions tunnel directly to the global minimum.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-0.5 bg-rose-500 inline-block" /> Classical (Trapped)
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Quantum (Tunneling)
              </div>
            </div>
          </div>

          {/* Graphical Landscape Mockup */}
          <div className="p-6 rounded-xl bg-black/60 border border-white/10 relative overflow-hidden font-mono text-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-gray-400 text-[11px] border-b border-white/10 pb-2">
                <span>Energy / Risk Landscape (Variance - Returns)</span>
                <span>Lower is Better ↓</span>
              </div>

              {/* ASCII Curve Representation */}
              <div className="text-gray-400 space-y-1 leading-tight select-none">
                <div className="text-gray-500">High Risk ┌───────────────────────────────────────────────────────────┐</div>
                <div>          │     /\          /\                                    │</div>
                <div>          │    /  \  /\    /  \      /\   Classical Trap         │</div>
                <div>          │   /    \/  \  /    \    /  \   [Local Min]            │</div>
                <div className="text-rose-400">          │  /      \  \/      \  /    \  /   ● ← Simulated Annealing  │</div>
                <div className="text-cyan-400 font-bold">          │ /        \══════════\══════\═▶ ★ ← Quantum DC-QAOA  │</div>
                <div className="text-emerald-400 font-bold">          │/          [Quantum Tunneling]     \      [Global Minimum]   │</div>
                <div className="text-emerald-400 font-bold">          │                                    \____/                   │</div>
                <div className="text-gray-500">Low Risk  └───────────────────────────────────────────────────────────┘</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs text-gray-300">
                <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <span className="font-bold text-rose-300 block mb-1">Classical Annealing Trap</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Must climb energy barriers via temperature parameter $T$. When cooling down ($T \to 0$), the algorithm freezes inside the nearest sub-optimal basin, yielding lower Sharpe ratios.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <span className="font-bold text-purple-300 block mb-1">DC-QAOA Counterdiabatic Wave</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Wavefunction probability density penetrates directly through high-variance barriers. Counterdiabatic mixers suppress state leakage, preserving optimal ground state fidelity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 3: Mathematical QUBO & Hamiltonian Form */}
      {activeTab === 'math' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* QUBO Formulation */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              1. Portfolio QUBO Mapping
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              We cast Markowitz mean-variance optimization with cardinality into a Quadratic Unconstrained Binary Optimization problem:
            </p>

            <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-purple-300 space-y-2 overflow-x-auto">
              <div className="text-gray-400">// Cost Function Minimization</div>
              <div className="text-white font-bold">
                min H_C(x) = - μᵀx + λ xᵀΣx + P (Σ xᵢ - K)²
              </div>
              <div className="text-[11px] text-gray-400 pt-1">
                Where:<br/>
                • μ = Annualized Return Vector (252-day expected mean)<br/>
                • Σ = Asset Covariance Matrix (Risk / Volatility coupling)<br/>
                • λ = Risk Aversion Multiplier<br/>
                • P = Cardinality Constraint Penalty (forces selection of K assets)
              </div>
            </div>
          </div>

          {/* Quantum Pauli Ising Hamiltonian */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              2. Qubit Pauli Z & Mixer Representation
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Binary decision variables x_i in [0, 1] are transformed into Pauli spin operators sigma_i^z in [-1, +1] via x_i = (I - sigma_i^z) / 2:
            </p>

            <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-cyan-300 space-y-2 overflow-x-auto">
              <div className="text-gray-400">// Quantum Circuit Operators</div>
              <div className="text-white font-bold">
                H_Ising = Σ hᵢ σᵢᶻ + Σ Jᵢⱼ σᵢᶻ σⱼᶻ
              </div>
              <div className="text-[11px] text-gray-400 pt-1">
                Mixer Operators:<br/>
                • Standard QAOA Mixer: H_M = Σ σᵢˣ<br/>
                • DC-QAOA Counterdiabatic: H_CD = Σ (σᵢˣ σⱼʸ - σᵢʸ σⱼˣ) + Σ σᵢˣ<br/>
                • Benefit: Enforces exact Hamming weight ($K$ assets) throughout circuit depth!
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 4: Algorithm Deep-Dive Cheat Sheet */}
      {activeTab === 'breakdown' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
        >
          <div className="p-5 border-b border-white/10">
            <h4 className="text-base font-bold text-white">Full Optimizer Capability Matrix</h4>
            <p className="text-xs text-gray-400">Detailed algorithmic characteristics, failure modes, and quantum advantage metrics.</p>
          </div>

          <div className="divide-y divide-white/5 text-xs text-gray-300">
            {[
              {
                id: 'greedy',
                name: 'Greedy Heuristic Selection',
                type: 'Classical 1D Heuristic',
                status: 'Baseline',
                speed: 'Fastest (O(N log N))',
                quality: 'Lowest (Ignores Cross-Asset Covariance)',
                desc: 'Selects the top-K assets with highest individual Sharpe ratios. Completely misses hedging benefits (e.g. negative covariance between tech and gold).',
                risk: 'High portfolio concentration and catastrophic correlation collapse during market drawdowns.'
              },
              {
                id: 'sa',
                name: 'Simulated Annealing (SA)',
                type: 'Classical Stochastic Markov Chain',
                status: 'Standard Classical',
                speed: 'Medium (500 iterations)',
                quality: 'Moderate (Prone to Local Traps)',
                desc: 'Probabilistically accepts worse solutions with probability e^(-ΔE/T) to escape local dips. Works well in smooth landscapes, but cardinality constraints create sharp energy walls.',
                risk: 'Tends to get trapped in local minimum when temperature T drops below threshold.'
              },
              {
                id: 'ga',
                name: 'Genetic Algorithm (GA)',
                type: 'Classical Evolutionary Population',
                status: 'Top Classical',
                speed: 'Slower (50 generations x 30 population)',
                quality: 'High Classical Benchmark',
                desc: 'Simulates Darwinian selection, crossover, and mutation across candidate binary vectors. Maintains diversity in search space.',
                risk: 'Exponential compute overhead with large stock universes; premature gene convergence.'
              },
              {
                id: 'dc-qaoa',
                name: 'Digitized Counterdiabatic QAOA (DC-QAOA)',
                type: 'Quantum-Assisted NISQ Circuit',
                status: 'Quantum Advantage',
                speed: 'Quantum Linear Scaling (p=3 layers, 2048 shots)',
                quality: 'Global Optimum (Quantum Ground State)',
                desc: 'Combines parameterized quantum gates with problem-aware counterdiabatic mixers on simulated qubits. Explores all 2^N states simultaneously in superposition.',
                risk: 'Requires quantum hardware or Aer simulator; best suited for NISQ era financial combinatorics.'
              }
            ].map((m) => {
              const isExpanded = expandedMethod === m.id;
              return (
                <div key={m.id} className="p-4 hover:bg-white/[0.01] transition-colors">
                  <div 
                    onClick={() => setExpandedMethod(isExpanded ? null : m.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        m.id === 'dc-qaoa' ? 'bg-purple-400 shadow-sm shadow-purple-500' : 'bg-blue-400'
                      }`} />
                      <div>
                        <span className="font-bold text-white text-sm">{m.name}</span>
                        <span className="text-gray-500 ml-2 text-[11px]">({m.type})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.id === 'dc-qaoa' 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                          : 'bg-white/5 text-gray-400'
                      }`}>
                        {m.status}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-3 border-t border-white/5 space-y-3"
                    >
                      <p className="text-gray-300 leading-relaxed">{m.desc}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                        <div className="p-2.5 rounded-lg bg-white/5">
                          <span className="text-gray-400 block">Execution Speed:</span>
                          <span className="font-semibold text-gray-200">{m.speed}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/5">
                          <span className="text-gray-400 block">Solution Quality:</span>
                          <span className="font-semibold text-cyan-400">{m.quality}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/5">
                          <span className="text-gray-400 block">Limitation / Vulnerability:</span>
                          <span className="font-semibold text-rose-300">{m.risk}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
