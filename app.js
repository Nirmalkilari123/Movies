const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

const snakeToCamel = (eachObject) => {
  return {
    movieName: eachObject.movie_name,
  };
};

const camelToObjectCamelCase = (newMovie) => {
  return {
    movieId: newMovie.movie_id,
    directorId: newMovie.director_id,
    movieName: newMovie.movie_name,
    leadActor: newMovie.lead_actor,
  };
};

const snakeToCamelDirectors = (newDirector) => {
  return {
    directorId: newDirector.director_id,
    directorName: newDirector.director_name,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Is Running");
    });
  } catch (e) {
    console.log(`error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get All Movies
app.get("/movies/", async (request, response) => {
  const getAllMovies = `
    SELECT movie_name
    FROM movie
    ORDER BY movie_id;
    
    `;
  const movieList = await db.all(getAllMovies);
  const result = movieList.map((eachObject) => {
    return snakeToCamel(eachObject);
  });
  response.send(result);
});

// Add a newMovieDetails
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieDetails = `
    INSERT INTO 
    movie (director_id,movie_name,lead_actor)
    VALUES
    (${directorId},
    '${movieName}',
    '${leadActor}');
    `;
  await db.run(addMovieDetails);
  response.send("Movie Successfully Added");
  console.log(typeof directorId);
});

// Get new movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const firstMovie = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;

  const newMovie = await db.get(firstMovie);
  const result = camelToObjectCamelCase(newMovie);
  response.send(result);
});

// Update a movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updateMovieDetails = request.body;

  const { directorId, movieName, leadActor } = updateMovieDetails;
  const changeMovieDetails = `
    UPDATE 
     movie
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};
    `;
  await db.run(changeMovieDetails);
  response.send("Movie Details Updated");
});

// Delete a movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE 
    FROM movie
    WHERE movie_id = ${movieId}`;

  await db.run(deleteMovie);
  response.send("Movie Removed");
});

//Get All Director details
app.get("/directors/", async (request, response) => {
  const getAllDirectors = `
    SELECT *
    FROM director
    ORDER BY director_id;
    
    `;
  const directorList = await db.all(getAllDirectors);
  const result = directorList.map((eachObject) => {
    return snakeToCamelDirectors(eachObject);
  });
  response.send(result);
});

//Get Movies From Based On Director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAllDirectorMovies = `
    SELECT movie_name
    FROM director JOIN movie 
    ON director.director_id = movie.director_id
    WHERE director.director_id = ${directorId};
    
    `;
  const moviesList = await db.all(getAllDirectorMovies);
  const result = moviesList.map((eachObject) => {
    return snakeToCamel(eachObject);
  });
  response.send(result);
});

module.exports = app;
