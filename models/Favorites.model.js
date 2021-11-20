const { Schema, model } = require("mongoose");

const favoritesSchema = new Schema(
  {
    city: { type: String, required: true },
    // description: { type: String },
    // thumbnail: { type: String },
    // comic: [{ resourceURI: { type: String }, name: { type: String } }],
  },
  { timestamps: true }
);

const Favorites = model("Favorites", favoritesSchema);

module.exports = Favorites;
