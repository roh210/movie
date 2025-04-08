import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { addMovieToDb, removeMovie } from "@/lib/actions/movie.action";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function MovieRender({ emotion, watchedMovie, genreIds }) {
  const genreIdset = new Set();
  const movieIdset = new Set();
  const [recommendUrl, setRecommendUrl] = useState();
  const [recomendations, setRecomendations] = useState([]);
  let watched = false;
  console.log(genreIds, watchedMovie);

  console.log("THIS IS IN THE MOVIE RENDEDER YOU ARE " + emotion);

  // when a user clicks on a tag, retrieve movie details , create a document in mongodb => these are watched movies,
  // from these movies extract genre and recommend movies from the same genre
  //exclude the ones watched

  //create a hash map with emotion relating to the genre ids
  //randomise page between 1-15
  // neutral: [27, 878, 10752, 99, 80]

  //small UI fix => if no watchlist then don't show the UI
  //if recommended movie is watched remove it from the screen

  //randomise page number to show random movies each time between pages 1-20
  function randomisePageNumber() {
    return Math.random() * (20 - 1) + 1;
  }

  // NLP TECHNIQUE FILTERING
  const genreMap = {
    happy: [35, 12, 28], //comedy, adventure , action
    sad: [16, 14, 10751], // animation, fantasy, family
    scared: [27, 53], // horror, thriller
    neutral: genreIds?.length > 0 ? genreIds : [10751], //check if genre id length is greater than zero otherwise assign default id
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

    //HANDLE WATCH IS JUST GOING TO ADDITNG NEUTRAL EMOTIONS AND ADD TO WATCH LIST DB

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

  const watchedMovieIds = new Set(watchedMovie?.map((movie) => movie.id)); //extract the movie ids into a set for watched movies

  const recommendationDetails = recomendations
    .filter((movie) => movie.poster_path !== null)
    .filter((movie) => !movie.adult)
    .filter((movie) => !watchedMovieIds?.has(movie.id)) //don't recommend already 'watched movies' from db
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
    <section
      id="movies"
      className="bg-[#121212] text-white font-sans m-0 p-0 scroll-smooth "
    >
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center p-[15px]">
        🔥Suggested For You ...
      </h2>

      {recommendationDetails.length > 0 && (
        <div className="flex items-center justify-center m-auto max-w-6xl ">
          <Card className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-md w-full">
            <CardContent className="flex flex-col items-center p-4 space-y-2">
              <span className="font-semibold text-center h-12 overflow-hidden text-ellipsis whitespace-nowrap">
                {recommendationDetails[0].title}
              </span>
              <Image
                src={`https://image.tmdb.org/t/p/w500${recommendationDetails[0].poster_path}`}
                width={200}
                height={200}
                alt={recommendationDetails[0].title}
                className="rounded-md object-cover h-auto hover:scale-105 transition-transform"
              />
              <Button
                onClick={() =>
                  handleWatch(
                    recommendationDetails[0].genres,
                    recommendationDetails[0]
                  )
                }
                className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded cursor-pointer"
              >
                WATCH
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center p-[20px]">
        🧠Recommended Based on your Mood: {emotion}
      </h2>
      <div className="w-full flex justify-center px-4 relative">
        <Carousel className="w-full max-w-6xl">
          <CarouselContent className="-ml-1">
            {recommendationDetails?.slice(1).map((movie) => (
              <CarouselItem
                key={movie.id}
                className="pl-2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <div className="p-1">
                  <Card className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-md">
                    <CardContent className="flex flex-col items-center p-4 space-y-2">
                      <span className="font-semibold text-center h-12 overflow-hidden text-ellipsis whitespace-nowrap">
                        {movie.title}
                      </span>
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        width={200}
                        height={200}
                        alt={movie.title}
                        className="rounded-md object-cover w-full h-auto hover:scale-105 transition-transform"
                      />
                      <Button
                        onClick={() => handleWatch(movie.genres, movie)}
                        className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded cursor-pointer"
                      >
                        WATCH
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="text-black absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 p-2 rounded-full shadow-md hover:bg-white transition md:left-4" />
          <CarouselNext className="text-black absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 p-2 rounded-full shadow-md hover:bg-white transition md:right-4" />
        </Carousel>
      </div>
      {watchedMovie?.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center p-[25px]">
            👀Your Watchlist..
          </h2>
          <div className="w-full flex justify-center px-4 relative">
            <Carousel className="w-full max-w-6xl">
              <CarouselContent className="-ml-1">
                {watchedMovie?.map((movie) => (
                  <CarouselItem
                    key={movie.id}
                    className="pl-2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                  >
                    <div className="p-1">
                      <Card className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-md">
                        <CardContent className="flex flex-col items-center p-4 space-y-2">
                          <span className="font-semibold text-center h-12 overflow-hidden text-ellipsis whitespace-nowrap">
                            {movie.title}
                          </span>
                          <Image
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            width={200}
                            height={200}
                            alt={movie.title}
                            className="rounded-md object-cover w-full h-auto hover:scale-105 transition-transform"
                          />
                          <Button
                            onClick={() => handleRemove(movie.id)}
                            className="mt-2 bg-red-500 hover:bg-red-400 text-black font-bold px-4 py-2 rounded cursor-pointer"
                          >
                            REMOVE
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="text-black absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 p-2 rounded-full shadow-md hover:bg-white transition md:left-4" />
              <CarouselNext className="text-black absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 p-2 rounded-full shadow-md hover:bg-white transition md:right-4" />
            </Carousel>
          </div>
        </>
      )}
    </section>
  );
}
