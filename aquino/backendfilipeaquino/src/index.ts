import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { servicesRouter } from './routes/services';
import { workshopsRouter } from './routes/workshops';
import { bookingsRouter } from './routes/bookings';
import { paymentsRouter } from './routes/payments';
import { leadsRouter } from './routes/leads';
import { plansRouter } from './routes/plans';
import { availabilitiesRouter } from './routes/availabilities';
import { adminBootstrapRouter } from './routes/adminBootstrap';
import { settingsRouter } from './routes/settings';
import { uploadAvatarRouter } from './routes/uploadAvatar';
import { uploadWorkshopImageRouter } from './routes/uploadWorkshopImage';

dotenv.config();

const app = express();
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
const allowedOrigins = allowedOriginsEnv
  ? allowedOriginsEnv.split(',').map((o) => o.trim()).filter(Boolean)
  : ['https://www.filipeaquino.com.br', 'https://filipeaquino.com.br'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!allowedOrigins || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// arquivos estáticos para uploads (ex: avatars)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Agendamentos backend running' });
});

app.use('/api/services', servicesRouter);
app.use('/api/plans', plansRouter);
app.use('/api/availabilities', availabilitiesRouter);
app.use('/api/workshops', workshopsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/admin/bootstrap-admin', adminBootstrapRouter);
app.use('/api/admin/settings', settingsRouter);
app.use('/api/admin/upload-avatar', uploadAvatarRouter);
app.use('/api/admin/upload-workshop-image', uploadWorkshopImageRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
