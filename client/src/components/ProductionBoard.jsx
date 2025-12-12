import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../socket';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductionBoard() {
    const [workOrders, setWorkOrders] = useState([]);
    const [stats, setStats] = useState({ activeJobs: 0, activeDowntime: 0, completedToday: 0 });
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchData();

        // Socket Listeners
        socket.on('wo_updated', (updatedWO) => {
            setWorkOrders(prev => {
                const index = prev.findIndex(wo => wo.id === updatedWO.id);
                if (index > -1) {
                    const newArr = [...prev];
                    newArr[index] = updatedWO;
                    return newArr;
                } else {
                    return [updatedWO, ...prev];
                }
            });
            fetchStats();
        });

        socket.on('downtime_alert', (log) => {
            setAlert(log);
            setTimeout(() => setAlert(null), 15000); // 15s alert
            fetchStats();
        });

        socket.on('downtime_resolved', () => {
            setAlert(null);
            fetchStats();
        });

        return () => {
            socket.off('wo_updated');
            socket.off('downtime_alert');
            socket.off('downtime_resolved');
        };
    }, []);

    const fetchData = async () => {
        const res = await axios.get(`${API_URL}/work-orders`);
        setWorkOrders(res.data);
        fetchStats();
    };

    const fetchStats = async () => {
        const res = await axios.get(`${API_URL}/dashboard`);
        setStats(res.data);
    };

    return (
        <div className="space-y-8">
            {/* Alert Banner */}
            {alert && (
                <div className="bg-red-600 border-l-8 border-red-900 text-white p-6 rounded-lg shadow-2xl animate-pulse flex justify-between items-center transform transition-all duration-500 hover:scale-105 cursor-pointer">
                    <div className="flex items-center space-x-4">
                        <span className="text-4xl">🚨</span>
                        <div>
                            <h3 className="font-extrabold text-2xl tracking-wider">CRITICAL DOWNTIME ALERT</h3>
                            <p className="text-red-100 text-lg">Station: <span className="font-bold bg-red-800 px-2 py-1 rounded">{alert.machine}</span> — Reason: {alert.reason}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-3xl font-mono font-bold">{new Date(alert.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-sm font-semibold uppercase tracking-widest text-red-300">Acknowledge ASAP</span>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Active Jobs"
                    value={stats.activeJobs}
                    icon="⚙️"
                    trend="+2 from yesterday"
                    color="blue"
                />
                <StatsCard
                    title="Line Status"
                    value={stats.activeDowntime > 0 ? "HALTED" : "RUNNING"}
                    icon="🏭"
                    trend={stats.activeDowntime > 0 ? "Action Required" : "Optimal"}
                    color={stats.activeDowntime > 0 ? "red" : "green"}
                />
                <StatsCard
                    title="Units Completed"
                    value={stats.completedToday}
                    icon="✅"
                    trend="Target: 150"
                    color="indigo"
                />
            </div>

            {/* Main Board */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Live Production Status</h2>
                        <p className="text-sm text-gray-500">Real-time updates from shop floor terminals</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Live Connection</span>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {workOrders.map(wo => (
                        <JobCard key={wo.id} wo={wo} />
                    ))}
                    {workOrders.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            No active work orders. Use Planner to assign tasks.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, color, icon, trend }) {
    const themes = {
        blue: 'from-blue-500 to-blue-600',
        red: 'from-red-500 to-red-600',
        green: 'from-emerald-500 to-emerald-600',
        indigo: 'from-indigo-500 to-indigo-600',
    };
    const bg = themes[color] || themes.blue;

    return (
        <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg bg-gradient-to-br ${bg} text-white transform transition hover:-translate-y-1`}>
            <div className="flex justify-between items-start z-10 relative">
                <div>
                    <p className="text-blue-100 font-semibold tracking-wide text-sm uppercase">{title}</p>
                    <h3 className="text-4xl font-extrabold mt-2 tracking-tight">{value}</h3>
                    <p className="mt-4 text-xs font-medium bg-white/20 inline-block px-2 py-0.5 rounded backdrop-blur-sm">{trend}</p>
                </div>
                <div className="text-4xl opacity-50 bg-white/10 p-2 rounded-lg">{icon}</div>
            </div>
        </div>
    );
}

function JobCard({ wo }) {
    const isComplete = wo.status === 'completed';
    const isActive = wo.status === 'in_progress';

    return (
        <div className={`
        relative overflow-hidden rounded-xl border-2 transition-all duration-300
        ${isActive ? 'border-blue-500 shadow-lg ring-4 ring-blue-50' : isComplete ? 'border-green-100 bg-green-50/30 opacity-60 grayscale' : 'border-gray-100 bg-white shadow-sm'}
    `}>
            {isActive && <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">Active</div>}

            <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wide">
                        {wo.station}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">#{wo.OrderId}</span>
                </div>

                <h4 className="font-bold text-lg text-gray-800 leading-tight mb-1">{wo.product}</h4>
                <p className="text-sm text-gray-500 mb-4">Target: <span className="font-semibold text-gray-700">{wo.quantity} units</span></p>

                <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>{wo.progress}% Complete</span>
                        <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>{wo.status.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${isComplete ? 'bg-green-500' : isActive ? 'bg-blue-600 relative overflow-hidden' : 'bg-gray-300'}`}
                            style={{ width: `${wo.progress}%` }}
                        >
                            {isActive && <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
