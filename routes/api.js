const dirdb = 'mongodb://127.0.0.1:27017/grabaciones';
var express = require('express');
var mongojs = require('mongojs');
var db = mongojs(dirdb, ['recordings']);
var multer = require('multer');
var router = express.Router();
const path = require('path');
const fs = require("fs");


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
  limits: {
    fileSize: 2500000,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'audio/ogg') {
      return cb(null, false, new Error('Wrong format.'));
    }
    cb(null, true);
  }
}).single("recordings");



router.get('/list/:name', async function (req, res, next) {
  try {
    const result = await handleList(req.params.name);
    console.log('Lista de api de audios:', result.data);
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

// router.post("/upload/:name", (req, res, next) => {
//     // Asegúrate de que el middleware para cargar archivos esté configurado correctamente
//     if (!req.file) {
//       return res.status(400).send('No file uploaded');
//     }
  
//     // Inserta el nuevo registro en la base de datos
//     db.recordings.insert({
//       name: req.params.name,
//       filename: req.file.filename,
//       date: Date.now(),
//       accessed: Date.now()
//     }, (err, newRecord) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).send('Error inserting record');
//       }
  
//       // Llama a la función handleList y envía la respuesta
//       handleList(req.params.name)
//         .then(result => res.send(result))
//         .catch(handleListError => {
//           console.error(handleListError);
//           res.status(500).send('Error handling list');
//         });
//     });
// });


router.post('/upload/:name', (req, res) => {
  console.log("Fuera Req.parmas.name", req.params.name);
  // console.log("Fuera Req.file", req.file);
  // if (!req.file) {
  //     return res.status(400).send('No file uploaded');
  // }
  upload(req, res, async (err) => {
    // console.log("Req.params.name", req.params.name);
    // console.log("Req.file", req.file);
    if (!err) {
      db.recordings.insert({
        name: req.params.name,
        filename: req.file? req.file.filename : req.params.name,
        date: Date.now(),
        accessed: Date.now()
      });
      handleList(req.params.name)
        .then(r => res.send((r)));
    } else { console.log(err) }
  })
});


const handleList = async (name) => {
  return new Promise((resolve, reject) => {
    db.recordings.find({ name: name }, (err, doc) => {
      if (err) {
        reject(err);
      } else {
        if (doc) {
          var sortedData = doc.sort((r1, r2) => r2.date - r1.date).slice(0, 5);
          var jsonData = { data: sortedData };
          console.log(jsonData);
          resolve(jsonData);
        } else {
          resolve({ data: [] });
        }
      }
    });
  });
};


router.post("/delete/:name/:filename", async (req, res, next) => {
  console.log('name:' + req.params.name);
  console.log('filename:' + req.params.filename);
  db.recordings.remove({ filename: req.params.filename, name: req.params.name });
  var filepath = `./recordings/${req.params.filename}`;
  fs.unlink(filepath, (err => {
    if (err) console.log(err);
    else {
      console.log("borrar de recordings");
    }
  }));
  handleList(req.params.userId)
    .then(r => res.send(JSON.stringify(r)));
});

router.get("/play/audio/:filename", (req, res, next) =>{
  res.render("audio.ejs");
} )

router.get("/play/:filename", (req, res, next) => {
  console.log(req.params.filename);
  var filepath = `./recordings/${req.params.filename}`;
  console.log(filepath);
  fs.exists(filepath, (exists) => {
    if (exists) {
      db.recordings.updateOne(
        { filename: req.params.filename },
        { $set: { accessed: Date.now() } }
      );
      res.sendFile(path.resolve(filepath));
    } else {
      console.log("asd")
      /*res.status(404).render('error');*/
    }
  });
});

router.get("/play/:filename", (req, res, next) =>{
  res.render("audio.ejs");
} )


function cleanup() {
  let tsNow = Date.now();
  db.recordings.find({}, (err, doc) => {
    if (err) {
      res.send(err);
    } else {
      let idCaducados = doc.filter(r => tsNow - r.accessed > 432000000).map(r => r.filename);
      db.recordings.remove({ filename: { $in: idCaducados } });
      idCaducados.forEach(fileaborr => {
        var filepath = `./recordings/${fileaborr}`;
        fs.unlink(filepath, err => {
          if (err) console.log(err);
          else {
            console.log("Deleted file from recordings");
          }
        });
      });
    }
  });
};

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

