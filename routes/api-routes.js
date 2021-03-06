// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");

module.exports = function (app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function (req, res) {
    db.User.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password,
    })
      .then(function () {
        res.redirect(307, "/api/login");
      })
      .catch(function (err) {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", function (req, res) {
    //req for logout
    req.logout();

    // after logout redirect user to signup page
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id,
        progress: req.user.progress,
        totalCalories: req.user.totalCalories,
      });
    }
  });

  app.put("/api/user_data", function (req, res) {
    db.User.update(req.body, {
      where: {
        id: req.user.id,
      },
    }).then(function (dbUser) {
      res.json(dbUser);
    });
  });

  app.post("/api/contact", function (req, res) {
    var contactObj = {
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
    };

    if (req.body.phonenumber.length > 0) {
      contactObj.phonenumber = req.body.phonenumber;
    }

    db.Contacts.create(contactObj)
      .then(function () {
        res.json(contactObj);
      })
      .catch(function (err) {
        res.status(401).json(err);
      });
  });

  app.put("/api/progress", function (req, res) {
    console.log(req.body);
    db.User.update(req.body, {
      where: {
        id: req.user.id,
      },
    }).then(function (dbUser) {
      console.log(dbUser);
      res.json(dbUser);
    });
  });
    app.get("/api/progress", function(req, res) {
      console.log(req.body);
      db.User.findOne(
          {
              where: {
                id: req.user.id
              }
          }).then(function(dbUser) {
            console.log(dbUser);
              res.json({progress:dbUser.progress, totalCalories:dbUser.totalCalories});
          });
      });
};
