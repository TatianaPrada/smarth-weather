const { Schema, model } = require("mongoose");

const citySchema = new Schema(
  {
    city: { type: String, required: true },
    country: {type: String},
  },
  { timestamps: true }
);

const City = model("City", citySchema);

module.exports = City;
