"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { revalidatePath } from "next/cache";

export async function addMovieToDb(params) {
  try {
    // Connect to the database
    await connectToDatabase();

    const { movie, genreIds } = params; // Extract movieId and genreIds

    const parsedGenreIds = genreIds.map(Number); // Converts "[53, 28]" to [53, 28]
    console.log(movie);
    console.log(parsedGenreIds);
    //Check if the user document exists
    const user = await User.findOne({});

    // If no user document exists, create one
    if (!user) {
      await User.create({
        watchlist: [{ movie: movie, genreIds: parsedGenreIds }],
      });
      return;
    }

    //  Update the existing watchlist
    const watchlistEntry = user.watchlist[0]; // Assuming single watchlist entry
    console.log(watchlistEntry);
    if (!watchlistEntry) {
      user.watchlist.push({
        movie: { movie },
        genreIds: parsedGenreIds,
      });
    } else {
      // Add movieId, ensuring uniqueness
      // Ensure movie uniqueness
      if (!watchlistEntry.movie.some((m) => m.id === movie.id)) {
        watchlistEntry.movie.push(movie);
      }
      // Add genreIds, ensuring uniqueness
      watchlistEntry.genreIds = [
        ...new Set([...watchlistEntry.genreIds, ...parsedGenreIds]),
      ];
    }

    // Save the updated document
    await user.save();
    revalidatePath("/"); //reflect changes to the UI
  } catch (error) {
    console.error("Error adding movie to watchlist:", error.message);
  }
}

export async function retrieveMovie() {
  try {
    await connectToDatabase();

    const movie = await User.findOne({});
    if (!movie) return;
    return movie.watchlist;
  } catch (error) {
    console.error("Error retrieving watchlist:", error);
    return [];
  }
}

export async function removeMovie(movieId) {
  try {
    await connectToDatabase();
    await User.updateOne(
      { "watchlist.movie.id": movieId },
      { $pull: { "watchlist.0.movie": { id: movieId } } }
    );

    revalidatePath("/");
  } catch (error) {
    console.log(error);
  }
}
