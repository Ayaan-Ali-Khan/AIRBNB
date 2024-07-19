const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const { validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single("listing[image]"), wrapAsync(listingController.createListing), validateListing);
//Search route
// router.route("/search")
//     .get(wrapAsync(listingController.search));
//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Category Route
router.get("/category/:category", wrapAsync(listingController.showCategory));

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), wrapAsync(listingController.updateListing), validateListing)
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;