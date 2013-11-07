mage.directive('export', function(UserService, appConstants, mageLib) {
  return {
    restrict: "A",
    templateUrl:  "js/app/partials/export.html",
    controller: function ($scope, MapService, mageLib) {
      $scope.ms = MapService;

      $scope.exportStartDate = new Date();
      $scope.exportStartTime = '00:00:00';
      $scope.exportEndDate = new Date();
      $scope.exportEndTime = '23:59:59';

	  /* Export existing points to  */
	  $scope.exportOptions = [{
	    value: 300,
	    label: 'Last 5 minutes'
	  },{
	    value: 3600,
	    label: 'Last Hour'
	  },{
	    value: 43200,
	    label: 'Last 12 Hours'
	  },{
	    value: 86400,
	    label: 'Last 24 Hours'
	  },{
	    all: true,
	    value: null,
	    label: 'All  (Use With Caution)'
	  },{
	    custom: true,
	    value: null,
	    label: 'Custom (Choose your own start/end)'
	  }];
	  $scope.export = $scope.exportOptions[0];

	  $scope.exportData = function(type) {
		var layerIds = _.pluck(_.filter($scope.featureLayers, function(layer) { return layer.exportChecked; }), 'id');

	    $scope.showLayerError = !$scope.fft && layerIds.length == 0;
	    if ($scope.showLayerError) return;

	    if ($scope.export.custom) {
	      var startDate = moment($scope.exportStartDate).utc();
	      if (startDate) {
	        var startTime = $scope.exportStartTime || '00:00:00';
	        var start = startDate.format("YYYY-MM-DD") + " " + startTime;
	      }

	      var endDate = moment($scope.exportEndDate).utc();
	      if (endDate) {
	        var endTime = $scope.exportEndTime || '23:59:59';
	        var end = endDate.format("YYYY-MM-DD") + " " + endTime;
	      }
	    } else if ($scope.export.value) {
	      var start = moment().subtract('seconds', $scope.export.value).utc().format("YYYY-MM-DD HH:mm:ss");
	    }

	    var url = appConstants.rootUrl + "/api/export" + 
	      "?access_token=" + mageLib.getLocalItem('token') + "&type=" + type;

	    if (start) {
	      url += "&startDate=" +  start;
	    }

	    if (end) {
	      url += "&endDate=" + end;
	    }
	      
	    if ($scope.fft) {
	      url = url + "&fft=" + $scope.fft;
	    }

	    if (layerIds.length) {
	      url = url + "&layerIds=" + layerIds;
	    }

	    window.location.href = url;
	  }
    }
  };
});