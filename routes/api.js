const dirdb = 'mongodb://127.0.0.1:27017/grabaciones';
var express = require('express');
var mongojs = require('mongojs');
var db = mongojs(dirdb, ['recordings']);
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
const path = require('path');

// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;


router.post('/logout', function (req, res, next) {
    res.send('');
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './recordings')
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 2500000 }, 
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'audio/ogg') {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no admitido. Solo se permiten archivos de audio Ogg.'), false);
    }
  }
}).single("recording");



router.get('/list/:name', async function (req, res, next) {
  try {
    const result = await handleList(req.params.name);
    console.log('rapido', result.data);
    res.send(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/', function (req, res, next) {
  const playMode = new URLSearchParams(window.location.search).get("play");
  res.redirect('/api/play/' + IDFichero);
});

router.post("/upload/:name", (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    const name = req.params.name;
    const filename = req.file.filename;
    const date = new Date();
    const accessed = 0;

    try {
      await client.connect();
      const database = client.db('grabaciones'); 
      const collection = database.collection('recordings');

      await collection.insertOne({ userId: name, filename, date, accessed });

      const listResult = await handleList(name);

      res.status(200).json({ message: "Archivo subido exitosamente", listResult });
    } finally {
      await client.close();
    }
  });
});

const handleList = async (id) => {
  try {
    await client.connect();
    const database = client.db('grabaciones'); 
    const collection = database.collection('recordings');

    const recordings = await collection.find({ userId: id })
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    const response = recordings.map(record => ({
      id: record._id.toString(), 
      filename: record.filename,
      date: record.date,
      accessed: record.accessed
    }));

    return response;
  } finally {
    await client.close();
  }
};

router.post("/api/delete/:name/:filename", async (req, res, next) => {
  const userId = req.params.name;
  const filename = req.params.filename;
    debugger
  try {
    await client.connect();
    const database = client.db('grabaciones'); 
    const collection = database.collection('recordings');

    const filePath = path.join(__dirname, 'recordings', filename);
    await fs.unlink(filePath);

    await collection.updateOne(
      { 'users.name': userId },
      { $pull: { users: { filename: filename } } }
    );

    const listResult = await handleList(userId);

    res.status(200).json({ message: "Archivo eliminado exitosamente", listResult });
  } catch (error) {
    console.error("Error al eliminar el archivo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await client.close();
  }
});

router.get("/api/play/:filename", async (req, res, next) => {
  const filename = req.params.filename;

  try {
    const filePath = path.join(__dirname, 'recordings', filename);
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);

    if (!fileExists) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    await client.connect();
    const database = client.db('grabaciones'); 
    const collection = database.collection('recordings');

    // Actualizar la fecha de último acceso en la base de datos
    await collection.updateOne(
      { 'users.filename': filename },
      { $set: { 'users.$.accessed': Date.now() } }
    );

    res.sendFile(filePath);
  } catch (error) {
    console.error("Error al reproducir el archivo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await client.close();
  }
});

router.get("/play/:filename", (req, res, next) =>{
  res.render("audio.ejs");
} )


module.exports.router = router;
module.exports.cleanup = cleanup;


// passport.use(new GoogleStrategy({
//   clientID: 'TU_CLIENT_ID',
//   clientSecret: 'TU_CLIENT_SECRET',
//   callbackURL: 'http://localhost:3000/auth/google/callback',
// },
// (accessToken, refreshToken, profile, done) => {
//   return done(null, profile);
// }
// ));

// passport.serializeUser((user, done) => {
//   debugger;
//   done(null, user);
// });

// passport.deserializeUser((obj, done) => {
//   done(null, obj);
// });

// router.use(require('express-session')({ secret: 'tu_secreto', resave: true, saveUninitialized: true }));
// router.use(passport.initialize());
// router.use(passport.session());

// // Rutas
// router.get('/', (req, res) => {
//   res.send('<h1>Inicio</h1><a href="/auth/google">Iniciar sesión con Google</a>');
// });

// router.get('/auth/google',
//   passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
// );

// router.get('/auth/google/callback',
// passport.authenticate('google', { failureRedirect: '/' }),
// (req, res) => {
//   res.redirect('/profile');
// }
// );

// router.get('/profile',
// require('connect-ensure-login').ensureLoggedIn(),
// (req, res) => {
//   debugger;
//   res.send(`<h1>Perfil</h1><p>Bienvenido, ${req.user.displayName}!</p><a href="/logout">Cerrar sesión</a>`);
// }
// );

// router.get('/logout', (req, res) => {
// req.logout();
// res.redirect('/');
// });

// <!-- <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta http-equiv="X-UA-Compatible" content="IE=edge">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Perfil</title>
// </head>
// <body>
//   <h1>Perfil</h1>
//   <p>Bienvenido, <%= user.displayName %>!</p>
//   <p>Email: <%= user.emails && user.emails[0].value %></p>
//   <img src="<%= user.photos && user.photos[0].value %>" alt="Foto de perfil">
//   <a href="/logout">Cerrar sesión</a>
// </body>
// </html> -->

