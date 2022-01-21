const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const PolicySchema = new Schema({
    pNumber: String,
    startDate: Date,
    endDate: Date,
    pCategory: { type: ObjectId, ref: "LOB" },
    company: { type: ObjectId, ref: "Carrier" }
});

module.exports = model("Policy", PolicySchema, "policies");