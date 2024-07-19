const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let review1 = new Review(req.body.review);
    review1.author = req.user._id;
    listing.reviews.push(review1);
    let newReview = await review1.save();
    await listing.save();
    console.log(newReview);
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${req.params.id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    let review = await Review.findByIdAndDelete(reviewId);
    console.log(listing);
    console.log(review);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};