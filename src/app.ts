import express, { Request, Response } from 'express';
import type { Server } from 'http';
import mongoose from 'mongoose';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';

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

// Временный мидлвар для авторизации (user._id захардкожен)
import type { NextFunction } from 'express';
app.use((req: Request, res: Response, next: NextFunction) => {
	req.user = {
		_id: '5d8b8592978f8bd833ca8133', // замените на актуальный _id пользователя из вашей базы
	} as { _id: string };
	next();
});

// Простой маршрут для проверки работоспособности
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Mesto API server is running (hot reload test)' });
});

// Роуты пользователей
app.use('/users', usersRouter);
// Роуты карточек
app.use('/cards', cardsRouter);

// Обработчик 404 (если понадобятся другие роуты позже — оставим задел)
app.use((req: Request, res: Response) => {
	res.status(404).json({ error: 'Not Found' });
});

// Центральный обработчик ошибок (минимальный вариант)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: Function) => {
	// В продакшне можно логировать подробнее
	// eslint-disable-next-line no-console
	console.error('Unexpected error:', err);
	res.status(500).json({ error: 'Internal Server Error' });
});

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
