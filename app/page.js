import AllComponent from "@/components/AllComponent";
import { retrieveMovie } from "@/lib/actions/movie.action";

export default async function Home() {
  const fetchWatchHistory = await retrieveMovie();
  const genreIds = fetchWatchHistory?.map((item) => item.genreIds).flat();
  const watchedMovie = fetchWatchHistory.map((item) => item.movie);
  console.log("Movie:", JSON.stringify(watchedMovie));
  console.log("Genre IDs:", genreIds);

  return (
    <AllComponent watchedMovie={watchedMovie.flat()} genreIds={genreIds} />
  );
}
