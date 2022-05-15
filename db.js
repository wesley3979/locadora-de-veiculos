const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'teste';

var user_collection;
var product_collection;
async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);

  user_collection = db.collection('user');
  product_collection = db.collection('product');

  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error);
//   .finally(() => client.close());

async function getUsers(username, password) {
  const findResult = await user_collection.find({ username: username, password: password }).toArray();
  return findResult;
}

async function getUser(email) {
  const findResult = await user_collection.findOne({ email: email })
  return findResult;
}

async function getAllProducts() {
  const findResult = await product_collection.find({}).toArray();
  return findResult;
}

async function getProductsByUser(username) {
  const findResult = await product_collection.find({ author: username }).toArray();
  return findResult;
}

async function insertUser(user) {
  console.log(user)
  const findResult = await user_collection.insertOne({
    "name": user.name,
    "email": user.email,
    "gener": user.gener,
    "phone": user.phone,
    "birthDate": user.birthDate,
    "salt": user.salt,
    "hash": user.hash,
  });
  return findResult;
}

exports.getUsers = getUsers;
exports.getUser = getUser;
exports.getAllProducts = getAllProducts;
exports.insertUser = insertUser;
exports.getProductsByUser = getProductsByUser;

