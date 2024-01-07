var express = require('express');
const mongojs = require('mongojs')
const db = mongojs('mongodb://127.0.0.1:29000/test', ['inventory'])
const app = express();
const port = 3000;


var router = express.Router();

app.get('/test', (req, res) => {
  return "El test a salido bien"
})

router.get('/list/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    debugger;
    // Obtener las últimas 5 grabaciones para el usuario
    const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const grabaciones = await db.collection('grabaciones').find({ userId }).sort({ date: -1 }).limit(5).toArray();

    // Crear el objeto JSON solicitado
    const files = grabaciones.map(grabacion => ({
      filename: grabacion.filename,
      date: grabacion.date.getTime()  // Convertir la fecha a milisegundos
    }));

    res.json({ files });
  } catch (error) {
    console.error('Error al manejar la solicitud /list:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    await client.close();
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' });
});




module.exports = router;
