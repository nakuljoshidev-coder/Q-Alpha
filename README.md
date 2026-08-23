# ⚛️ Quantum Portfolio Optimization with DC-QAOA

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9%2B-blue)
![React](https://img.shields.io/badge/react-18.0%2B-cyan)
![Qiskit](https://img.shields.io/badge/qiskit-1.0%2B-purple)

A hackathon-grade quantum-classical hybrid application that leverages **True DC-QAOA (Digitally Annealed Quantum Approximate Optimization Algorithm)** with **Counterdiabatic Driving** to solve the NP-Hard Portfolio Optimization problem.

Comparable to institutional-grade tools, this prototype demonstrates **Quantum Advantage** in the NISQ (Noisy Intermediate-Scale Quantum) era by stabilizing solution entropy and minimizing energy variance.

---

## 🚀 Key Features

### 🧠 Advanced Quantum Engine
- **True DC-QAOA Implementation**: Utilizing parameterized quantum circuits with problem-aware mixers.
- **Counterdiabatic Driving**: Suppresses diabatic transitions to improve convergence on NISQ devices.
- **Quantum Stability Index (QSI)**: A novel metric to evaluate the robustness of quantum solutions against noise.

### 💹 Comprehensive Financial Intelligence
- **Real-time Market Data**: Fetches live data for Indian (NSE) and Global (US) markets via Yahoo Finance.
- **40+ Portfolio Metrics**: Sharpe, Sortino, Calmar, Value at Risk (VaR), CVaR, Omega Ratio, and more.
- **Efficient Frontier Analysis**: Compares Quantum results against Classical Mean-Variance Optimization.

### 🎨 Immersive Experience
- **3D Bloch Sphere Visualization**: Interactive Three.js representation of qubit states.
- **Real-time WebSocket Updates**: Live progress tracking of optimization epochs.
- **Cyberpunk / Sci-Fi UI**: Built with React, Tailwind CSS, and Framer Motion for a futuristic feel.

---

## 🛠️ Technology Stack

### **Frontend**
- **React 18** (Vite)
- **TypeScript**
- **Three.js / React Three Fiber** (3D Visualizations)
- **Framer Motion** (Animations)
- **Tailwind CSS** (Styling)
- **Recharts** (Financial Charting)

### **Backend**
- **Python 3.9+**
- **Flask & Flask-SocketIO** (API & Real-time Comm)
- **Qiskit** (Quantum Circuit Simulation)
- **NumPy / Pandas / SciPy** (Financial Mathematics)
- **CVXPY** (Convex Optimization)

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/sagar25k/Quantum-Portfolio-Optimization-With-DC-QAOA.git
cd Quantum-Portfolio-Optimization-With-DC-QAOA
```

### 2. Backend Setup
Navigate to the backend folder and create a virtual environment:

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
> The backend will start on `http://localhost:5000`

### 3. Frontend Setup
Open a new terminal, navigate to the project root:

```bash
npm install
npm run dev
```
> The frontend will run on `http://localhost:5173`

---

## 🔬 Scientific Context

### The Problem
Portfolio Optimization is traditionally solved using **Mean-Variance Optimization (MVO)**, which struggles with discrete constraints (e.g., cardinality constraints aka "max number of assets"). This turns the convex problem into an **NP-Hard Binary Quadratic Programming (BQP)** problem.

### The Quantum Solution (DC-QAOA)
Standard QAOA suffers from barren plateaus and local minima. Our implementation enhances it with:
1.  **Digitally Channeled (DC) Evolution**: Smooths the optimization landscape.
2.  **Problem-Aware Mixers**: Restricts the search space to the valid subspace (preserving Hamming weight).
3.  **Counterdiabatic Terms**: $\hat{H}_{cd}$ are added to the Hamiltonian to enforce adiabaticity even at finite circuit depths ($p=3$).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
