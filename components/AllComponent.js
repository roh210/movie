"use client";

import ChatUI from "@/components/ChatUI";
import MovieRender from "@/components/MovieRender";
import React, { useEffect, useState } from "react";

export default function AllComponent({ watchedMovie, genreIds }) {
  // Use state to store the movie title and submission flag
  const [movieTitle, setMovieTitle] = useState(null); //used to set a specific movie title
  const [movieData, setMovieData] = useState([]); //declaring an array of object for movie data
  const [messages, setMessages] = useState([]); // Stores all messages
  //let emotion = null;
  const [emotion, setEmotion] = useState(null);

  console.log("from DB", watchedMovie, genreIds);

  const aiMessages = messages
    ?.filter((msg) => msg.role === "assistant")
    .map((m) => m.content);
  console.log(aiMessages);

  const matchEmotion = aiMessages?.[aiMessages.length - 1] //using regex to extract emotion => *emotion*
    ?.toString()
    .match(/\*(\w+)\*/);

  const matchMovieTitle = aiMessages?.[aiMessages.length - 1] //using regex to extract movie title from => &movieTitle&
    ?.toString()
    .match(/&([^&]+)&/);

  useEffect(() => {
    if (matchMovieTitle) {
      setMovieTitle(matchMovieTitle[1]);
    }
    if (matchEmotion) {
      setEmotion(matchEmotion[1]);
    }
  }, [matchMovieTitle, matchEmotion]);

  console.log(movieTitle, emotion);

  const movieUrl = `https://api.themoviedb.org/3/search/movie?query=${movieTitle}&include_adult=false&language=en-US&page=1`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      //api key
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TMD}`,
    },
  };
  useEffect(() => {
    const fetchMovies = async () => {
      const responseMovie = await fetch(movieUrl, options);
      const movieDatas = await responseMovie.json();
      setMovieData(movieDatas.results);
    };

    // Debounce fetchMovies (only call it after 500ms of no changes)
    const timeout = setTimeout(() => {
      if (movieTitle) fetchMovies();
    }, 500);

    return () => clearTimeout(timeout); // Clean up timeout to avoid duplicate calls
  }, [movieTitle]); // Fetch data when movieTitle changes
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold underline">Movie Recommendation</h1>
        <ChatUI messages={messages} setMessages={setMessages} />

        {emotion !== null && movieTitle !== null && (
          <MovieRender
            movieTitle={movieTitle}
            movieData={movieData}
            emotion={emotion.toLowerCase()}
            watchedMovie={watchedMovie}
            genreIds={genreIds}
          />
        )}
      </div>
    </>
  );
}
