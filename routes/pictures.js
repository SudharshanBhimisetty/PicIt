
var express= require("express");
var router = express.Router();
var Picture = require("../models/picture");
var Comment = require("../models/comment");
var mongoose = require("mongoose");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
const request = require('request'); 



var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})
console.log(upload);
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'yelpcamp24', 
  api_key:process.env.CLOUDINARY_API_KEY,
	api_secret:process.env.CLOUDINARY_API_SECRET
   
 
});







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
	if(req.query.search){
	 const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Picture.find({name: regex}, function(err, allPictures){
       if(err){
           console.log(err);
       } else {
		   	if(allPictures.length < 1){
				 req.flash("error", "Sorry,No picture match your query. Here are some other pictures");
                return res.redirect("/pictures");
			}
          res.render("pictures/index",{pictures: allPictures, page: 'pictures'});
       }
    });
		
	}else{
		
	
    Picture.find({}, function(err, allPictures){
       if(err){
           console.log(err);
       } else {
          res.render("pictures/index",{pictures: allPictures, page: 'pictures'});
       }
    });
	}
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
   // get data from form and add to campgrounds array

	var location = req.body.picture.location;	
	addresschecking(location);
	function addresschecking(address) { 
		// console.log(GEOCODER_API_KEY);
		 // console.log(process.env.GEOCODER_API_KEY);
	var ACCESS_TOKEN = process.env.GEOCODER_API_KEY; 
		// console.log(ACCESS_TOKEN);
	var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
			+ encodeURIComponent(address) + '.json?access_token='
			+ ACCESS_TOKEN + '&limit=1'; 
		// console.log(url);
		request({ url: url, json: true }, function (error, response) { 
			// console.log(response.body.features.length);
			if (error) { 
				console.log('Unable to connect to Geocode API', undefined); 
			} else if (response.body.features.length == 0) { 
				 req.flash("error", "Invalid Address");
            	return res.redirect("back");
			} else { 		
				 req.body.picture.author = {
      				id: req.user._id,
      				username: req.user.username
 			 	};
				
					cloudinary.v2.uploader.upload(req.file.path, function(err,result) {
						console.log("error:" + err);
						console.log("result: " + result);
						if(err){
							 req.flash('error', err.message);
      						  return res.redirect('back');
						}
  // add cloudinary url for the image to the campground object under image property
  					req.body.picture.image = result.secure_url;
						req.body.picture.imageId = result.public_id;
  // add author to campground
  					req.body.picture.author = {
    				id: req.user._id,
    				username: req.user.username
  					}
					  Picture.create(req.body.picture, function(err, picture) {
					    if (err) {
					      req.flash('error', err.message);
					      return res.redirect('back');
					    }
					    res.redirect('/pictures');
					  });
					});
			}
						
		})
	}

})



//NEW - show form to create new campground
router.get("/new",middleware.isLoggedIn, function(req, res){
   res.render("pictures/new"); 
		

});

router.get("/:id/map",function(req,res){
	Picture.findById(req.params.id,function(error,foundPicture){	

			res.render("pictures/map", {picture :foundPicture,geocoderKey : process.env.GEOCODER_API_KEY});
	})

})

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Picture.findById(req.params.id).populate("comments").exec(function(err, foundPicture){
        if(err){
            console.log(err);
        } else {
            console.log(foundPicture)
            //render show template with that campground
            res.render("pictures/show", {picture: foundPicture});
        }
    });
});


// edit

router.get("/:id/edit",middleware.checkPictureOwnership,function(req,res){
	
	     Picture.findById(req.params.id,function(error,foundPicture){	
			 res.render("pictures/edit",{picture:foundPicture});
			
		 })
	
});


router.put("/:id", middleware.checkPictureOwnership, upload.single('image'),function(req, res){
	// console.log(req.body.campground);
	
	
	
	var location = req.body.picture.location;	
	addresschecking(location);
	function addresschecking(address) { 
		// console.log(GEOCODER_API_KEY);
		 // console.log(process.env.GEOCODER_API_KEY);
	var ACCESS_TOKEN = process.env.GEOCODER_API_KEY; 
		// console.log(ACCESS_TOKEN);
	var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
			+ encodeURIComponent(address) + '.json?access_token='
			+ ACCESS_TOKEN + '&limit=1'; 
		// console.log(url);
		request({ url: url, json: true }, function (error, response) { 
			// console.log(response.body.features.length);
			if (error) { 
				console.log('Unable to connect to Geocode API', undefined); 
			} else if (response.body.features.length == 0) { 
				 req.flash("error", "Invalid Address");
            	return res.redirect("back");
			} else {

	
    Picture.findById(req.params.id, async function(err, picture){
		
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
			if(req.file){
				try{
					await cloudinary.v2.uploader.destroy(picture.imageId);
					var result = await cloudinary.v2.uploader.upload(req.file.path);
					picture.imageId = result.public_id;
					picture.image = result.secure_url;
				}catch(err){
					req.flash("error",err.message);
					return res.redirect("back");
				}
			}
			
			picture.name = req.body.picture.name;
			picture.location = req.body.picture.location;
			picture.description = req.body.picture.description;
			picture.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/pictures/" + picture._id);
        }
    });
				}})} 		
  });

router.delete("/:id",middleware.checkPictureOwnership,function(req,res){
	Picture.findById(req.params.id,async function(error,deletedPicture){
		if(error){
			// req.flash("error",error.message);
			return res.redirect("/pictures");
		}
		try{
			await cloudinary.v2.uploader.destroy(deletedPicture.imageId);
			deletedPicture.remove();
			req.flash("success","Picture Successfully Deleted");
			res.redirect("/pictures");
		}catch(err){
			// req.flash("error",err.message);
			return res.redirect("back");
		}
		
	})
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;
