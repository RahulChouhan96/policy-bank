const { Schema, model } = require("mongoose");

const AgentSchema = new Schema({
    agentName: String,
    policies: [{ type: Schema.Types.ObjectId, ref: "Policy" }]
});

module.exports = model("Agent", AgentSchema);