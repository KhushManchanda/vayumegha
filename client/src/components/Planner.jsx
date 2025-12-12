
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Planner() {
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({
        product: 'Linear Grill 100x100',
        quantity: 50,
        station: 'cutting',
        OrderId: ''
    });
    const [status, setStatus] = useState({ type: '', msg: '' });

    useEffect(() => {
        // Fetch orders to populate dropdown
        axios.get(`${API_URL}/orders`).then(res => {
            setOrders(res.data || []);
            if (res.data.length > 0) {
                setFormData(prev => ({ ...prev, OrderId: res.data[0].id }));
            }
        }); // Add endpoint for just orders if needed, or use existing generic one
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', msg: 'Creating...' });
        try {
            await axios.post(`${API_URL}/work-orders`, formData);
            setStatus({ type: 'success', msg: '✅ Work Order Created Successfully!' });
            setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', msg: `❌ Error: ${err.response?.data?.error || err.message}` });
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white">Create New Work Order</h2>
                    <p className="text-indigo-100 mt-1">Assign production tasks to the shop floor</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {status.msg && (
                        <div className={`p-4 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {status.msg}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Order</label>
                            <select
                                value={formData.OrderId}
                                onChange={e => setFormData({ ...formData, OrderId: e.target.value })}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                                required
                            >
                                {orders.map(o => (
                                    <option key={o.id} value={o.id}>
                                        Order #{o.id} - {o.customer} (Due: {o.delivery_date})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Type</label>
                            <input
                                type="text"
                                value={formData.product}
                                onChange={e => setFormData({ ...formData, product: e.target.value })}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                                placeholder="e.g. Linear Grill 200x50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Station</label>
                            <select
                                value={formData.station}
                                onChange={e => setFormData({ ...formData, station: e.target.value })}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                            >
                                <option value="cutting">Cutting Station</option>
                                <option value="coating">Powder Coating</option>
                                <option value="assembly">Final Assembly</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end border-t border-gray-100 mt-6">
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition hover:-translate-y-0.5"
                        >
                            🚀 Dispatch to Floor
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

