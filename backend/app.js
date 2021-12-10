const express = require('express');
require('dotenv').config();

const routes = require('./routes/routes');

var cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use((req, res, next) => {
	const error = new HttpError('Could not find this route.', 404);
	throw error;
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || 'An unknown error occurred!' });
});

app.listen(process.env.PORT || 3000);
