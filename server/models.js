// Register all models
require("./models/Agent");
require("./models/Carrier");
require("./models/LOB");
require("./models/Policy");
require("./models/User");
require("./models/TempCollection");
require("./models/PermCollection");

const mongoose = require("mongoose");


// DB Connection
mongoose.connect("mongodb://127.0.0.1:27017/policy", (error) => {
    if (!error)
        console.log("DB Connected!");
});