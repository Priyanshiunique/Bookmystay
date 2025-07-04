const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust_Phase1";
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");


async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
    console.log("connected to DB");

    })
    .catch(err => {
        console.log(err)
    });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method")); // for PUT and DELETE requests
// use ejs-locals for all ejs templates
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));







//basic api
app.get("/",(req, res) => {
    // console.log()
    res.send("Hi, i am root");
});



const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
}







//1 index route
app.get("/listings", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});

}));



//2 new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})


//3 show route
app.get("/listings/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });

}));


//4 create route
app.post(
    "/listings", 
    validateListing,
    wrapAsync(async(req, res) => {
        // if(!req.body.listing) {
        //     throw new  ExpressError(400, "Send valid data for listing");
        // }
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
   })
);


//5 edit route
app.get("/listings/:id/edit", wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
     res.render("listings/edit.ejs", {listing});
}));


//6 update route
app.put(
    "/listings/:id", 
    validateListing,
    wrapAsync(async(req, res) => {
        let {id} = req.params;
        // console.log(id);
        await Listing.findByIdAndUpdate(id, {...req.body.listing});
        res.redirect(`/listings/${id}`);
}));

//7 delete route
app.delete("/listings/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("deleted listing ", deletedListing);
    res.redirect("/listings");

}));


// SAMPLE TESTING API
// app.get("/testListing", async(req, res) => {
//     let sampleListing = new Listing({
//         title: "My new Home",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample listing saved");
//     res.send("successful testing");
// });





app.all("/*anything", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});


app.use((err, req, res, next) => {
    let {statusCode=500, message="something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
})


// app.listen(port no., callback);
app.listen(8080, () => { 
    console.log("Server is listening to the port 8080");
});


