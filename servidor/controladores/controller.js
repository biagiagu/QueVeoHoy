var connectionDB = require('../lib/conexionbd');
const { query } = require('express');

function obtenerPeliculas(request, response) {

	//obtenemos los valores para filtrar desde la URL
	var anio = request.query.anio;
	var titulo = request.query.titulo;
	var genero = request.query.genero;
	var pagina = request.query.pagina;
	var cantidad = request.query.cantidad;
	var orden = request.query.columna_orden;
	var tipo_orden = request.query.tipo_orden;

	var query;
	//estos arrays vamos a usar para filtrar
	var queryFilters =[];
	var queryFiltersDB =[];

	if (titulo){
		queryFilters.push("titulo");
		queryFiltersDB.push(titulo);
	}

	if (genero){
		queryFilters.push("genero_id");
		queryFiltersDB.push(genero);
	}

	if (anio){
		queryFilters.push("anio");
		queryFiltersDB.push(anio);
	}

	//Dada la combinacion de filtros elegida, seleccionamos la condicion de busqueda en la BD correspondiente
	switch (queryFilters.length){
		case 0:
			queryFilters = "";
			break;
		case 1:
			queryFilters= `WHERE ${queryFilters[0]} LIKE '%${queryFiltersDB[0]}%'`;
			break;
		case 2:
			queryFilters = `WHERE ${queryFilters[0]} LIKE '%${queryFiltersDB[0]}%' AND ${queryFilters[1]} LIKE '%${queryFiltersDB[1]}%'`;
			break;
		case 3:
			queryFilters = `WHERE ${queryFilters[0]} LIKE '%${queryFiltersDB[0]}%' AND ${queryFilters[1]} LIKE '%${queryFiltersDB[1]}%'AND ${queryFilters[2]} LIKE '%${queryFiltersDB[2]}%'` 
			break;
	}

	//armamos la query para enviar a la BD
	query = `SELECT * FROM pelicula ${queryFilters} ORDER BY ${orden} ${tipo_orden} LIMIT ${(pagina-1)*cantidad}, ${cantidad}`;

	var queryCantidadResultados = `SELECT COUNT (*) AS cantidad FROM pelicula ${queryFilters}`;

	connectionDB.query(query, function (error, resultado){
		if (error) throw error;
		connectionDB.query(queryCantidadResultados, function(error, resultado2){
			if (error) throw error;
			var respuesta = { 
				peliculas: resultado,
				total: resultado2[0].cantidad
			}
			response.send(JSON.stringify(respuesta));
		})
	})
}

function obtenerGeneros(request, response){
	//hay que devolver un array nombre "generos" con el listado de generos
	let query = `SELECT * FROM genero`;

	connectionDB.query(query, function(error, resultado){
		console.log(resultado);
		if (error) throw error;
		respuesta = {generos: resultado}
		response.send(JSON.stringify(respuesta));
	})

}

function obtenerDetalleDePelicula(request, response){
	
	let id = request.params.id;
	
	queryDetalle = `SELECT * FROM pelicula where id=${id}`;
	
	queryActores = `SELECT a.id, a.nombre 
	FROM pelicula p, actor_pelicula ap, actor a
	WHERE p.id = ap.pelicula_id 
	AND ap.actor_id = a.id
	AND p.id=${id};`;
	
	queryGenero = `SELECT g.id, g.nombre
	FROM genero g, pelicula p
	WHERE g.id = p.genero_id 
	AND p.id =${id}`;

	connectionDB.query(queryDetalle, function(error, detallePelicula){
		if (error) throw error;
		
		if (!detallePelicula[0]){
			response.status(500).send("esto si es un error");
		}else{
			connectionDB.query(queryActores, function(error, actores){
				if (error) throw error;
				connectionDB.query(queryGenero, function(error, genero){
					if (error) throw error;
	
					respuesta = {
						pelicula: detallePelicula[0],
						actores: actores,
						genero: genero[0]
					}
					response.send(JSON.stringify(respuesta));
	
				})
			})
		}
	})
}

function recomendarPelicula(request, response){

	console.log('Estoy llegando al recomendarPelicula');

	let genero = request.query.genero;
	let anioInicio = request.query.anio_inicio;
	let anioFin = request.query.anio_fin;
	let puntuacion = request.query.puntuacion;

	let querySelect = 'SELECT p.*, g.nombre FROM pelicula p LEFT JOIN genero g ON p.genero_id = g.id';
	let filtroGenero =`g.nombre = '${genero}'`;
	let filtroAnio =`(p.anio BETWEEN ${anioInicio} AND ${anioFin})`;
	let filtroPuntuacion=`p.puntuacion >= ${puntuacion}`;
	let queryFiltros = "";
	let queryRecomendacion;
	
	
	if (genero && anioInicio && !puntuacion){
		queryFiltros = `WHERE ${filtroGenero} AND ${filtroAnio}`;
	}else if (!genero && anioInicio && !puntuacion){
		queryFiltros = `WHERE ${filtroAnio}`;
	}else if ((genero && !anioInicio && puntuacion)){
		queryFiltros = `WHERE ${filtroGenero} AND ${filtroPuntuacion}`;
	}else if (!genero && !anioInicio && puntuacion){
		queryFiltros = `WHERE ${filtroPuntuacion}`;
	}else if (genero && !anioInicio && !puntuacion){
		queryFiltros = `WHERE ${filtroGenero}`;
	}

	console.log(`${querySelect} ${queryFiltros}`);
	
	queryRecomendacion = `${querySelect} ${queryFiltros}`;

	connectionDB.query(queryRecomendacion, function(error, result){
		console.log(`este es el puto error ${error}`);
		if (error) throw error;

		respuesta = {
			peliculas: result,		
		};

		response.send(JSON.stringify(respuesta));

	})
}
		

module.exports ={
	obtenerPeliculas: obtenerPeliculas,
	obtenerGeneros: obtenerGeneros,
	obtenerDetalleDePelicula: obtenerDetalleDePelicula,
	recomendarPelicula: recomendarPelicula

}

