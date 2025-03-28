import mongoose, { Schema, models, model, Document } from "mongoose";

const UserSchema = new Schema({
  watchlist: [
    {
      movie: [{ type: Object }], // Array of Object
      genreIds: [{ type: Number }], // Array of Number for genre IDs
    },
  ],
});

const User = models.User || model("User", UserSchema);

export default User;
