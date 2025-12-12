const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { sequelize, Order, WorkOrder, DowntimeLog, seedHelper } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for MVP/Cloud deployment
    methods: ['GET', 'POST', 'PUT']
}));
app.use(express.json());

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join specific rooms if needed (e.g., 'maintenance', 'production')
    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined ${room}`);
    });
});

// --- API ROUTES ---

// Dashboard Stats
app.get('/api/dashboard', async (req, res) => {
    const activeJobs = await WorkOrder.count({ where: { status: 'in_progress' } });
    const activeDowntime = await DowntimeLog.count({ where: { is_active: true } });
    const completedToday = await WorkOrder.count({ where: { status: 'completed' } }); // Simplified

    res.json({ activeJobs, activeDowntime, completedToday });
});

// Get Work Orders (for Planner/Operator)
app.get('/api/work-orders', async (req, res) => {
    const wos = await WorkOrder.findAll({ include: Order, order: [['updatedAt', 'DESC']] });
    res.json(wos);
});

// Get Orders (for Planner Dropdown)
app.get('/api/orders', async (req, res) => {
    const orders = await Order.findAll();
    res.json(orders);
});

// Create Work Order
app.post('/api/work-orders', async (req, res) => {
    try {
        const wo = await WorkOrder.create(req.body);
        io.emit('wo_updated', wo); // Real-time update
        res.json(wo);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update Work Order Status (Operator Action)
app.put('/api/work-orders/:id/status', async (req, res) => {
    const { status, progress } = req.body;
    const wo = await WorkOrder.findByPk(req.params.id);
    if (!wo) return res.status(404).json({ error: "Not found" });

    wo.status = status;
    if (progress !== undefined) wo.progress = progress;
    await wo.save();

    const updatedWo = await WorkOrder.findByPk(wo.id, { include: Order });

    // EMIT EVENT to everyone
    io.emit('wo_updated', updatedWo);

    res.json(updatedWo);
});

// Report Downtime
app.post('/api/downtime', async (req, res) => {
    const log = await DowntimeLog.create(req.body);
    io.emit('downtime_alert', log); // ALERT!
    res.json(log);
});

// Resolve Downtime
app.put('/api/downtime/:id/resolve', async (req, res) => {
    const log = await DowntimeLog.findByPk(req.params.id);
    log.is_active = false;
    log.end_time = new Date();
    await log.save();
    io.emit('downtime_resolved', log);
    res.json(log);
});


// Start Server

// Sync DB and Seed if needed (simple check)
sequelize.sync().then(async () => {
    // Uncomment next line to reset data on restart
    await seedHelper();
    console.log('Database connected.');
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
