const { Schema, model } = require("mongoose");

const LOBSchema = new Schema({
    categoryName: { type: String, unique: true }
});

LOBSchema.statics.createIfNotExist = async function (categoryName) {
    const lobObj = await this.findOne({ categoryName }).exec();
    if (!lobObj)
        return await this.create({ categoryName }).exec();
    return lobObj;
}

module.exports = model("LOB", LOBSchema);