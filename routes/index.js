var express = require('express');
const mongojs = require('mongojs')
const app = express();
var session = require('express-session');
var router = express.Router();

const dirdb = 'mongodb://127.0.0.1:27017/grabaciones'
var db = mongojs(dirdb, ['users']);
// const MongoStore = require('connect-mongo')(session);


router.use(session({
  secret: 'clave secreta',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000,
  },
  // store: new MongoStore({url: 'mongodb://127.0.0.1:27017/'})
}));

app.get('/test', (req, res) => {
  return "Exito en el test!"
})

// router.get('/list/:userId', async (req, res) => {
//   const userId = req.params.userId;

//   try {
//     debugger;
//     // Obtener las últimas 5 grabaciones para el usuario
//     const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
//     await client.connect();

//     const grabaciones = await db.collection('grabaciones').find({ userId }).sort({ date: -1 }).limit(5).toArray();

//     // Crear el objeto JSON solicitado
//     const files = grabaciones.map(grabacion => ({
//       filename: grabacion.filename,
//       date: grabacion.date.getTime()  // Convertir la fecha a milisegundos
//     }));

//     res.json({ files });
//   } catch (error) {
//     console.error('Error al manejar la solicitud /list:', error);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   } finally {
//     await client.close();
//   }
// });

router.post('/login', (req, res) => {
  const { name, pass } = req.body;
  console.log("Martin name y pass:", name, pass);
  
  db.users.findOne({ username: name, password: pass }, (err, doc) => {
    if (err) {
      console.log(err + ' err');
      res.status(500).send('Internal Server Error');
      return;
    }

    if (doc) {
      console.log(doc.username + ' ' + doc.password);
      req.session.name = doc.username;
      res.send(JSON.stringify({ name: doc.username }));
    } else {
      res.send(JSON.stringify({ name: 'Usuario desconocido' }));
    }
  });
});

router.get('/main', (req, res) => {
  if (req.session.name) {
    return res.render('index');
  }
  res.render('login');
});

router.get('/logout', (req, res) => {
  req.session.destroy((error) => {
    if(error){
      return console.error(error);
    }
    res.redirect("/");
  });
});


router.post('/register', (req, res) => {
  const { name, pass } = req.body;

  db.users.findOne({ username: name }, (err, doc) => {
    if (err) {
      console.log(err + ' err');
      res.status(500).send('Internal Server Error');
      return;
    }

    if (doc) {
      res.send(JSON.stringify({ name: 'Usuario existente' }));
    } else {
      db.users.insert({ username: name, password: pass, rol: 'user' }, (err, newUser) => {
        if (err) {
          console.log(err + ' err');
          res.status(500).send('Internal Server Error');
          return;
        }

        req.session.name = newUser.username;
        res.send(JSON.stringify({ name: newUser.username }));
      });
    }
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.name) {
    return res.redirect('/main');
  }
  res.render('login');
});


module.exports = router;
