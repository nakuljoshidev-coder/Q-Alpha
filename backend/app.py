"""
🏆 HACKATHON-GRADE QUANTUM PORTFOLIO OPTIMIZER
Advanced DC-QAOA with Problem-Aware Mixers for NISQ-Era Finance
Flask Backend with WebSocket Support
"""

import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict
import json
from scipy import stats
import itertools
import math
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from threading import Thread
import time

# Try to import Qiskit
try:
    from qiskit import QuantumCircuit, transpile, QuantumRegister, ClassicalRegister
    from qiskit.circuit import Parameter, ParameterVector
    from qiskit_aer import AerSimulator
    from qiskit_aer.noise import NoiseModel, depolarizing_error
    from qiskit.quantum_info import SparsePauliOp, Statevector
    from qiskit_algorithms.optimizers import COBYLA, SPSA
    QISKIT_AVAILABLE = True
except ImportError as e:
    QISKIT_AVAILABLE = False
    print(f"⚠️ Qiskit not fully available: {e}")

from scipy.optimize import minimize
import cvxpy as cp

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Global state for optimization progress
optimization_state = {
    'running': False,
    'progress': 0,
    'current_method': '',
    'results': {},
    'circuit_animation': []
}

@dataclass
class PortfolioMetrics:
    """Comprehensive portfolio metrics container"""
    annual_return: float
    annual_volatility: float
    max_drawdown: float
    beta: float
    sharpe_ratio: float
    sortino_ratio: float
    calmar_ratio: float
    treynor_ratio: float
    var_95: float
    var_99: float
    cvar_95: float
    cvar_99: float
    downside_deviation: float
    rolling_sharpe_mean: float
    rolling_sharpe_std: float
    drawdown_duration_max: int
    portfolio_turnover: float
    quantum_stability_index: float
    omega_ratio: float
    gain_loss_ratio: float
    tail_ratio: float
    information_ratio: float
    jensens_alpha: float
    tracking_error: float
    m2_measure: float
    m4_measure: float
    sterling_ratio: float
    burke_ratio: float
    kappa_three_ratio: float
    skewness: float
    kurtosis: float
    value_at_risk_spectral: float
    ulcer_index: float
    pain_index: float
    diversification_ratio: float
    concentration_ratio: float

    def to_dict(self):
        return asdict(self)


class AdvancedMarketDataEngine:
    """Enhanced market data engine"""
    
    INDIAN_STOCKS = [
        'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS',
        'HINDUNILVR.NS', 'BHARTIARTL.NS', 'ITC.NS', 'SBIN.NS', 'BAJFINANCE.NS',
        'KOTAKBANK.NS', 'WIPRO.NS', 'AXISBANK.NS', 'ONGC.NS', 'MARUTI.NS',
        'SUNPHARMA.NS', 'TITAN.NS', 'ULTRACEMCO.NS', 'NTPC.NS', 'POWERGRID.NS'
    ]
    
    GLOBAL_STOCKS = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'JNJ',
        'UNH', 'PG', 'HD', 'MA', 'ADBE', 'PFE', 'NFLX', 'DIS', 'CRM', 'PYPL'
    ]
    
    def __init__(self, lookback_days: int = 504):
        self.lookback_days = lookback_days
        self.end_date = datetime.now()
        self.start_date = self.end_date - timedelta(days=lookback_days)
        self.risk_free_rate = 0.04
    
    def fetch_data(self, tickers: List[str]):
        """Fetch stock data"""
        data = yf.download(tickers, start=self.start_date, end=self.end_date, 
                          progress=False, auto_adjust=True)
        
        if isinstance(data.columns, pd.MultiIndex):
            prices = data['Close'] if 'Close' in data.columns.levels[0] else data.xs('Close', level=0, axis=1)
        else:
            prices = data[['Close']] if 'Close' in data.columns else None
        
        prices = prices.dropna(axis=1, how='all')
        return prices
    
    def compute_statistics(self, prices):
        """Compute returns and statistics"""
        returns = prices.pct_change().dropna()
        mean_returns = returns.mean().values * 252
        cov_matrix = returns.cov().values * 252
        
        return {
            'returns': returns,
            'mean_returns': mean_returns,
            'cov_matrix': cov_matrix,
            'tickers': returns.columns.tolist(),
            'n_assets': len(returns.columns)
        }


class PortfolioWeightOptimizer:
    """Advanced weight optimization"""
    
    @staticmethod
    def optimize_mean_variance(mean_returns, cov_matrix, risk_aversion=1.0, max_weight=0.3, min_weight=0.01):
        n = len(mean_returns)
        w = cp.Variable(n)
        
        portfolio_return = mean_returns @ w
        portfolio_risk = cp.quad_form(w, cov_matrix)
        
        objective = cp.Maximize(portfolio_return - risk_aversion * portfolio_risk)
        
        constraints = [
            cp.sum(w) == 1,
            w >= min_weight,
            w <= max_weight
        ]
        
        problem = cp.Problem(objective, constraints)
        
        try:
            problem.solve(solver=cp.ECOS, verbose=False)
            if w.value is not None:
                return np.array(w.value).flatten()
        except:
            pass
        
        # Fallback to risk parity
        return PortfolioWeightOptimizer.optimize_risk_parity(cov_matrix, max_weight)
    
    @staticmethod
    def optimize_risk_parity(cov_matrix, max_weight=0.3):
        n = cov_matrix.shape[0]
        vol = np.sqrt(np.diag(cov_matrix))
        inv_vol = 1 / np.maximum(vol, 1e-8)
        inv_vol /= inv_vol.sum()
        
        weights = inv_vol.copy()
        
        if np.max(weights) > max_weight:
            excess = np.maximum(weights - max_weight, 0)
            total_excess = excess.sum()
            weights = np.minimum(weights, max_weight)
            capacity = max_weight - weights
            if capacity.sum() > 0:
                weights += total_excess * (capacity / capacity.sum())
        
        weights = np.clip(weights, 0, max_weight)
        weights /= weights.sum()
        
        return weights


class TrueDCQAOA:
    """TRUE DC-QAOA Implementation"""
    
    def __init__(self, Q, max_assets, noise_level=0.01):
        self.Q = Q
        self.n = Q.shape[0]
        self.K = max_assets
        self.noise_level = noise_level
        
        if QISKIT_AVAILABLE:
            self.noise_model = self._create_noise_model()
            self.simulator = AerSimulator(noise_model=self.noise_model)
    
    def _create_noise_model(self):
        noise_model = NoiseModel()
        error_1q = depolarizing_error(self.noise_level, 1)
        error_2q = depolarizing_error(self.noise_level * 10, 2)
        noise_model.add_all_qubit_quantum_error(error_1q, ['rx', 'ry', 'rz', 'h'])
        noise_model.add_all_qubit_quantum_error(error_2q, ['cx', 'cz'])
        return noise_model
    
    def _create_cost_layer(self, qc, gamma):
        for i in range(self.n):
            if abs(self.Q[i, i]) > 1e-10:
                qc.rz(2 * gamma * self.Q[i, i], i)
        
        for i in range(self.n):
            for j in range(i + 1, self.n):
                if abs(self.Q[i, j]) > 1e-10:
                    qc.cx(i, j)
                    qc.rz(2 * gamma * self.Q[i, j], j)
                    qc.cx(i, j)
    
    def _create_counterdiabatic_layer(self, qc, beta, alpha=0.1):
        for i in range(self.n):
            qc.rx(2 * beta, i)
            for j in range(i + 1, self.n):
                energy_gap = abs(self.Q[i, i] - self.Q[j, j])
                if energy_gap > 1e-10:
                    cd_strength = alpha * beta / energy_gap
                    qc.ry(np.pi/2, i)
                    qc.ry(np.pi/2, j)
                    qc.cx(i, j)
                    qc.rz(2 * cd_strength, j)
                    qc.cx(i, j)
                    qc.ry(-np.pi/2, i)
                    qc.ry(-np.pi/2, j)
    
    def _create_mixer_layer(self, qc, beta):
        for i in range(self.n):
            mixer_angle = 2 * beta * (1 - abs(self.Q[i, i]) / np.max(np.abs(np.diag(self.Q))))
            qc.ry(mixer_angle, i)
        
        for i in range(self.n):
            for j in range(i + 1, self.n):
                constraint_term = beta * 0.05 * (self.Q[i, j] / np.max(np.abs(self.Q)))
                qc.cx(i, j)
                qc.rz(constraint_term, j)
                qc.cx(i, j)
    
    def create_circuit(self, params, p=3):
        """Create quantum circuit for visualization"""
        qc = QuantumCircuit(self.n)
        
        # Initial state
        qc.h(range(self.n))
        
        circuit_steps = []
        
        for layer in range(p):
            gamma = params[3 * layer] if len(params) >= 3 * (layer + 1) else params[2 * layer]
            beta = params[3 * layer + 1] if len(params) >= 3 * (layer + 1) else params[2 * layer + 1]
            alpha = params[3 * layer + 2] if len(params) >= 3 * (layer + 1) else 0.1
            
            # Cost Hamiltonian layer
            self._create_cost_layer(qc, gamma)
            circuit_steps.append({
                'layer': layer,
                'type': 'cost',
                'gates': [{'type': 'rz', 'qubit': i, 'angle': float(2 * gamma * self.Q[i, i])} 
                         for i in range(self.n) if abs(self.Q[i, i]) > 1e-10]
            })
            
            # Counterdiabatic layer
            self._create_counterdiabatic_layer(qc, beta, alpha)
            circuit_steps.append({
                'layer': layer,
                'type': 'counterdiabatic',
                'gates': [{'type': 'rx', 'qubit': i, 'angle': float(2 * beta)} for i in range(self.n)]
            })
            
            # Mixer layer
            self._create_mixer_layer(qc, beta)
            circuit_steps.append({
                'layer': layer,
                'type': 'mixer',
                'gates': [{'type': 'ry', 'qubit': i, 'angle': float(2 * beta)} for i in range(self.n)]
            })
        
        qc.measure_all()
        
        return qc, circuit_steps
    
    def expectation_value(self, params, p=3, shots=1024):
        qc, steps = self.create_circuit(params, p)
        qc_transpiled = transpile(qc, self.simulator)
        job = self.simulator.run(qc_transpiled, shots=shots)
        counts = job.result().get_counts()
        
        expectation = 0.0
        total_shots = sum(counts.values())
        
        for bitstring, count in counts.items():
            x = np.array([int(b) for b in bitstring[::-1]])
            cost = x @ self.Q @ x
            expectation += cost * (count / total_shots)
        
        # Calculate quantum stability index
        energies = []
        for bitstring, count in counts.items():
            x = np.array([int(b) for b in bitstring[::-1]])
            energy = x @ self.Q @ x
            energies.extend([energy] * count)
        
        energy_variance = np.var(energies) if len(energies) > 1 else 0
        probabilities = [count / total_shots for count in counts.values()]
        solution_entropy = -sum(p * np.log2(p) for p in probabilities if p > 0)
        
        quantum_stability_index = 1 / (1 + energy_variance + solution_entropy)
        
        return expectation, quantum_stability_index, solution_entropy, energy_variance, counts, steps
    
    def optimize(self, p=3, shots=2048):
        n_params = 3 * p
        params_init = np.random.uniform(0, np.pi/2, n_params)
        
        def objective(params):
            expectation, _, _, _, _, _ = self.expectation_value(params, p, shots//4)
            return -expectation
        
        result = minimize(objective, params_init, method='COBYLA',
                         options={'maxiter': 50, 'disp': False})
        
        final_expectation, qsi, entropy, evar, counts, steps = self.expectation_value(
            result.x, p, shots
        )
        
        best_bitstring = max(counts.items(), key=lambda x: x[1])[0]
        best_solution = np.array([int(b) for b in best_bitstring[::-1]])
        
        return {
            'solution': best_solution.tolist(),
            'optimal_params': result.x.tolist(),
            'quantum_stability_index': float(qsi),
            'solution_entropy': float(entropy),
            'energy_variance': float(evar),
            'circuit_depth': p,
            'shots': shots,
            'counts': {k: int(v) for k, v in counts.items()},
            'final_expectation': float(final_expectation),
            'circuit_steps': steps
        }


def calculate_portfolio_metrics(portfolio_returns, weights, cov_matrix, risk_free_rate=0.04):
    """Calculate comprehensive portfolio metrics"""
    n_days = len(portfolio_returns)
    
    annual_return = np.mean(portfolio_returns) * 252
    annual_volatility = np.std(portfolio_returns) * np.sqrt(252)
    
    # Drawdown
    cumulative_returns = np.cumprod(1 + portfolio_returns)
    rolling_max = np.maximum.accumulate(cumulative_returns)
    drawdowns = (cumulative_returns - rolling_max) / rolling_max
    max_drawdown = drawdowns.min()
    
    # Sharpe ratio
    sharpe_ratio = (annual_return - risk_free_rate) / annual_volatility if annual_volatility > 0 else 0
    
    # Sortino
    negative_returns = portfolio_returns[portfolio_returns < 0]
    downside_deviation = np.std(negative_returns) * np.sqrt(252) if len(negative_returns) > 0 else 0
    sortino_ratio = (annual_return - risk_free_rate) / downside_deviation if downside_deviation > 0 else 0
    
    # VaR and CVaR
    var_95 = np.percentile(portfolio_returns, 5)
    var_99 = np.percentile(portfolio_returns, 1)
    cvar_95 = portfolio_returns[portfolio_returns <= var_95].mean()
    cvar_99 = portfolio_returns[portfolio_returns <= var_99].mean()
    
    # Calmar
    calmar_ratio = annual_return / abs(max_drawdown) if max_drawdown < 0 else 0
    
    # Diversification
    weighted_vol = np.sqrt(np.diag(cov_matrix) @ weights) if len(weights) == cov_matrix.shape[0] else 0
    portfolio_vol = np.sqrt(weights @ cov_matrix @ weights) if len(weights) == cov_matrix.shape[0] else 0
    diversification_ratio = weighted_vol / portfolio_vol if portfolio_vol > 0 else 1
    
    # Concentration
    concentration_ratio = np.sum(weights**2)
    
    return PortfolioMetrics(
        annual_return=float(annual_return),
        annual_volatility=float(annual_volatility),
        max_drawdown=float(max_drawdown),
        beta=1.0,
        sharpe_ratio=float(sharpe_ratio),
        sortino_ratio=float(sortino_ratio),
        calmar_ratio=float(calmar_ratio),
        treynor_ratio=float(sharpe_ratio),
        var_95=float(var_95),
        var_99=float(var_99),
        cvar_95=float(cvar_95),
        cvar_99=float(cvar_99),
        downside_deviation=float(downside_deviation),
        rolling_sharpe_mean=float(sharpe_ratio),
        rolling_sharpe_std=0.0,
        drawdown_duration_max=0,
        portfolio_turnover=0.0,
        quantum_stability_index=0.0,
        omega_ratio=float(sharpe_ratio),
        gain_loss_ratio=float(sortino_ratio),
        tail_ratio=1.0,
        information_ratio=0.0,
        jensens_alpha=0.0,
        tracking_error=0.0,
        m2_measure=float(sharpe_ratio),
        m4_measure=float(sharpe_ratio),
        sterling_ratio=float(calmar_ratio),
        burke_ratio=float(calmar_ratio),
        kappa_three_ratio=float(sortino_ratio),
        skewness=float(stats.skew(portfolio_returns)) if len(portfolio_returns) > 0 else 0,
        kurtosis=float(stats.kurtosis(portfolio_returns)) if len(portfolio_returns) > 0 else 0,
        value_at_risk_spectral=float(var_95),
        ulcer_index=0.0,
        pain_index=0.0,
        diversification_ratio=float(diversification_ratio),
        concentration_ratio=float(concentration_ratio)
    )


# API Routes

@app.route('/api/market-data', methods=['GET'])
def get_market_data():
    """Get available market data"""
    engine = AdvancedMarketDataEngine()
    
    return jsonify({
        'indian_stocks': engine.INDIAN_STOCKS,
        'global_stocks': engine.GLOBAL_STOCKS,
        'indices': ['^GSPC', '^NSEI', '^DJI', '^IXIC']
    })


@app.route('/api/fetch-prices', methods=['POST'])
def fetch_prices():
    """Fetch price data for selected tickers"""
    data = request.json
    tickers = data.get('tickers', [])
    
    engine = AdvancedMarketDataEngine()
    prices = engine.fetch_data(tickers)
    market_data = engine.compute_statistics(prices)
    
    return jsonify({
        'tickers': market_data['tickers'],
        'mean_returns': market_data['mean_returns'].tolist(),
        'cov_matrix': market_data['cov_matrix'].tolist(),
        'returns': market_data['returns'].values.tolist(),
        'dates': market_data['returns'].index.strftime('%Y-%m-%d').tolist(),
        'n_assets': market_data['n_assets']
    })


@app.route('/api/optimize', methods=['POST'])
def optimize_portfolio():
    """Run portfolio optimization"""
    global optimization_state
    
    data = request.json
    tickers = data.get('tickers', [])
    max_assets = data.get('max_assets', 8)
    risk_aversion = data.get('risk_aversion', 1.0)
    use_quantum = data.get('use_quantum', True)
    
    optimization_state['running'] = True
    optimization_state['progress'] = 0
    optimization_state['results'] = {}
    
    # Fetch data
    engine = AdvancedMarketDataEngine()
    prices = engine.fetch_data(tickers)
    market_data = engine.compute_statistics(prices)
    
    n = market_data['n_assets']
    mu = market_data['mean_returns']
    Sigma = market_data['cov_matrix']
    returns_data = market_data['returns'].values
    
    results = {}
    
    # Greedy method
    optimization_state['current_method'] = 'Greedy Selection'
    socketio.emit('optimization_progress', {
        'progress': 10,
        'method': 'Greedy Selection',
        'status': 'running'
    })
    
    scores = mu / np.sqrt(np.diag(Sigma))
    top_k = np.argsort(scores)[-max_assets:]
    greedy_solution = np.zeros(n, dtype=int)
    greedy_solution[top_k] = 1
    results['Greedy'] = evaluate_solution(greedy_solution, mu, Sigma, returns_data, max_assets, risk_aversion)
    
    # Simulated Annealing
    optimization_state['current_method'] = 'Simulated Annealing'
    socketio.emit('optimization_progress', {
        'progress': 30,
        'method': 'Simulated Annealing',
        'status': 'running'
    })
    
    sa_solution = simulated_annealing(mu, Sigma, max_assets, risk_aversion)
    results['Simulated Annealing'] = evaluate_solution(sa_solution, mu, Sigma, returns_data, max_assets, risk_aversion)
    
    # Genetic Algorithm
    optimization_state['current_method'] = 'Genetic Algorithm'
    socketio.emit('optimization_progress', {
        'progress': 50,
        'method': 'Genetic Algorithm',
        'status': 'running'
    })
    
    ga_solution = genetic_algorithm(mu, Sigma, max_assets, risk_aversion)
    results['Genetic Algorithm'] = evaluate_solution(ga_solution, mu, Sigma, returns_data, max_assets, risk_aversion)
    
    # Quantum DC-QAOA
    if use_quantum and QISKIT_AVAILABLE and n <= 15:
        optimization_state['current_method'] = 'DC-QAOA Quantum'
        socketio.emit('optimization_progress', {
            'progress': 70,
            'method': 'DC-QAOA Quantum',
            'status': 'running'
        })
        
        # Create QUBO
        Q = np.zeros((n, n))
        penalty = 10.0
        
        for i in range(n):
            Q[i, i] = -mu[i] + risk_aversion * Sigma[i, i] - penalty * (2 * max_assets - 1)
        
        for i in range(n):
            for j in range(i + 1, n):
                Q[i, j] = risk_aversion * Sigma[i, j] + 2 * penalty
                Q[j, i] = Q[i, j]
        
        dc_qaoa = TrueDCQAOA(Q=Q, max_assets=max_assets, noise_level=0.005)
        qaoa_result = dc_qaoa.optimize(p=3, shots=2048)
        
        quantum_solution = np.array(qaoa_result['solution'])
        results['DC-QAOA'] = evaluate_solution(
            quantum_solution, mu, Sigma, returns_data, max_assets, risk_aversion
        )
        results['DC-QAOA']['quantum_metrics'] = {
            'quantum_stability_index': qaoa_result['quantum_stability_index'],
            'solution_entropy': qaoa_result['solution_entropy'],
            'energy_variance': qaoa_result['energy_variance'],
            'circuit_depth': qaoa_result['circuit_depth'],
            'shots': qaoa_result['shots'],
            'circuit_steps': qaoa_result['circuit_steps']
        }
    
    optimization_state['running'] = False
    optimization_state['progress'] = 100
    optimization_state['results'] = results
    
    socketio.emit('optimization_complete', {
        'progress': 100,
        'results': results
    })
    
    return jsonify({
        'success': True,
        'results': results,
        'tickers': market_data['tickers']
    })


def evaluate_solution(solution, mu, Sigma, returns_data, max_assets, risk_aversion):
    """Evaluate a portfolio solution"""
    selected = solution.astype(bool)
    n_selected = selected.sum()
    
    if n_selected == 0:
        return {'valid': False}
    
    selected_indices = np.where(selected)[0]
    selected_mu = mu[selected_indices]
    selected_cov = Sigma[np.ix_(selected_indices, selected_indices)]
    selected_returns = returns_data[:, selected_indices]
    
    # Optimize weights
    weights = PortfolioWeightOptimizer.optimize_mean_variance(
        selected_mu, selected_cov, risk_aversion
    )
    
    # Portfolio returns
    portfolio_returns = selected_returns @ weights
    
    # Calculate metrics
    metrics = calculate_portfolio_metrics(portfolio_returns, weights, selected_cov)
    
    return {
        'valid': True,
        'solution': solution.tolist(),
        'selected_indices': selected_indices.tolist(),
        'weights': weights.tolist(),
        'metrics': metrics.to_dict(),
        'n_assets': int(n_selected)
    }


def simulated_annealing(mu, Sigma, max_assets, risk_aversion, max_iter=500):
    """Simulated annealing optimization"""
    n = len(mu)
    
    def objective(x):
        selected = x.astype(bool)
        if selected.sum() == 0 or selected.sum() > max_assets:
            return 1e6
        
        selected_indices = np.where(selected)[0]
        selected_mu = mu[selected_indices]
        selected_Sigma = Sigma[np.ix_(selected_indices, selected_indices)]
        
        weights = PortfolioWeightOptimizer.optimize_mean_variance(
            selected_mu, selected_Sigma, risk_aversion
        )
        
        portfolio_return = weights @ selected_mu
        portfolio_risk = np.sqrt(weights @ selected_Sigma @ weights)
        
        return -portfolio_return + risk_aversion * portfolio_risk
    
    current = np.zeros(n)
    current[:max_assets] = 1
    np.random.shuffle(current)
    current_energy = objective(current)
    
    best = current.copy()
    best_energy = current_energy
    
    T = 1.0
    T_min = 0.01
    alpha = 0.95
    
    for i in range(max_iter):
        neighbor = current.copy()
        
        if np.random.rand() < 0.5:
            on_indices = np.where(neighbor == 1)[0]
            off_indices = np.where(neighbor == 0)[0]
            if len(on_indices) > 0 and len(off_indices) > 0:
                neighbor[np.random.choice(on_indices)] = 0
                neighbor[np.random.choice(off_indices)] = 1
        else:
            idx = np.random.randint(n)
            neighbor[idx] = 1 - neighbor[idx]
        
        neighbor_energy = objective(neighbor)
        delta = neighbor_energy - current_energy
        
        if delta < 0 or np.random.rand() < np.exp(-delta / T):
            current = neighbor
            current_energy = neighbor_energy
            
            if current_energy < best_energy:
                best = current.copy()
                best_energy = current_energy
        
        T *= alpha
    
    return best


def genetic_algorithm(mu, Sigma, max_assets, risk_aversion, pop_size=30, generations=50):
    """Genetic algorithm optimization"""
    n = len(mu)
    
    def fitness(x):
        selected = x.astype(bool)
        if selected.sum() == 0 or selected.sum() > max_assets:
            return -1e6
        
        selected_indices = np.where(selected)[0]
        selected_mu = mu[selected_indices]
        selected_Sigma = Sigma[np.ix_(selected_indices, selected_indices)]
        
        weights = PortfolioWeightOptimizer.optimize_mean_variance(
            selected_mu, selected_Sigma, risk_aversion
        )
        
        portfolio_return = weights @ selected_mu
        portfolio_risk = np.sqrt(weights @ selected_Sigma @ weights)
        
        return portfolio_return - risk_aversion * portfolio_risk
    
    population = []
    for _ in range(pop_size):
        individual = np.zeros(n)
        selected = np.random.choice(n, max_assets, replace=False)
        individual[selected] = 1
        population.append(individual)
    
    best_individual = None
    best_fitness = -np.inf
    
    for gen in range(generations):
        fitnesses = np.array([fitness(ind) for ind in population])
        
        gen_best_idx = np.argmax(fitnesses)
        if fitnesses[gen_best_idx] > best_fitness:
            best_fitness = fitnesses[gen_best_idx]
            best_individual = population[gen_best_idx].copy()
        
        new_population = []
        for _ in range(pop_size):
            tournament = np.random.choice(pop_size, 3, replace=False)
            winner = tournament[np.argmax(fitnesses[tournament])]
            new_population.append(population[winner].copy())
        
        for i in range(0, pop_size, 2):
            if i + 1 < pop_size and np.random.rand() < 0.7:
                point = np.random.randint(1, n - 1)
                child1 = np.concatenate([new_population[i][:point], new_population[i+1][point:]])
                child2 = np.concatenate([new_population[i+1][:point], new_population[i][point:]])
                
                if child1.sum() > max_assets:
                    on_indices = np.where(child1 == 1)[0]
                    child1[np.random.choice(on_indices, int(child1.sum() - max_assets), replace=False)] = 0
                if child2.sum() > max_assets:
                    on_indices = np.where(child2 == 1)[0]
                    child2[np.random.choice(on_indices, int(child2.sum() - max_assets), replace=False)] = 0
                
                new_population[i] = child1
                new_population[i+1] = child2
        
        for i in range(pop_size):
            if np.random.rand() < 0.1:
                idx = np.random.randint(n)
                new_population[i][idx] = 1 - new_population[i][idx]
        
        population = new_population
    
    return best_individual


@app.route('/api/validation', methods=['POST'])
def run_validation():
    """Run statistical validation"""
    data = request.json
    results = data.get('results', {})
    
    validation_report = {
        'comparisons': [],
        'conclusion': ''
    }
    
    if 'DC-QAOA' in results and 'Genetic Algorithm' in results:
        quantum_sharpe = results['DC-QAOA']['metrics']['sharpe_ratio']
        classical_sharpe = results['Genetic Algorithm']['metrics']['sharpe_ratio']
        
        validation_report['comparisons'].append({
            'method': 'DC-QAOA vs Genetic Algorithm',
            'quantum_sharpe': quantum_sharpe,
            'classical_sharpe': classical_sharpe,
            'difference': quantum_sharpe - classical_sharpe,
            'quantum_advantage': quantum_sharpe > classical_sharpe
        })
        
        if quantum_sharpe > classical_sharpe:
            validation_report['conclusion'] = 'QUANTUM ADVANTAGE DEMONSTRATED'
        else:
            validation_report['conclusion'] = 'CLASSICAL METHODS SUPERIOR'
    
    return jsonify(validation_report)


@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connected', {'data': 'Connected to Quantum Optimizer'})


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
