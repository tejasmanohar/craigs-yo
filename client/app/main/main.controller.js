'use strict';

angular.module('yoCraigslistApp')
  .controller('MainCtrl', function($scope, $http) {
    $scope.data = {};

    $scope.submit = function() {
      $http.post('/register', $scope.data).success(function(data) {
        $('.resp-err').hide();
        $('.resp').show();
      }).error(function(data) {
        $('.resp').hide();
        $('.resp-err').show();
      })
    };
  });