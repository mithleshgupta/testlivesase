import { config } from './config';
import connectDatabase from './config/db';
import { initializeFolder } from './config/init';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import routes from "./routes";

import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './controllers/404';

connectDatabase(config.mongo_uri!);

initializeFolder();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
//app.use(cors());

app.use(routes);
app.use(notFound);
app.use(errorHandler);


app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
});