const { Schema, model } = require("mongoose");

const PermCollectionSchema = new Schema({
    message: { type: String, required: true }
});

module.exports = model("PermCollection", PermCollectionSchema);