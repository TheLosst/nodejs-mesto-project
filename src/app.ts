import express, { Request, Response, NextFunction } from 'express';
import type { Server } from 'http';
import mongoose from 'mongoose';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';
import { errors, celebrate, Joi, Segments } from 'celebrate';
import errorHandler from './middlewares/errorHandler';

// Порт можно переопределить через переменную окружения PORT, по умолчанию 3000
const PORT = Number(process.env.PORT) || 3000;

const app = express();

// Mongo connection URI (можно вынести в .env позднее)
const MONGO_URI = 'mongodb://localhost:27017/mestodb';

async function connectDB() {
	try {
		await mongoose.connect(MONGO_URI, {
			// Параметры можно добавить при необходимости
		});
		// eslint-disable-next-line no-console
		console.log('Connected to MongoDB');
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('MongoDB connection error:', err);
		process.exit(1);
	}
}

// Базовые middleware
app.use(express.json());

// Простой маршрут для проверки работоспособности
app.get('/', (req: Request, res: Response) => {
	res.status(200).json({ message: 'Mesto API server is running (hot reload test)' });
});

// Валидация signup/signin
app.post('/signup',
	celebrate({
		[Segments.BODY]: Joi.object().keys({
			email: Joi.string().email().required(),
			password: Joi.string().required(),
			name: Joi.string().min(2).max(30),
			about: Joi.string().min(2).max(200),
			avatar: Joi.string().pattern(/^(https?:\/\/)(www\.)?([\w-]+\.)+[a-zA-Z]{2,}(\/[-\w._~:/?#[\]@!$&'()*+,;=]*)?#?$/),
		}),
	}),
	require('./controllers/users').createUser
);
app.post('/signin',
	celebrate({
		[Segments.BODY]: Joi.object().keys({
			email: Joi.string().email().required(),
			password: Joi.string().required(),
		}),
	}),
	require('./controllers/users').login
);

// Роуты пользователей
app.use('/users', usersRouter);
// Роуты карточек
app.use('/cards', cardsRouter);

// Обработчик 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

// Celebrate error handler
app.use(errors());

// Централизованный error handler
app.use(errorHandler);

let server: Server | null = null;

async function start() {
	if (server) return server;
	await connectDB();
	server = app.listen(PORT, () => {
		// eslint-disable-next-line no-console
		console.log(`Server listening on port ${PORT}`);
	});

	// Graceful shutdown
	const shutdown = async (signal: string) => {
		// eslint-disable-next-line no-console
		console.log(`\nReceived ${signal}. Closing server...`);
		if (server) {
			await new Promise((resolve) => server?.close(() => resolve(null)));
		}
		await mongoose.connection.close();
		// eslint-disable-next-line no-console
		console.log('MongoDB connection closed. Bye!');
		process.exit(0);
	};
	['SIGINT', 'SIGTERM'].forEach((sig) => {
		process.on(sig, () => shutdown(sig));
	});

	return server;
}

// Запускаем только если файл запускается напрямую (а не импортируется в тестах)
if (require.main === module) {
	start();
}

export { app, start };
export default app;
