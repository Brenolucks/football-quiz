import express, { Application } from 'express';
import cors from 'cors';
//import morgan from 'morgan';
import userRoutes from './routes/appRoutes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  private config(): void {
    // Middlewares
    this.app.use(cors());
    //this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {
    // Base route
    this.app.get('/', (req, res) => {
      res.json({ message: 'Welcome to my API!' });
    });

    // API routes
    this.app.use('/api', userRoutes);

    // 404 handler (should be last)
    this.app.use((req, res) => {
      res.status(404).json({ message: 'Not Found' });
    });
  }
}

export default new App().app;