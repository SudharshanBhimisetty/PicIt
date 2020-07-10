var express= require("express");
var router = express.Router({mergeParams : true});
var Campground=require("../models/campground");
var Comment=require("../models/comment");
var middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
			   comment.author.id = req.user._id;
			   comment.author.username = req.user.username;
			   
			   comment.save();
               campground.comments.push(comment);
               campground.save();
			   req.flash("success","Successfully added comment")
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
   //create new comment
   //connect new comment to campground
   //redirect campground show page
});

//edit

router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
	Comment.findById(req.params.comment_id,function(error,foundComment){
		if(error){
			req.flash("error","Something went wrong")
			res.redirect("back");
		}else{
			  
			 res.render("comments/edit",{comment : foundComment,campground_id : req.params.id})
		}
	})
	
})

router.put("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	 Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(error,updatedVersion){
		 if(error){
			 res.redirect("back");
		 }else{
			 req.flash("success","Successfully edited comment")
			 res.redirect("/campgrounds/" + req.params.id);
		 }
	 })
})

router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	 Comment.findByIdAndDelete(req.params.comment_id,function(error){
		 if(error){
			 res.redirect("back")
		 }else{
			 req.flash("success","Successfully deleted comment")
			 res.redirect("/campgrounds/" + req.params.id)
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
//function checkCommentOwnership(req,res,next){
//		if(req.isAuthenticated()){
//	     Comment.findById(req.params.comment_id,function(error,foundComment){	
//	      if(error){
//			res.redirect("back");
//		 }else{
//			 if(foundComment.author.id.equals(req.user._id)){
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



module.exports = router;