import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductionBoard from './components/ProductionBoard';
import OperatorPad from './components/OperatorPad';
import Planner from './components/Planner';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-50 font-sans">
                <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">V</div>
                                    <span className="font-bold text-xl tracking-tight">Vayumegha Systems</span>
                                </div>
                                <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
                                    <NavLink to="/" label="📊 Floor Status" />
                                    <NavLink to="/planner" label="📝 Production Planner" />
                                    <NavLink to="/operator" label="👷 Operator Pad" />
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400 border border-slate-700">v1.0.0 (MVP)</span>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/" element={<ProductionBoard />} />
                        <Route path="/operator" element={<OperatorPad />} />
                        <Route path="/planner" element={<Planner />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

function NavLink({ to, label }) {
    return (
        <Link to={to} className="group relative px-3 py-2 text-sm font-medium hover:text-blue-400 transition-colors">
            {label}
        </Link>
    );
}

export default App;
