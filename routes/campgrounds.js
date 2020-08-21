var express= require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var mongoose = require("mongoose");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
const request = require('request'); 
// var { addresschecking } = require("/map.ejs");

//var options = {
//  provider: 'mapbox',
//  httpAdapter: 'https',
//  apiKey: process.env.GEOCODER_API_KEY,
//  formatter: null
//};
// 
//var geocoder = NodeGeocoder(options); 


mongoose.set('useFindAndModify', false);


// router.get("/", function(req, res){
    // // Get all campgrounds from DB
    // Campground.find({}, function(err, allCampgrounds){
       // if(err){
           // console.log(err);
       // } else {
          // res.render("campgrounds/index",{campgrounds:allCampgrounds,currentUser:req.user});
       // }
    // })})



//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
       }
    });
});
// CREATE - add new campground to DB
//router.post("/",middleware.isLoggedIn, function(req, res){
//    // get data from form and add to campgrounds array
//    var name = req.body.name;
//	var price = req.body.price;
//    var image = req.body.image;
//    var desc = req.body.description;
//	var author = {
//		id : req.user._id,
//		username : req.user.username
//	}
//    var newCampground = {name: name,price : price, image: image, description: desc,author : author}
//    // Create a new campground and save to DB
//    Campground.create(newCampground, function(err, newlyCreated){
//        if(err){
//            console.log(err);
//        } else {
//            //redirect back to campgrounds page
//            res.redirect("/campgrounds");
//        }
//    });
//});

//CREATE - add new campground to DB
//router.post("/", middleware.isLoggedIn, function(req, res){
//  // get data from form and add to campgrounds array
//  var name = req.body.name;
//  var image = req.body.image;
//  var desc = req.body.description;
//  var author = {
//      id: req.user._id,
//      username: req.user.username
//  }
//  geocoder.geocode(req.body.location, function (err, data) {
//    if (err || !data.length) {
//		console.log(err);
//      req.flash('error', 'Invalid address');
//      return res.redirect('back');
//    }
//    var location = data[0].formattedAddress;
//    var newCampground = {name: name, image: image, description: desc, author:author, location: location};
//    // Create a new campground and save to DB
//    Campground.create(newCampground, function(err, newlyCreated){
//        if(err){
//            console.log(err);
//        } else {
//            //redirect back to campgrounds page
//            console.log(newlyCreated);
//            res.redirect("/campgrounds");
//        }
//    });
//  });
//});


//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
	var price = req.body.price;
  var author = {
      id: req.user._id,
      username: req.user.username
  };
	var location = req.body.location;

	
	
	
	addresschecking(location);
	


function addresschecking(address) { 
var ACCESS_TOKEN = 'pk.eyJ1Ijoic3VkaGFyc2hhbjI0IiwiYSI6ImNrZTJnejZmbjA5YTQzN243dHlrNnZiM2wifQ.ogBVUqSnb2E9Mty-95LVXw'; 
	var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
			+ encodeURIComponent(address) + '.json?access_token='
			+ ACCESS_TOKEN + '&limit=1'; 

	request({ url: url, json: true }, function (error, response) { 
		if (error) { 
			console.log('Unable to connect to Geocode API', undefined); 
		} else if (response.body.features.length == 0) { 
			 req.flash("error", "Invalid Address");
            res.redirect("back");
		} else { 		

    var newCampground = {name: name, price: price, image: image, description: desc, author:author, location: location};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
			
			
			
			
			
			
			
		} 
	}) 
} 

	
	
	
	
	
	
	
	
	
	
	

  });




//NEW - show form to create new campground
router.get("/new",middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
		

});

router.get("/:id/map",function(req,res){
	Campground.findById(req.params.id,function(error,foundCampground){	

			res.render("campgrounds/map", {campground :foundCampground});
	})

})

//router.get("/:id/map", function(req, res){
//			Campground.findById(req.params.id,function(error,foundCampground){	
//				
//				if(error){
//				console.log(error);
//				console.log(foundCampground.location);
//				console.log(foundCampground._id);
//				}else{
//
//			 res.render("campgrounds/map",{campground:foundCampground});	     
//				}
//   
//})
//});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});


// edit

router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
	
	     Campground.findById(req.params.id,function(error,foundCampground){	
			 res.render("campgrounds/edit",{campground:foundCampground});
			
		 })
	
});



//router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
//	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(error,updatedversion){
//		if(error){
//			console.log(error);
//			res.redirect("/campgrounds");
//		}else{
//			req.flash("success","Successfully edited campground")
//			res.redirect("/campgrounds/" + req.params.id);
//		}
//	})
//})

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	console.log(req.body.campground);
	
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
		
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });

router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndDelete(req.params.id,function(error,deletedCampground){
		if(error){
			res.redirect("/campgrounds");
		}else{
			  Comment.deleteMany({_id : deletedCampground.comments},function(error1){
				  if(error){
					  console.log(error);
				  }else{
					  req.flash("success","Successfully deleted campground")
					    res.redirect("/campgrounds")
				  }
			  })
			
			
		}
	})
});



module.exports = router;

//function isLoggedIn(req, res, next){
//    if(req.isAuthenticated()){
//        return next();
//    }
//    res.redirect("/login");
//}
//
//function checkCampgroundOwnership(req,res,next){
//		if(req.isAuthenticated()){
//	     Campground.findById(req.params.id,function(error,foundCampground){	
//	      if(error){
//			res.redirect("back");
//		 }else{
//			 if(foundCampground.author.id.equals(req.user._id)){
//				   next();
//			 }else{
//				 res.redirect("back");
//			 }
//		 }
//	})
//	}else{
//		res.redirect("back");
//	}
//}
//
//			var longitude = response.body.features[0].center[0] 
//			
//			var latitude = response.body.features[0].center[1] 
//			var location = response.body.features[0].place_name 
//
//			console.log("Latitude :", latitude); 
//			console.log("Longitude :", longitude); 
//			console.log("Location :", location); 
			
	

