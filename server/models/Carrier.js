const { Schema, model } = require("mongoose");

const CarrierSchema = new Schema({
    companyName: String
});

CarrierSchema.statics.createIfNotExist = async function (companyName) {
    const lobObj = await this.findOne({ companyName }).exec();
    if (!lobObj)
        return await this.create({ companyName }).exec();
    return lobObj;
}

module.exports = model("Carrier", CarrierSchema);