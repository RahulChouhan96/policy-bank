const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
    accountName: String,
    firstName: String,
    dob: Date,
    address: String,
    phoneNumber: String,
    state: String,
    zipCode: String,
    email: String,
    gender: String,
    userType: String,
    policies: [{ type: Schema.Types.ObjectId, ref: 'Policy' }]
});

UserSchema.statics.addPolicy = async function (userObj, policyId) {
    const user = await this.findOne({ firstName: userObj.firstName }).exec();
    if (!user)
        return await this.create(userObj);
    return await this.findByIdAndUpdate(user._id, { $addToSet: { policies: policyId } });
}

module.exports = model("User", UserSchema);