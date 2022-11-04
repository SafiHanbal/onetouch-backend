const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('../../models/user.model');

dotenv.config({ path: 'config.env' });

const DB = process.env.DATABASE_URI.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, { useNewUrlParser: true })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log(err.message));

const usersData = JSON.parse(
  fs.readFileSync(`${__dirname}/data/user-data.json`, {
    encoding: 'utf-8',
  })
);

const deleteDataFromDB = async () => {
  try {
    await User.deleteMany();
    console.log('User data deleted successfully!');
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

const importDataToDB = async () => {
  try {
    await User.create(usersData, { validateBeforeSave: false });
    console.log('User data imported successfully!');
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

if (process.argv[2] === '--delete') deleteDataFromDB();
if (process.argv[2] === '--import') importDataToDB();
