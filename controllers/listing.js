const Listing = require("../models/listing.js");
const maptilerClient = require("@maptiler/client");
const fetch = require("node-fetch");
maptilerClient.config.apiKey = process.env.MAP_TOKEN;
maptilerClient.config.fetch = fetch;

function geometry(address) {
    return maptilerClient.geocoding.forward(address)
        .then(result => result);
}

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// module.exports.search = async (req, res)=>{
//     let {q} = req.query;
//     let allListings = await Listing.find({title: q});
//     res.render("listings/index.ejs", {allListings});
// };

module.exports.showCategory = async(req, res)=>{
    let {category} = req.params;
    let allListings = await Listing.find({category: category});
    if(!allListings){
        req.flash("error", "No Listings in this category");
    }
    res.render("listings/category.ejs", {allListings});
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    let { title, description, category, price, location, country } = req.body.listing;
    let listing1 = new Listing({
        title: title,
        description: description,
        price: price,
        location: location,
        country: country,
        owner: req.user._id,
        category: category,
    });
    if (typeof req.file !== "undefined") {
        let filename = req.file.filename;
        let url = req.file.path;
        listing1.image = { filename, url };
    }
    function giveGeometry(address) {
        return geometry(address)
            .then((data) => {
                listing1.geometry = data.features[0].geometry;
                listing1.save()
                    .then((final) => {
                        console.log(final);
                    })
            });
    }
    giveGeometry(listing1.location + ", " + listing1.country);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findById(id);
    let { title, description, category, price, location, country } = req.body.listing;
    let listing = await Listing.updateOne({ _id: id }, {
        title: title,
        description: description,
        category: category,
        price: price,
        location: location,
        country: country,
    });
    if (typeof req.file !== "undefined") {
        let filename = req.file.filename;
        let url = req.file.path;
        listing.image = { filename, url };
    }
    console.log(listing);
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};