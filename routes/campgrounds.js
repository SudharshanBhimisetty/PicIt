var express= require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var mongoose = require("mongoose");
var middleware = require("../middleware");

mongoose.set('useFindAndModify', false);


router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds,currentUser:req.user});
       }
    });
});

//CREATE - add new campground to DB
router.post("/",middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
	var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
	var author = {
		id : req.user._id,
		username : req.user.username
	}
    var newCampground = {name: name,price : price, image: image, description: desc,author : author}
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new",middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

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
})


router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(error,updatedversion){
		if(error){
			console.log(error);
			res.redirect("/campgrounds");
		}else{
			req.flash("success","Successfully edited campground")
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})



//Delete

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
})



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

module.exports = router;