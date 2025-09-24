const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utility/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");


module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You need to be logged in to access this.");
        return res.redirect("/login");
      };
      next();
}

module.exports.saveRedirectUrl = (req,res,next) => {
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner = async (req,res,next) => {
let {id} = req.params;
let listing = await Listing.findById(id);
if(!listing.owner.equals(res.locals.currentUser._id)){
  req.flash("error", "You are not the designated owner of this listing!");
  return res.redirect(`/listings/${id}`);
}
next();
}


module.exports.validateListing = (req,res,next) => {
  let {error} = listingSchema.validate(req.body);  //Joi
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");  //for addtional details
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
}

module.exports.validateReview = (req,res,next) => {
  let {error} = reviewSchema.validate(req.body);  //Joi
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");  //for addtitional details
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
}


module.exports.isReviewAuthor = async (req,res,next) => {
  let {id, reviewId} = req.params;
  let review = await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currentUser._id)){
    req.flash("error", "You were not the one who created this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
  }