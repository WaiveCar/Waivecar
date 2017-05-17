'use strict';
var angular = require('angular');

function QuizController($injector, $stateParams, $scope, $interval, $data){

  var $auth = $injector.get('$auth');
  var $window = $injector.get('$window');
  var $state = $injector.get('$state');

  $scope.init = function(){
    $scope.isWizard = $stateParams.step;
    $scope.user = $auth.me;
    $scope.timer = 180;
    $scope.width = $window.innerWidth;

    $data.resources.users.me().$promise
      .then(function(me) {
        $scope.user = me;
      });


    // as of the writing of this, the margins are 18px on both sides
    $scope.videoWidth = $scope.width - 36;
    $scope.videoHeight = (9 / 16) * $scope.videoWidth;

    var wait = $interval(function(){
      $scope.timer--;
      $scope.timeDisplay = Math.floor($scope.timer / 60) + ':' + (100 + $scope.timer % 60).toString().slice(1);
      if($scope.timer <= 0) {
        $interval.cancel(wait);
      }
    }, 1000);
  };

  $scope.init();

  $scope.questionList = [
    {
      prompt: 'When ending your ride make sure your spot is Legal and Free for at least',
      answerList: [
        [ 0, 'I am not responsible for where I park the car', 'That would be chaos!' ],
        [ 0, '1 hour', 'It\'s a bit longer than 1 hour.'],
        [ 1, '3 hours', 'That\'s right! As long as the car is good for the next 3 hours, you\'re good.'],
        [ 0, '6 hours', 'Nope. Not that long!']
      ]
    },
    {
      prompt: 'WaiveCars are free for the first 2 hours. When may there be charges?',
      answerList: [
        [ 0, 'Never. I can do whatever I please!', 'Unfortunately there\'s a bit of responsibilty.' ],
        [ 0, 'If I get a ticket, am at fault for an accident or otherwise damage the car', 'Yes, there\'s a few more to add to this list. (hint hint).' ],
        [ 0, 'If I abandon the car  at a really low charge or make it really messy', 'Yes, there\'s a few more to add to this list. (hint hint).' ],
        [ 1, 'Both B and C', 'Correct. Unfortunately if you get speeding tickets, that\'s still on you.' ]
      ]
    },
    {
      prompt: 'I can return my low (25% or lower) charge car to',
      answerList: [
        [ 0, 'Whole Foods Charger', 'Woops. Whole Foods doesn\'t really like that.' ],
        [ 0, 'Public Parking Garage Charger', 'Almost! We like to service and clean our low cars.' ],
        [ 0, 'Any 3 Hour Spot', 'The car might not make it back to us if we allowed this.' ],
        [ 1, 'WaiveCar HQ', 'Correct Again! We use the car being low as a good time to make it fresh and clean.' ]
      ]
    }
  ];
  $scope.guessList = [];
  $scope.wrongAppend = ' Please review and try again.';

  $scope.showQuiz = function(){
    return $scope.timer <= 0;
  };

  $scope.finishTest = function(){
    $scope.user.tested = true;

    $scope.user.$save().then(function(){
      $state.go('users-edit');
    });
  };

  // Check to see if the user got all the right answers.
  $scope.canProceed = function(){
    var
      allCorrect = true,
      guess;

    for(var ix = 0; ix < $scope.questionList.length; ix++){

      if (!(ix in $scope.guessList)){
        allCorrect = false;
        break;
      }

      // This is the index of the users current guess.
      guess = $scope.guessList[ix];

      // We use a 'bit' field to flag whether this particular
      // answer is correct.  if it's not than we can toggle
      // our flag off and get out of here.
      if (!$scope.questionList[ix].answerList[guess][0]){
        allCorrect = false;
        break;
      }
    }

    return allCorrect;
  };
}

module.exports = angular.module('app.controllers')
  .controller('QuizController', [
    '$injector',
    '$stateParams',
    '$scope',
    '$interval',
    '$data',
    QuizController
  ]);
