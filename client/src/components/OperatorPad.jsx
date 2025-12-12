import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../socket';

const API_URL = 'http://localhost:3001/api';

export default function OperatorPad() {
    const [workOrders, setWorkOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
        socket.on('wo_updated', fetchOrders);
        return () => socket.off('wo_updated');
    }, []);

    const fetchOrders = async () => {
        const res = await axios.get(`${API_URL}/work-orders`);
        // Filter for active jobs only (hide completed ones to keep list clean)
        setWorkOrders(res.data.filter(w => w.status !== 'completed'));
    };

    const updateStatus = async (id, status, progress = 0) => {
        if (progress > 100) progress = 100;
        await axios.put(`${API_URL}/work-orders/${id}/status`, { status, progress });
    };

    const reportDowntime = async () => {
        const reason = prompt("⚠️ REPORT DOWNTIME\n\nPlease describe the issue:", "Machine Jammed / Power Failure");
        if (reason) {
            await axios.post(`${API_URL}/downtime`, {
                machine: "Station-1",
                reason: reason,
                reported_by: 101 // Hardcoded operator ID
            });
            alert("🚨 ALERT SENT: Maintenance has been notified.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="bg-slate-800 text-white p-6 rounded-t-2xl flex justify-between items-center shadow-lg">
                <div>
                    <h2 className="text-3xl font-bold">Operator Terminal 01</h2>
                    <p className="text-slate-400">Station: Cut-Line A • User: Operator</p>
                </div>
                <button
                    onClick={reportDowntime}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold p-4 lg:px-8 rounded-xl shadow-lg border-2 border-red-500 animate-pulse active:scale-95 transition-transform"
                >
                    <span className="block text-2xl">🚨</span>
                    <span className="text-xs uppercase tracking-wider font-bold">STOP & REPORT</span>
                </button>
            </div>

            {/* Main Content Info */}
            <div className="bg-white p-6 border-x border-b border-gray-200 shadow-sm mb-6">
                <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-widest border-b pb-2 mb-4">Assigned Tasks Queue</h3>

                <div className="space-y-4">
                    {workOrders.map(wo => (
                        <TaskCard key={wo.id} wo={wo} updateStatus={updateStatus} />
                    ))}
                    {workOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <span className="text-4xl mb-4">💤</span>
                            <p className="text-lg font-medium">No active jobs. Waiting for assignments.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TaskCard({ wo, updateStatus }) {
    const isActive = wo.status === 'in_progress';
    const isPending = wo.status === 'pending';

    return (
        <div className={`p-6 rounded-xl border-l-8 shadow-sm transition-all ${isActive ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-100' : 'bg-white border-gray-300'}`}>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">

                {/* Job Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold uppercase">{wo.station}</span>
                        <span className="text-slate-400 font-mono text-sm">Target: {wo.quantity} units</span>
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800">{wo.product}</h4>
                    <p className="text-slate-500 text-sm mt-1">Order #{wo.OrderId} • Priority: Normal</p>

                    {/* Progress Bar Display */}
                    {isActive && (
                        <div className="mt-4 max-w-md">
                            <div className="flex justify-between text-xs font-bold text-blue-800 mb-1">
                                <span>Progress</span>
                                <span>{wo.progress}%</span>
                            </div>
                            <div className="h-4 bg-blue-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${wo.progress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls - Mobile Friendly Touch Targets */}
                <div className="flex items-center gap-3">
                    {isPending && (
                        <button
                            onClick={() => updateStatus(wo.id, 'in_progress', 0)}
                            className="bg-green-600 active:bg-green-800 text-white font-bold h-16 px-8 rounded-xl shadow-md border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2"
                        >
                            <span>▶ STAR T</span>
                        </button>
                    )}

                    {isActive && (
                        <>
                            <button
                                onClick={() => updateStatus(wo.id, 'in_progress', wo.progress + 10)}
                                className="bg-white hover:bg-gray-50 text-blue-700 font-bold h-16 w-24 rounded-xl border-2 border-blue-200 shadow-sm active:bg-blue-50 text-xl"
                            >
                                +10%
                            </button>
                            <button
                                onClick={() => updateStatus(wo.id, 'completed', 100)}
                                className="bg-slate-700 active:bg-slate-900 text-white font-bold h-16 px-6 rounded-xl shadow-md border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all"
                            >
                                ✓ DONE
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
