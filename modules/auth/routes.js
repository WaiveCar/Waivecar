'use strict';

var router = Reach.Router;

router.post('/auth/login', {
  uses   : 'AuthController@login',
  params : ['email', 'password']
});

router.post('/auth/facebook', {
  uses   : 'AuthController@facebook',
  params : ['code', 'redirectUri']
});

router.get('/auth/validate', {
  policy : 'authenticate',
  uses   : 'AuthController@validate'
});

router.get('/auth/logout', {
  uses : 'AuthController@logout'
});