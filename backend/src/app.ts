import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
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

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'OK' });
});

app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

export default app;
