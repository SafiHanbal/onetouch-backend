const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'config.env' });

const app = require('./app');

const DB = process.env.DATABASE_URI.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, { useNewUrlParser: true })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log(err.message));

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
