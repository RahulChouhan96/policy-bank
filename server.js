require("./server/models");

// Import libraries
const express = require("express");
const multer = require("multer");
const csvToJson = require("csvtojson");
const mongoose = require("mongoose");
const scheduler = require("node-schedule");
const bodyParser = require("body-parser");

const User = mongoose.model("User");
const Policy = mongoose.model("Policy");
const Agent = mongoose.model("Agent");
const Carrier = mongoose.model("Carrier");
const LOB = mongoose.model("LOB");
const TempCollection = mongoose.model("TempCollection");
const PermCollection = mongoose.model("PermCollection");

const app = express();

// Setup multer for CSV file storage
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public"),
    filename: (req, file, cb) => {
        const extension = file.mimetype.split("/")[1];
        const filename = `files/${file.originalname.split(".csv")[0]}.${extension}`;
        cb(null, filename);
    }
});

const uploadFile = multer({ storage: multerStorage });

// Run frontend index.html file statically
app.use(express.static(__dirname));
app.use(bodyParser.json());

// Upload CSV file, parse it to JSON and upload data into DB
app.post("/csv", uploadFile.single("csv-file"), async (req, res) => {
    try {

        // Parse CSV file to the JSON format
        const csvJSON = await csvToJson().fromFile(__dirname + "/public/files/" + req.file.originalname);

        // Get unique LOBs, Carriers and Agents
        let lobs = Array.from(new Set(csvJSON.map(p => p.category_name))), lobObj = {};
        let carriers = Array.from(new Set(csvJSON.map(p => p.company_name))), carrierObj = {};
        let agents = Array.from(new Set(csvJSON.map(p => p.agent))), agentObj = {};

        // Store all unique LOBS
        // Create a key-value pair to map category name with LOB _id
        // This map will be used to later join policy with lob
        lobs = await LOB.insertMany(lobs.map(lob => { return { categoryName: lob } }));
        lobs.forEach(lob => {
            lobObj[lob.categoryName] = lob._id.toString();
        });

        // Store all unique Carriers
        // Create a key-value pair to map company name with Carrier _id
        // This map will be used to later join policy with carrier
        carriers = await Carrier.insertMany(carriers.map(carrier => { return { companyName: carrier } }));
        carriers.forEach(carrier => {
            carrierObj[carrier.companyName] = carrier._id.toString();
        });

        // Store all unique Agents
        // Create a key-value pair to map agent name with Agent _id
        // This map will be used to later join policy with agent
        agents = await Agent.insertMany(agents.map(agent => { return { agent: agent } }));
        agents.forEach(agent => {
            agentObj[agent.agentName] = agent._id.toString();
        });

        // Iterate over all policies
        let policies = [], policyObj = {}, userObj = {};
        for (policy of csvJSON) {

            // Get all policies in a sparate array
            // Storing data as per in policy schema
            policies.push({
                pNumber: policy.policy_number,
                startDate: policy.policy_start_date,
                endDate: policy.policy_end_date,
                pCategory: lobObj[policy.category_name],
                company: carrierObj[policy.company_name]
            });

            // Store unique users into a key-value pair
            // Here, account name being a unique key, is mapped with user details
            // Same user can have multiple policies
            // If same user is found again, simply store the policy number in existing account
            if (userObj[policy.account_name])
                userObj[policy.account_name].policies.push(policy.policy_number);
            else
                userObj[policy.account_name] = {
                    accountName: policy.account_name,
                    firstName: policy.firstname,
                    dob: policy.dob,
                    address: policy.address,
                    phoneNumber: policy.phone,
                    state: policy.state,
                    zipCode: policy.zip,
                    email: policy.email,
                    gender: policy.gender,
                    userType: policy.userType,
                    policies: [policy.policy_number]
                };
        }

        // Create all policies into DB
        policies = await Policy.insertMany(policies);

        // Map all policy numbers with their docs _id
        // Mapping is done to join user with their policies documents
        policies.forEach(p => policyObj[p.pNumber] = p._id);

        // Store all users into an array to store them into the DB
        let users = [];
        for (let account in userObj) {

            // Change policy numbers in each user with their corresponding policy _id
            // This keeps a join
            userObj[account].policies = userObj[account].policies.map(p => policyObj[p]);
            users.push(userObj[account]);
        }

        // Store all user accounts
        await User.insertMany(users);

        res.status(200).json(csvJSON);
    }
    catch (e) {
        res.status(500).json({ message: "Error while uploading CSV data", error: e });
    }
});

// Get policy details with user name
app.get("/user/policies/:userName", (req, res) => {
    User.findOne({ accountName: req.params.userName }, { policies: 1 })
        .populate({
            path: "policies",
            populate: [{ path: "pCategory" }, { path: "company" }]
        })
        .exec((error, userObj) => {

            // On an error or if user policies not found, give error
            if (error || !userObj || !userObj.policies)
                res.status(500).json({ message: "Error while getting user policy details", error });
            else
                res.status(200).json(userObj.policies);
        });
});

// Get aggregated policies for each user
app.get("/aggregate/users/policy", (req, res) => {
    User.find({}, { policies: 1 }).populate({ path: "policies", select: "pNumber" }).exec((error, users) => {
        if (error)
            res.status(500).json({ message: "Error while getting users", error });
        else
            res.status(200).json(users);
    });
});


/*
SAMPLE BODY - 
{
    "message": "Hello world!",
    "date": "2022-19-01T23:00:27.423Z"
}
*/
// Send a message on a scheduled date and time
// Request body format is given above
app.post("/schedule/message", async (req, res) => {
    try {

        // Split date and time
        let date = req.body.date.split("T");
        let time = date[1].split(":");
        date = date[0].split("-");

        date = new Date(date[0], date[2] - 1, date[1], time[0], time[1], time[2].split(".")[0]);

        // Data will be stored in the temporary collection
        // As keeping it into memory is not good for app performance
        // Store message with date-time in temporary collection
        await TempCollection.create({ message: req.body.message, fireTime: date });

        // Schedule job of sending at a given time
        const jobObj = scheduler.scheduleJob(date, async function (date) {

            // Once triggered, fetch the message data again from temporary collection
            let messageDoc = await TempCollection.findOne({ fireTime: date }).exec();

            // Finally store the data into permanent collection
            await PermCollection.create({ message: messageDoc.message });
        });

        res.status(200).json({ message: "Scheduled" });
        // jobObj.on("scheduled", (date) => res.status(200).json({ message: "Scheduled" }));
        // jobObj.on("error", () => res.status(500).json({ message: "Some error occured" }));
    } catch (error) {
        res.status(500).json({ message: "Error occured while storing details in temporary collection", error: e });
    }
});



// Keep a track of memory usage
// Once it is above 70%
// Restart
let usage, used, total;
setInterval(() => {
    usage = process.memoryUsage();
    used = Math.round(usage.heapUsed / 1024 / 1024);
    total = Math.round(usage.rss / 1024 / 1024);
    console.log("\nUSED MEMORY: ", used, " MB\nTOTAL MEMORY: ", total + " MB\n");

    if ((used / total) > 0.7) {
        // process.on("exit", () => {
        //     require("child_process").spawn("server.js", {
        //         cwd: process.cwd(),
        //         detached: true
        //     });
        // });

        // Server is run using `forever` NPM module ---> forever start server.js
        // So as soon as it sees process exit with 1
        // It restarts the server
        process.exit(1);
    }

}, 10 * 1000);


// Start server
app.listen(4800, (error) => {
    if (!error)
        console.log("Server running!");
});