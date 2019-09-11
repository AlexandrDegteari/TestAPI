import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import chalk from 'chalk';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import favicon from 'serve-favicon';

import config from './config';
import err404 from './middleware/404';

const app = express();

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true });

app.use(morgan('dev'));

app.use(favicon(path.join('public', 'favicon.ico')));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(bodyParser.json());// For parsing application/json
app.use('/uploads', express.static('uploads'));


app.use(require('./routes/auth'));
app.use(require('./routes/events'));
app.use(require('./routes/users'));
app.use(require('./routes/subscribe'));
app.use(express.static('public')); // Displaying the index.html on the main route
app.use(err404); // 404

app.listen(config.PORT, () => 
	console.log(chalk.black.bgBlue(` :: App listening on port ${config.PORT} :: `))
);
