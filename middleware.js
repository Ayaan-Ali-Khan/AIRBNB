const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.user);
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        console.log(req.session.redirectUrl);
        req.flash("error", "You must Log In to Create Listing");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    res.locals.redirectUrl = req.session.redirectUrl;
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!res.locals.currUser._id.equals(listing.owner)) {
        req.flash("error", "ACCESS DENIED! You are prohibited to edit the listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    console.log(error);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
};
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    console.log(error);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
};
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    console.log(review);
    if (!res.locals.currUser._id.equals(review.author._id)) {
        req.flash("error", "You are prohibited to edit this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};