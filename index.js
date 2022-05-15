const express = require('express')
const app = express()
const port = 8081
const database = require('./db')

var cookieSession = require('cookie-session')
var crypto = require('crypto');

app.use(express.static("public"));
app.use(
  express.urlencoded({
    extended: true,
  }),
)

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cookieSession({
  name: 'session',
  // keys: ['c293x8b6234z82n938246bc2938x4zb234'],
  secret: 'c293x8b6234z82n938246bc2938x4zb234',
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.get('/login', async (req, res) => {
  res.render('loginPage');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  const user = await database.getUser(email)
  if (user) {
    if (login(password, user.salt, user.hash)) {
      user.password = null;
      req.session.user = user;
      console.log("login feito")
      res.redirect('/')
    }
  }
  else {
    console.log("error login")
    res.redirect('/login')
  }

});

app.get('/register', async (req, res) => {
  res.render('registerPage');
});

app.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword, birthDate, gener, phone } = req.body

  const existsUser = await database.getUser(email)
  if (existsUser) {
    console.log("este email já foi usado")
    return res.redirect('/register')
  }

  const userCredetials = gerarSenha(password)

  const Createduser = await database.insertUser({ name, email, birthDate, gener, phone, "hash": userCredetials.hash, "salt": userCredetials.salt })
  if (Createduser) {
    req.session.user = { name, email, birthDate, gener, phone, "hash": userCredetials.hash, "salt": userCredetials.salt };
    console.log("login feito")
  }
  return res.redirect('/')
});

app.get('/', async (req, res) => {
  var products = await database.getAllProducts()
  res.render('rentPage', { products });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function myAuthorizerMongo(username, password, cb) {
  console.log(database.getUsers(username, password).then(users => {
    return cb(null, users.length > 0);
  }));
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
};

function sha512(senha, salt) {
  var hash = crypto.createHmac('sha512', salt); // Algoritmo de cripto sha512
  hash.update(senha);
  var hash = hash.digest('hex');
  return {
    salt,
    hash,
  };
};

function gerarSenha(senha) {
  var salt = generateSalt(16); // Vamos gerar o salt
  var senhaESalt = sha512(senha, salt); // Pegamos a senha e o salt
  return senhaESalt // senhaESalt.salt and  senhaESalt.hash
}

function login(senhaDoLogin, saltNoBanco, hashNoBanco) {
  var senhaESalt = sha512(senhaDoLogin, saltNoBanco)
  return hashNoBanco === senhaESalt.hash;
}

