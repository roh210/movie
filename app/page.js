import AllComponent from "@/components/AllComponent";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { retrieveMovie } from "@/lib/actions/movie.action";

export default async function Home() {
  const fetchWatchHistory = await retrieveMovie();
  const genreIds = fetchWatchHistory?.map((item) => item.genreIds).flat();
  const watchedMovie = fetchWatchHistory?.map((item) => item.movie);
  console.log("Movie:", JSON.stringify(watchedMovie));
  console.log("Genre IDs:", genreIds);

  return (
    <>
      <body className="bg-[#121212] text-white font-sans m-0 p-0">
        <NavBar />
        <AllComponent watchedMovie={watchedMovie?.flat()} genreIds={genreIds} />
        <Footer />
      </body>
    </>
  );
}
