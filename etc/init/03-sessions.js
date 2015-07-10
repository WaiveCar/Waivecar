//var _ = require('lodash');
//var async = require('async');
var cookieParser = require('cookie-parser');
//var passport = require('passport');
// var randomstring = require('randomstring-extended');
//var connectLiveReload = require('connect-livereload');
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// var GoogleTokenStrategy = require('passport-google-token').Strategy;
// var FacebookStrategy = require('passport-facebook').Strategy;
// var FacebookTokenStrategy = require('passport-facebook-token').Strategy;
//var validator = require('validator');

exports = module.exports = function(IoC, config) { //, sessions, User, AuthService, JobService) {

  var app = this;

  // support live reload
  // if (config.server.env === 'development' && config.liveReload) {
  //   app.all('*', connectLiveReload(config.liveReload));
  // }

  app.all('*', cookieParser(config.cookieParser));

  // // add support for authentication
  // app.use(passport.initialize());

  // // add passport strategies
  // passport.use(new LocalStrategy({
  //   usernameField: 'username',
  //   passwordField: 'password'
  // }, function(username, password, next) {
  //   AuthService.isValidCredentials(username, password, next);
  // }));

  // passport.serializeUser(UserService.serializeUser());
  // passport.deserializeUser(UserService.deserializeUser());

  // // ## Google Authentication
  // if (config.google.enabled) {

  //   // web-based
  //   passport.use(new GoogleStrategy({
  //     callbackURL: config.url + '/auth/google/callback',
  //     clientID: config.google.clientID,
  //     clientSecret: config.google.clientSecret
  //   }, providerAuthCallback));

  //   // token-based
  //   passport.use(new GoogleTokenStrategy({
  //     clientID: config.google.clientID,
  //     clientSecret: config.google.clientSecret
  //   }, providerAuthCallback));
  // }

  // // ## Facebook Authentication
  // if (config.facebook.enabled) {

  //   // web-based
  //   passport.use(new FacebookStrategy({
  //     callbackURL: config.url + '/auth/facebook/callback',
  //     clientID: config.facebook.appID,
  //     clientSecret: config.facebook.appSecret
  //   }, providerAuthCallback));

  //   // token-based
  //   passport.use(new FacebookTokenStrategy({
  //     clientID: config.facebook.appID,
  //     clientSecret: config.facebook.appSecret
  //   }, providerAuthCallback));
  // }


  // function providerAuthCallback(accessToken, refreshToken, profile, done) {

  //   if (profile.emails.length === 0 || !_.isObject(profile.emails[0]) || !validator.isEmail(profile.emails[0].value)) {
  //     return done(new Error('Your account did not have an email address associated with it'));
  //   }

  //   var $or = [
  //     {
  //       email: profile.emails[0].value
  //     }
  //   ];

  //   // normalize the auth callbacks by simply pushing to the
  //   // $or query that will be executed with User.findOne below
  //   // this allows us to simply have one auth callback for
  //   // different providers like Facebook, Google, etc.
  //   var provider = {};
  //   provider[profile.provider + 'Id'] = profile.id;

  //   // note that we unshift instead of push, since we want findOne
  //   // to return the user based off `profile.id` which takes
  //   // precedence over the user's email address in `profile.emails`
  //   $or.unshift(provider);

  //   User.findOne({
  //     $or: $or
  //   }, function(err, user) {

  //     if (err) return done(err);

  //     if (user) {
  //       if (!user[profile.provider + 'Id']) user[profile.provider + 'Id'] = profile.id;
  //       if (accessToken) user[profile.provider + 'AccessToken'] = accessToken;
  //       if (refreshToken) user[profile.provider + 'RefreshToken'] = refreshToken;

  //       return user.save(done);
  //     }

  //     user = {
  //       email: profile.emails[0].value,
  //       name: profile.name.givenName + ' ' + profile.name.familyName
  //     };

  //     user[profile.provider + 'Id'] = profile.id;
  //     if (accessToken) user[profile.provider + 'AccessToken'] = accessToken;
  //     if (refreshToken) user[profile.provider + 'RefreshToken'] = refreshToken;

  //     // if the user signed in with another service then create a random password for them
  //     User.register(user, randomstring.token(), function(err, user) {
  //       if (err) return done(err);
  //       if (!user) return done(new Error('An error has occured while registering, please try later'));

  //       JobService.enqueue('email', {
  //         to: user.email,
  //         name: user.name,
  //         from: config.email.headers.from,
  //         subject: 'Welcome to ' + config.app.name,
  //         templateName: 'welcome',
  //         context: {
  //           username: user.name
  //         }
  //       }, function(err) {
  //         done(err, user);
  //       });
  //     });
  //   });
  // }
};

exports['@require'] = [ '$container', 'igloo/settings' ]; //, 'igloo/sessions', 'models/user', 'services/auth-service', 'services/job-service' ];
