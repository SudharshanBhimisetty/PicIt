var Picture = require("../models/picture");
var Comment = require("../models/comment");


var middlewareobj = {};

middlewareobj.checkPictureOwnership = function(req,res,next){
		if(req.isAuthenticated()){
	     Picture.findById(req.params.id,function(error,foundPicture){	
	      if(error){
			  req.flash("error","Picture not found!!!");
			res.redirect("back");
		 }else{
			 if(foundPicture.author.id.equals(req.user._id)){
				   next();
			 }else{
				 req.flash("error","you don't have permission to do that");
				 res.redirect("back");
			 }
		}
	})
	}else{
		req.flash("error","you need to be logged in to do that!!!");
		res.redirect("back");
	}
}


middlewareobj.checkCommentOwnership = function(req,res,next){
		if(req.isAuthenticated()){
	     Comment.findById(req.params.comment_id,function(error,foundComment){	
	      if(error){
			res.redirect("back");
		 }else{
			 if(foundComment.author.id.equals(req.user._id)){
				   next();
			 }else{
				 req.flash("error","you don't have permission to do that!!! ");
				 res.redirect("back");
			 }
		 }
	})
	}else{
		req.flash("error","you need to be logged in to do that");
		res.redirect("back");
	}
}



middlewareobj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
	req.flash("error","you need to be logged in to do that!!!");
    res.redirect("/login");
}


module.exports = middlewareobj;