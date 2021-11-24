const { Schema, model } = require("mongoose");

const citySchema = new Schema(
  {
    name: { type: String, required: true },
    country: {type: String},
    averageTemp: {type: Number},
    status: {type: String},
    icon: {type: String},
    min: {type: Number},
    max: {type: Number}
  },
  { timestamps: true }
);

const City = model("City", citySchema);

module.exports = City;
