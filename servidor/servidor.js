//paquetes necesarios para el proyecto
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const controller = require('./controladores/controller');

var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

//definimos los endpoint de nuestra app
app.get('/peliculas', controller.obtenerPeliculas);
app.get('/generos', controller.obtenerGeneros);
app.get('/peliculas/recomendacion', controller.recomendarPelicula);
app.get('/peliculas/:id', controller.obtenerDetalleDePelicula);


//seteamos el puerto en el cual va a escuchar los pedidos la aplicación
var puerto = '3000';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});


