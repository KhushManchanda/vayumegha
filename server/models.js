const { Sequelize, DataTypes } = require('sequelize');

// Setup SQLite DB
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

// Models
const Order = sequelize.define('Order', {
    customer: DataTypes.STRING,
    delivery_date: DataTypes.DATEONLY,
    status: { type: DataTypes.STRING, defaultValue: 'new' } // new, production, ready
});

const WorkOrder = sequelize.define('WorkOrder', {
    product: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    station: DataTypes.STRING, // cutting, coating, assembly
    status: { type: DataTypes.STRING, defaultValue: 'pending' }, // pending, in_progress, completed
    operator_id: DataTypes.INTEGER,
    progress: { type: DataTypes.INTEGER, defaultValue: 0 } // Percentage
});

const DowntimeLog = sequelize.define('DowntimeLog', {
    machine: DataTypes.STRING,
    reason: DataTypes.STRING,
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    start_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    end_time: DataTypes.DATE
});

// Relationships
Order.hasMany(WorkOrder);
WorkOrder.belongsTo(Order);

// Seed Function
async function seedHelper() {
    await sequelize.sync({ force: true });

    const o1 = await Order.create({ customer: 'ABC Construction', delivery_date: '2023-08-15', status: 'production' });
    const o2 = await Order.create({ customer: 'Skyline Towers', delivery_date: '2023-08-20', status: 'new' });

    await WorkOrder.create({ OrderId: o1.id, product: 'Linear Grill 200x50', quantity: 50, station: 'cutting', status: 'completed', progress: 100 });
    await WorkOrder.create({ OrderId: o1.id, product: 'Linear Grill 200x50', quantity: 50, station: 'coating', status: 'in_progress', progress: 45 });
    await WorkOrder.create({ OrderId: o2.id, product: 'Diffuser Type B', quantity: 100, station: 'cutting', status: 'pending', progress: 0 });

    console.log('Database seeded!');
}

module.exports = { sequelize, Order, WorkOrder, DowntimeLog, seedHelper };
