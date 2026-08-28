import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, ArrowLeft, X, CheckCircle2, 
  HelpCircle, Wallet, Cpu, Activity, TrendingUp, Lightbulb
} from 'lucide-react';

export interface TourStep {
  targetSection: string;
  title: string;
  badge: string;
  description: string;
  icon: any;
  tip: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    targetSection: 'portfolio',
    title: '1. Live Demat Holdings & Broker Sync',
    badge: 'Portfolio Workspace',
    description: 'Import your live stocks with 1-click Free Zerodha TOTP login, Groww report upload, or drag & drop CSV. View real-time P&L in Indian Rupees (₹).',
    icon: Wallet,
    tip: 'Try clicking "Zerodha (Free TOTP)" or uploading sample_indian_holdings.csv to test immediately!'
  },
  {
    targetSection: 'market',
    title: '2. Dynamic Market Data & Custom Tickers',
    badge: 'Real-Time Pricing',
    description: 'Explore live NSE/BSE stock covariance, historical daily returns, and adjust your asset count and risk tolerance before quantum simulation.',
    icon: Activity,
    tip: 'You can customize risk aversion from Aggressive to Conservative.'
  },
  {
    targetSection: 'optimize',
    title: '3. Quantum DC-QAOA Optimization Engine',
    badge: 'Quantum Simulation',
    description: 'Watch IBM Qiskit run Digitized Counterdiabatic QAOA side-by-side with Classical Genetic Algorithms and Simulated Annealing in real-time.',
    icon: Cpu,
    tip: 'DC-QAOA utilizes Problem-Aware Counterdiabatic Mixers to escape classical local minima.'
  },
  {
    targetSection: 'advantage',
    title: '4. Quantum Advantage Verification',
    badge: 'Statistical Edge',
    description: 'Compare Sharpe ratio improvements, risk-adjusted returns, and quantum stability index over classical heuristics.',
    icon: Sparkles,
    tip: 'Calculates Jensen\'s Alpha, Sortino, and Value at Risk (VaR 95% / 99%).'
  },
  {
    targetSection: 'simulator',
    title: '5. Multi-Year Wealth Growth Simulator',
    badge: 'Forward Projection',
    description: 'Simulate 1 to 20-year portfolio wealth trajectories under Best-Case, Expected, and Stressed Market scenarios in Indian Rupees (₹).',
    icon: TrendingUp,
    tip: 'Adjust the investment capital slider to project your expected rupee returns.'
  }
];

interface InteractiveTourProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function InteractiveTour({ setActiveSection }: InteractiveTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('qalpha_has_seen_tour');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setActiveSection(TOUR_STEPS[0].targetSection);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [setActiveSection]);

  const handleStartTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
    setActiveSection(TOUR_STEPS[0].targetSection);
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setActiveSection(TOUR_STEPS[next].targetSection);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setActiveSection(TOUR_STEPS[prev].targetSection);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('qalpha_has_seen_tour', 'true');
    setIsOpen(false);
  };

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <>
      {/* Help / Replay Tour Floating Button */}
      <motion.button
        onClick={handleStartTour}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-bold shadow-xl shadow-purple-900/40 border border-purple-400/30 backdrop-blur-md transition-all group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Interactive Platform Tour"
      >
        <HelpCircle className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
        <span>Platform Guide (?)</span>
      </motion.button>

      {/* Tour Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-card max-w-lg w-full p-6 rounded-3xl border border-purple-500/30 bg-[#0d0d17]/95 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Step {currentStep + 1} of {TOUR_STEPS.length}
                    </span>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {step.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={handleComplete}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Skip Tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {step.description}
                </p>

                {/* Helpful Tip Callout */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5 text-xs text-purple-200">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Tip:</strong> {step.tip}</span>
                </div>
              </div>

              {/* Progress Dots & Buttons */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentStep(i);
                        setActiveSection(TOUR_STEPS[i].targetSection);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentStep 
                          ? 'w-6 bg-gradient-to-r from-purple-400 to-cyan-400' 
                          : 'w-1.5 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-sm transition-all"
                  >
                    {currentStep === TOUR_STEPS.length - 1 ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </>
                    ) : (
                      <>
                        <span>Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
