const Listing = require("../models/listing")

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
  }


module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
  }


module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author",},}).populate("owner");
    if(!listing){
        req.flash("error", "The listing you are trying to access does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
  }

module.exports.createListing = async(req,res,next) => {
    let {location} = req.body.listing;

    // Get Coordinates
    const data = await fetch("https://geocode.maps.co/search?q="+location.split(", ").join("+")+"&api_key=68ca9d8e7f31c152996976yucdeca0c");
    const json = await data.json();
    let {lat, lon} = json[0];
    console.log(location);
    console.log(lon, lat);
    //console.log(response.body.features[0].geometry)

    
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = {type: 'Point', coordinates: [lon, lat]};

    let savedListing = await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } 

module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "The listing you are trying to access does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
  }

  module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});  // ... => spread opeator

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  }


module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }


  module.exports.filter = async (req, res, next) => {
    let { id } = req.params;
    let allListings = await Listing.find({ category: { $all: [id] } });
    if (allListings.length != 0) {
      res.locals.success = `Displaying listings based on ${id}!`;
      res.render("listings/index.ejs", { allListings });
    } else {
      req.flash("error", "Listing unavailable!");
      res.redirect("/listings");
    }
  };
  
  module.exports.search = async (req, res) => {
    
    let input = req.query.q.trim().replace(/\s+/g, " "); // remove start and end space and middle space remove and middle add one space------
    
    if (input == "" || input == " ") {
      //search value empty
      req.flash("error", "No input provided for search!");
      res.redirect("/listings");
    }
  
    // convert every word 1st latter capital and other small---------------
    let data = input.split("");
    let element = "";
    let flag = false;
    for (let index = 0; index < data.length; index++) {
      if (index == 0 || flag) {
        element = element + data[index].toUpperCase();
      } else {
        element = element + data[index].toLowerCase();
      }
      flag = data[index] == " ";
    }
    
  
    let allListings = await Listing.find({
      title: { $regex: element, $options: "i" },
    });
    if (allListings.length != 0) {
      res.locals.success = "Title-based listings search";
      res.render("listings/index.ejs", { allListings });
      return;
    }
    if (allListings.length == 0) {
      allListings = await Listing.find({
        category: { $regex: element, $options: "i" },
      }).sort({ _id: -1 });
      if (allListings.length != 0) {
        res.locals.success = "Listings filtered by category";
        res.render("listings/index.ejs", { allListings });
        return;
      }
    }
    if (allListings.length == 0) {
      allListings = await Listing.find({
        country: { $regex: element, $options: "i" },
      }).sort({ _id: -1 });
      if (allListings.length != 0) {
        res.locals.success = "Country-specific listings search";
        res.render("listings/index.ejs", { allListings });
        return;
      }
    }
    if (allListings.length == 0) {
      let allListings = await Listing.find({
        location: { $regex: element, $options: "i" },
      }).sort({ _id: -1 });
      if (allListings.length != 0) {
        res.locals.success = "Listings sorted by location";
        res.render("listings/index.ejs", { allListings });
        return;
      }
    }
    const intValue = parseInt(element, 10); // 10 for decimal return - int ya NaN
    const intDec = Number.isInteger(intValue); // check intValue is Number & Not Number return - true ya false
  
    if (allListings.length == 0 && intDec) {
      allListings = await Listing.find({ price: { $lte: element } }).sort({
        price: 1,
      });
      if (allListings.length != 0) {
        res.locals.success = `Listings priced under Rs ${element}`;
        res.render("listings/index.ejs", { allListings });
        return;
      }
    }
    if (allListings.length == 0) {
      req.flash("error", "Listing unavailable!");
      res.redirect("/listings");
    }
  };