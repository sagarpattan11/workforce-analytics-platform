import express, { Application } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { env } from './config/env';
import { helmetMiddleware, corsMiddleware, rateLimiterMiddleware } from './middleware/security.middleware';
import { notFoundHandler, centralErrorHandler } from './middleware/error.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument, swaggerUiOptions } from './config/swagger';
import apiRouter from './routes';

const app: Application = express();

// Security and utility middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimiterMiddleware);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Express Session with MongoDB store
const sessionStore = env.MONGODB_URI
  ? MongoStore.create({
      mongoUrl: env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 7 * 24 * 60 * 60, // 7 days
    })
  : undefined;

app.use(
  session({
    name: 'wfa_session',
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// API Base Route
app.use('/api/v1', apiRouter);

// 404 & Central Error Handling
app.use(notFoundHandler);
app.use(centralErrorHandler);

export default app;