import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { addMovieToDb, removeMovie } from "@/lib/actions/movie.action";

export default function MovieRender({
  movieTitle,
  movieData,
  emotion,
  watchedMovie,
  genreIds,
}) {
  const genreIdset = new Set();
  const movieIdset = new Set();
  const [recommendUrl, setRecommendUrl] = useState();
  const [recomendations, setRecomendations] = useState([]);
  let watched = false;
  console.log(genreIds, watchedMovie);

  console.log("THIS IS IN THE MOVIE RENDEDER YOU ARE " + emotion);

  const movieDetails = movieData
    .filter((movie) => movie.poster_path !== null)
    .map((movie) => {
      return {
        id: movie.id,
        title: movie.title,
        year: movie.release_date,
        poster_path: movie.poster_path,
        overview: movie.overview || "No overview available.",
        genres: movie.genre_ids,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
      };
    });

  console.log(movieDetails[0]);
  console.log(movieData);

  if (!movieData) {
    return <div>Loading...</div>;
  }
  // when a user clicks on a tag, retrieve movie details , create a document in mongodb => these are watched movies,
  // from these movies extract genre and recommend movies from the same genre
  //exclude the ones watched

  //create a hash map with emotion relating to the genre ids
  //randomise page between 1-15
  // neutral: [27, 878, 10752, 99, 80]

  //randomise page number to show random movies each time
  function randomisePageNumber() {
    return Math.random() * (20 - 1) + 1;
  }

  // NLP TECHNIQUE FILTERING
  const genreMap = {
    happy: [53, 37, 10770, 878, 10749, 9648],
    sad: [35, 10751, 14, 18, 28],
    scared: [10402, 16, 12, 36],
    neutral: genreIds?.length > 0 ? genreIds : [53], //check if genre id length is greater than zero otherwise assign default id
  };

  console.log("THIS IS A AN ARRAY OF EMOTIONS: " + genreMap[emotion]);
  const genreString = Array.from(genreMap[emotion]).join("%0");
  console.log("genre STRING: " + genreString);

  useEffect(() => {
    setRecommendUrl(
      `https://api.themoviedb.org/3/discover/movie?with_genres=${genreString}&language=en-US&page=${randomisePageNumber()}` //CANNOT DIRECTLY SET URL, NEED A USEFFECT
    );
  }, [genreString]);

  async function handleWatch(genreIds, movie) {
    //CONTENT BASED FILTERING
    //create a new set that adds uniqe genre ids
    //DON'T RECOMMEND MOVIES ALREADY WATCHED ===> STORE MOVIE IDS OF WATCHED movie

    //HANDLE WATCH IS JUST GOING TO EDDITNG NEUTRAL EMOTIONS AND ADD TO WATCH LIST DB

    //convert ids to a number
    // const movieNumId = JSON.parse(movieId);
    //  const numGenreIds = JSON.parse(genreIds).map(Number);

    try {
      await addMovieToDb({
        movie,
        genreIds,
      }); // String representation of an array of numbers);
      watched = !watched;
    } catch (error) {
      console.log(error);
    }

    genreIds.forEach((id) => {
      genreIdset.add(id);
    });
    movieIdset.add(movie.id);
    const genreString = Array.from(genreIdset).join("%0");

    setRecommendUrl(
      `https://api.themoviedb.org/3/discover/movie?with_genres=${genreString}&language=en-US&page=${randomisePageNumber()}`
    );
  }

  async function handleRemove(movieId) {
    try {
      await removeMovie(movieId);
    } catch (error) {
      console.log(error);
    }
  }

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TMD}`,
    },
  };

  //call api movieIds.length times and each time add the data to a use state var

  useEffect(() => {
    const fetchRecommendations = async () => {
      console.log(recommendUrl);
      const responseMovie = await fetch(recommendUrl, options);
      const movieDatas = await responseMovie.json();
      setRecomendations(movieDatas.results);
    };

    // Debounce fetchRecommendations (only call it after 500ms of no changes)
    const timeout = setTimeout(() => {
      if (recommendUrl) fetchRecommendations();
    }, 500);

    return () => clearTimeout(timeout); // Clean up timeout to avoid duplicate calls
  }, [recommendUrl]); // Fetch data when recommnedUrl changes

  const watchedMovieIds = new Set(watchedMovie.map((movie) => movie.id)); //extract the movie ids into a set for watched movies

  const recommendationDetails = recomendations
    .filter((movie) => movie.poster_path !== null)
    .filter((movie) => !watchedMovieIds.has(movie.id)) //don't recommend already 'watched movies' from db
    .map((movie) => {
      return {
        id: movie.id,
        title: movie.title,
        year: movie.release_date,
        poster_path: movie.poster_path,
        overview: movie.overview || "No overview available.",
        genres: movie.genre_ids,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
      };
    });

  return (
    <>
      {movieDetails.length > 0 && (
        <>
          <h2>Movie Results for "{movieTitle}"</h2>
          <div style={{ display: "flex" }}>
            <div style={{ border: "3px solid black", width: "100px" }}>
              <p>{movieDetails[0].title}</p>
              <Image
                src={`https://image.tmdb.org/t/p/w500${movieDetails[0].poster_path}`}
                width={100}
                height={100}
                alt={movieDetails[0].title}
              />
              <p>{JSON.stringify(movieDetails[0].genres)}</p>
              <Button
                onClick={() =>
                  handleWatch(movieDetails[0].genres, movieDetails[0])
                }
              >
                WATCH
              </Button>
            </div>
          </div>
          <br></br>
        </>
      )}
      {/**FOR BOTH RECOMMENDATION ADD WATCH HISTORY , SHOULD BE WITHIN A CAROUSEL */}
      <h2>Recommendations based on your mood: {emotion}</h2>
      <div style={{ display: "flex" }}>
        {recommendationDetails?.map((movie) => (
          <div
            key={movie.id}
            style={{ border: "3px solid black", width: "100px" }}
          >
            <p>{movie.title}</p>
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              width={100}
              height={100}
              alt={movie.title}
            />
            <p>{JSON.stringify(movie.genres)}</p>
            <Button onClick={() => handleWatch(movie.genres, movie)}>
              WATCH
            </Button>
          </div>
        ))}
      </div>

      <h2>Your watchlist: </h2>
      <div style={{ display: "flex" }}>
        {watchedMovie?.map((movie) => (
          <div
            key={movie.id}
            style={{ border: "3px solid black", width: "100px" }}
          >
            <p>{movie.title}</p>
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              width={100}
              height={100}
              alt={movie.title}
            />
            <p>{JSON.stringify(movie.genres)}</p>
            <Button onClick={() => handleRemove(movie.id)}>REMOVE</Button>
          </div>
        ))}
      </div>
    </>
  );
}
