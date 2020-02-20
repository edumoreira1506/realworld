require('dotenv').config();
require('./src/config/database');

const app = require('./src/config/server');
const port = process.env.PORT;

app.listen(port, () => {
	console.log(`Online server on port ${port}`);
});
