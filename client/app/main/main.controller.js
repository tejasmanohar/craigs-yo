'use strict';

angular.module('yoCraigslistApp')
  .controller('MainCtrl', function($scope, $http) {
    $scope.data = {};

    $scope.submit = function() {
      $http.post('/register', $scope.data).success(function(data) {
        $('.form-inline').on('submit', function() {
          $('<h2>').css('display','');
          $('<h2>').text('submitted, yo');
        });
      });
    };
  });
