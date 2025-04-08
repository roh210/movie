"use client";

import ChatUI from "@/components/ChatUI";
import MovieRender from "@/components/MovieRender";
import React, { useEffect, useState } from "react";

export default function AllComponent({ watchedMovie, genreIds }) {
  // Use state to store the movie title and submission flag
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

  useEffect(() => {
    if (matchEmotion) {
      setEmotion(matchEmotion[1]);
    }
  }, [matchEmotion]);

  console.log(emotion);

  return (
    <>
      <div>
        <ChatUI messages={messages} setMessages={setMessages} />

        {emotion !== null && (
          <MovieRender
            emotion={emotion.toLowerCase()}
            watchedMovie={watchedMovie}
            genreIds={genreIds}
          />
        )}
      </div>
    </>
  );
}
