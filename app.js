var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds"),
    methodOverride=require("method-override"),
    flash =       require("connect-flash")


var campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes = require("./routes/comments"),
    indexRoutes = require("./routes/index")

// export DATABASEURL = "mongodb://localhost/yelp_camp_v10"
// console.log(process.env.DATABASEURL);
var url = process.env.DATABASEURL ||"mongodb://localhost/yelp_camp_v10" ;

mongoose.connect(url,{
useNewUrlParser:true,
useUnifiedTopology:true,
useCreateIndex:true
});


app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
 // seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(methodOverride("_method"));


//req.user it contains the value of the user from login or register page
//this below route pass it to every templete
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
   next();
});



app.use(indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds",campgroundRoutes);
// ====================
// COMMENTS ROUTES
// ====================

//  ===========
// AUTH ROUTES
//  ===========

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

//var PORT = process.env.PORT || 3000;
//
//app.listen(PORT,function(){
//	console.log("server started");
//})
//    

