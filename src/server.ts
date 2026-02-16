import express from 'express';
import colors from 'colors';
import morgan from 'morgan';
import { db } from './config/db';
import budgetRouter from './routes/BudgetRouter';
import register from './routes/RegisterRouter';

async function connectDB() {
    try {
        await db.authenticate()
        await db.sync()
        console.log(colors.green('Database connected successfully'))
    } catch (error) {
        console.error(colors.red('Unable to connect to the database:'))
    }
}
connectDB();

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use('/api/budgets', budgetRouter);
app.use('/api/auth', register);

export default app;
