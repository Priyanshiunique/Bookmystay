const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust_Phase1";


main()
    .then(() => {
    console.log("connected to DB");

    })
    .catch(err => {
        console.log(err)
    });


async function main() {
    await mongoose.connect(MONGO_URL);
}



// to clean database and insert new data
const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();