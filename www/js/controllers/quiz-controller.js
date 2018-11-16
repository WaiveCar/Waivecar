'use strict';
var angular = require('angular');

function QuizController($injector, $stateParams, $scope, $interval, $data){

  var $auth = $injector.get('$auth');
  var $window = $injector.get('$window');
  var $state = $injector.get('$state');

  function setupQuiz() {
    if($data.me.hasTag('level')) {
      $scope.questionList = [
        {
          prompt: 'Who is allowed in a WaiveCar?',
          answerList: [
            [ 0, 'Only level residents', 'Guests are allowed!' ],
            [ 1, 'Anyone, but only the renter can drive', 'Correct. Only level residents can rent, and the renter must drive'],
            [ 0, 'Anyone can come in and anyone can drive', 'Sorry. Driving is restricted to the renter.'],
            [ 0, 'The cars are completely autonomous and drive themselves!', "Oh don't you wish! Maybe in a few years."]
          ]
        },
        {
          prompt: 'WaiveCars are free for the first 3 hours. When may there be charges?',
          answerList: [
            [ 0, 'Never. I can do whatever I please!', 'Unfortunately there\'s a bit of responsibilty.' ],
            [ 0, 'If I get a ticket, am at fault for an accident or otherwise damage the car', 'Yes, there\'s a few more to add to this list. (hint hint).' ],
            [ 0, 'If I abandon the car at a really low charge or make it really messy', 'Yes, there\'s a few more to add to this list. (hint hint).' ],
            [ 1, 'Both B and C', 'Correct. Unfortunately if you get speeding tickets, that\'s still on you.' ]
          ]
        },
        {
          prompt: 'I can end my ride at',
          answerList: [
            [ 0, 'Any parking garage', 'Almost! We are specific on our garages.' ],
            [ 0, 'The shoulder of the New Jersey Turnpike', "That's silly. I mean come on, really?" ],
            [ 0, 'Any street parking space', 'The cars have to be convenient for other residents.' ],
            [ 1, 'The 24 hour lot at 34 North 7th Street', 'Correct Again! All bookings must end here.' ]
          ]
        }
      ];
    } else if($data.me.hasTag('csula')) {
      $scope.questionList = [
        {
          prompt: 'How do you fuel a WaiveCar?',
          answerList: [
            [ 0, '87 Octane at a gas station', "That's a BIG NO! These cars take a special kind of fuel." ],
            [ 1, 'On campus for free between 8AM-5PM at the Hydrogen station, off campus at my expense', 'Correct. Hydrogen fuel off campus is expensive'],
            [ 0, 'They are electric and you plug them in to a wall', 'No. Their are many fine electric cars, but these are Hydrogen Fuel Cells.'],
            [ 0, 'The cars run forever on a perpetual motion machine', "What Sorcery! No, sorry."]
          ]
        },
        {
          prompt: 'WaiveCars are free for the first 2 hours. When may there be charges?',
          answerList: [
            [ 0, 'Never. I can do whatever I please!', 'Unfortunately there\'s a bit of responsibilty.' ],
            [ 0, 'If I get a ticket, am at fault for an accident or otherwise damage the car', 'Yes, there\'s a few more to add to this list. (hint hint).' ],
            [ 0, 'If I abandon the car at a really low fuel level or make it really messy', 'Yes, there\'s a few more to add to this list. (hint hint).' ],
            [ 1, 'Both B and C', 'Correct. Unfortunately if you get speeding tickets, that\'s still on you.' ]
          ]
        },
        {
          prompt: 'I can end my ride at',
          answerList: [
            [ 0, 'Any place on campus', 'Almost! You get special parking spaces.' ],
            [ 0, 'The bottom of the LA river', "That's silly. I mean come on, really?" ],
            [ 0, 'Any street parking space', 'The cars have to be convenient for others.' ],
            [ 1, 'The marked spaces at the lot I picked it up at', 'Correct Again! All bookings must end here.' ]
          ]
        }
      ];
    } else {
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
          prompt: 'I can return my low (25mi or lower) charge car to',
          answerList: [
            [ 0, 'Whole Foods Charger', 'Woops. Whole Foods doesn\'t really like that.' ],
            [ 0, 'Public Parking Garage Charger', 'Almost! We like to service and clean our low cars.' ],
            [ 0, 'Any 3 Hour Spot', 'The car might not make it back to us if we allowed this.' ],
            [ 1, 'WaiveCar HQ', 'Correct Again! We use the car being low as a good time to make it fresh and clean.' ]
          ]
        }
      ];
    }
  }

  $scope.init = function(){
    // we start with an empty list to make sure
    // we don't get any weird errors.
    $scope.questionList = [];
    $scope.isWizard = $stateParams.step;
    $scope.user = $auth.me;
    $scope.timer = 180;
    $scope.width = $window.innerWidth;

    $data.resources.users.me().$promise
      .then(function(me) {
        $scope.user = me;
        $scope.user.hasTag = $data.me.hasTag;
        setupQuiz();
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
