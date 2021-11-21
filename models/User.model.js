const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: {type: String},
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "Can't be blank"],
      match: [/\S+@\S+\.\S+/, "Email not valid"]
    },
    password: { type: String, required: true },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Favorites" }],
  },
  { timestamps: true }
);

const User = model("User", userSchema);

module.exports = User;