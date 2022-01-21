# Policy Bank App

This app takes the policy related data and showcases different types of analytics. Like aggregated policies by each user etc. I have built this app using Node.js, Express, Mongoose. I have used MongoDB as database.



## Install Dependencies

Once clone this app, install required dependencies using command `npm install`.


## Connect to MongoDB database

I have used MongoDB as database to store all policy related data. Create a mongoDB database named `policy` in your local environment. You can also use Robo 3T, which is a GUI tool to easily create the database.


## Run the app

Run this app using `node server.js`. Open `localhost:4800` in browser. You will see a simple button to upload the CSV file.


## Using the app

On browser, upload your CSV file. Once the file is completely uploaded, you will see a "Success" message.


## API Docs

1. POST `/csv`

Description - Uploads the CSV file data into database.

Response - JSON data of the file


2. GET `/user/policies/:userName`

Description - Get policy details for all policies of a username.

Params - `userName: String`

Response - 

```js
[
    {
        "_id": "61e8002bf612621219863b2f",
        "pNumber": "YEEX9MOIBU7X",
        "startDate": "2018-11-02T00:00:00.000Z",
        "endDate": "2019-11-02T00:00:00.000Z",
        "pCategory": {
            "_id": "61e8002bf612621219863ae8",
            "categoryName": "Commercial Auto",
            "__v": 0
        },
        "company": {
            "_id": "61e8002bf612621219863afc",
            "companyName": "Integon Gen Ins Corp",
            "__v": 0
        },
        "__v": 0
    },
    {
        "_id": "61e8002bf612621219863b93",
        "pNumber": "KNC1WACEDTS2",
        "startDate": "2018-08-24T00:00:00.000Z",
        "endDate": "2019-08-24T00:00:00.000Z",
        "pCategory": {
            "_id": "61e8002bf612621219863aec",
            "categoryName": "General Liability",
            "__v": 0
        },
        "company": {
            "_id": "61e8002bf612621219863aff",
            "companyName": "Nationwide Mut Fire Ins Co",
            "__v": 0
        },
        "__v": 0
    }
]
```


3. GET `/aggregate/users/policy`

Description - Aggregated policies for each user.

Response - 

```js
[
    {
        "_id": "61e800f3f612621219863fde",
        "policies": [
            {
                "_id": "61e8002bf612621219863b2f",
                "pNumber": "YEEX9MOIBU7X"
            },
            {
                "_id": "61e8002bf612621219863b93",
                "pNumber": "KNC1WACEDTS2"
            }
        ]
    },
    {
        "_id": "61e800f3f612621219863fdf",
        "policies": [
            {
                "_id": "61e8002bf612621219863b30",
                "pNumber": "7CZ3CLKWMSKH"
            },
            {
                "_id": "61e8002bf612621219863b94",
                "pNumber": "OJY9XNJCPDNI"
            }
        ]
    },
    ...so on
```


4. POST `/schedule/message`

Description - Schedule a message to send it on particular day and time.

Body - 

```js
{
    "message": "Hello world!",
    "date": "2022-19-01T23:00:27.423Z"
}
```

Response - 

```js
{ 
    message: "Scheduled" 
}
```


## Tracking Memory Usage

This app also tracks the memory usage and restarts once the usage is over 70%. I am using npm module `forever` in order to restart the app.