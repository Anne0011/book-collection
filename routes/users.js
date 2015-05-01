var express = require('express');
var app = express.Router();
var Q = require("q");
var UserController = require("../userController");
var UserModel = require("../models/user");
var Book = require("../models/book");

// Send the error message back to the client
var sendError = function (req, res, err, message) {
  console.log('Render the error template back to the client.');
  res.render("error", {
    error: {
      status: 500,
      stack: JSON.stringify(err.errors)
    },
    message: message
  });
};

// Retrieve all books for the current user
var getUserBooks = function (userId) {
  var deferred = Q.defer();

  console.log('Another promise to let the calling function know when the database lookup is complete');
  console.log(Book)
  Book.find({user: userId}, function (err, books) {
    console.log(err,books);
    if (!err) {
      console.log('Books found = ' + books.length);
      console.log('No errors when looking up books. Resolve the promise (even if none were found).');
      deferred.resolve(books);
    } else {
      console.log('There was an error looking up books. Reject the promise.');
      deferred.reject(err);
    }
  });

  return deferred.promise;
};


// Handle the request for the registration form
app.get("/register", function (req, res) {
  console.log("inside /user/register");
  res.render("register");
});

app.get("/book", function (req, res) {
  console.log("inside /user/register");
  res.render("index",{
    title: "Add a Book to your collection",
    username: UserController.getCurrentUser().username,
    item_props:{}
  });
});


// Handle the registration form post
app.post("/register", function (req, res) {
  var newUser = new UserModel(req.body);

  newUser.save(function (err, user) {
    if (err) {
      sendError(req, res, err, "Failed to register user");
    } else {
      // res.redirect("/book");
      res.redirect("/login");
    }
  });
});


// Handle the login action
app.post("/login", function (req, res) {

  console.log('Hi, this is Node handling the /user/login route');

  // Attempt to log the user is with provided credentials
  UserController.login(req.body.username, req.body.password)

    // After the database call is complete and successful,
    // the promise returns the user object
    .then(function (validUser) {

      console.log('Ok, now we are back in the route handling code and have found a user');
      console.log('validUser',validUser);
      console.log('Find any books that are assigned to the user');

      // Now find the books that belong to the user

      getUserBooks(validUser._id)
        .then(function (books) {
          // Render the book list
          // res.redirect("/todo/list");
          res.redirect("book");
        })
        .fail(function (err) {
          sendError(req, res, {errors: err.message}, "Failed")
        });
    })

    // After the database call is complete but failed
    .fail(function (err) {
      console.log('Failed looking up the user');
      sendError(req, res, {errors: err.message}, "Failed")
    })
});

app.get("/profile", function (req, res) {
  var user = UserController.getCurrentUser();

  if (user !== null) {
    getUserTasks(user._id).then(function (books) {
      res.render("userProfile", {
        username: user.username,
        books: books
      });
    });
  } else {
    res.redirect("/");
  }

});

app.get('/logout', function (req, res) {
  UserController.logout();
  res.redirect("/");
});


module.exports = app;
