const { Schema, model } = require("mongoose");

const UserAccountSchema = new Schema({
    accountName: String
});

UserAccountSchema.statics.createIfNotExist = async function (accountName) {
    const accNameObj = await this.findOne({ accountName }).exec();
    if (!accNameObj)
        return await this.create({ accountName }).exec();
    return accNameObj;
}

module.exports = model("UserAccount", UserAccountSchema);