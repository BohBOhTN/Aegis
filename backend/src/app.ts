import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import productRoutes from './routes/products.routes';
import warehouseRoutes from './routes/warehouses.routes';
import posRoutes from './routes/pos.routes';
import categoryRoutes from './routes/categories.routes';
import unitRoutes from './routes/units.routes';
import purchaseRoutes from './routes/purchases.routes';
import suppliersRoutes from './routes/suppliers.routes';
import inventoryRoutes from './routes/inventory.routes';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: '*' }));

const limiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP'
});

app.use('/api', limiter);
app.use(express.json({ limit: '10kb' }));
app.use(hpp());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/units', unitRoutes);
app.use('/api/v1/warehouses', warehouseRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/suppliers', suppliersRoutes);
app.use('/api/v1/inventory', inventoryRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'OK' });
});

app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

export default app;
