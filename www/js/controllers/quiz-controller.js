'use strict';
var angular = require('angular');

module.exports = angular.module('app.controllers').controller('QuizController', [
  '$scope',
  function ($scope) {

    $scope.init = function () {};

    $scope.init();

    $scope.questions = [
      { 
        prompt: 'When ending your ride make sure your spot is Legal and Free for at least',
        answers: [
          [ 0, 'I am not responsible for where I park the car', 'That would be chaos!' ],
          [ 0, '1 hour', 'It\'s a bit longer than 1 hour.'],
          [ 1, '3 hours', 'That\'s right! As long as the car is good for the next 3 hours, you\'re good.'],
          [ 0, '6 hours', 'Nope. Not that long!']
        ]
      },
      { 
        prompt: 'WaiveCars are free for the first 2 hours. When may there be charges',
        answers: [
          [ 0, 'Never. I can do whatever I please!', 'Oh that would be nice huh!? Unfortunately there\'s a bit of responsibilty.' ],
          [ 0, 'If I get a ticket, am at fault for an accident or otherwise damage the car', 'Yes, there\'s a few more to add to this list. (hint hint).' ],
          [ 0, 'If I abandon the car in the middle of nowhere at a really low charge or make it really messy', 'Yes, there\'s a few more to add to this list. (hint hint).' ],
          [ 1, 'Both B and C', 'Correct. Unfortunately if you get speeding tickets, that\'s still on you.' ]
        ]
      },
      { 
        prompt: 'I can return my Low (25% or lower) Charge Car to',
        answers: [
          [ 0, 'Whole Foods Charger', 'Woops. Whole Foods doesn\'t really like that.' ],
          [ 0, 'Public Parking Garage Charger', 'Almost! We like to service and clean our low cars.' ],
          [ 0, 'Any 3 Hour Spot', 'The car might not make it back to us if we allowed this.' ],
          [ 1, 'WaiveCar HQ', 'Correct Again! We use the car being low as a good time to make it fresh and clean.' ]
        ]
      }
    ];
    $scope.guessList = [];
    $scope.wrongAppend = 'Please Review and Try Again';

    // Check to see if the user got all the right answers.
    $scope.canProceed = function() {
      var 
        allCorrect = true, 
        guess;

      for(var ix = 0; ix < $scope.questions.length; ix++) {

        if(!(ix in $scope.guessList) ) {
          allCorrect = false;
          break;
        }

        // This is the index of the users current guess.
        guess = $scope.guessList[ix];

        // We use a 'bit' field to flag whether this particular
        // answer is correct.  if it's not than we can toggle
        // our flag off and get out of here.
        if(!$scope.quesions[ix].answers[guess][0] ) {
          allCorrect = false;
          break;
        }
      }

      return allCorrect;
    };


    $scope.quiz = function () {
    };
  }
]);
