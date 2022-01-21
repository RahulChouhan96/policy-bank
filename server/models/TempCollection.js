const { Schema, model } = require("mongoose");

const TempCollectionSchema = new Schema({
    message: { type: String, required: true },
    fireTime: { type: Date, required: true }
});

module.exports = model("TempCollection", TempCollectionSchema);