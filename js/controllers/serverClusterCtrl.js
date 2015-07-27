/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the serverCluster service
 * - exposes the model to the template and provides event handlers
 */
angular.module('servercluster')
	.controller('ServerClusterCtrl', function ServerClusterCtrl($scope, $routeParams, serverCluster) {
		'use strict';

		var servers = $scope.servers = serverCluster.getServers();
		var availableApps = $scope.availableApps = serverCluster.getApps();

		$scope.init = function() {
			serverCluster.initCluster();
		};
		$scope.addServer = function () {
			$scope.saving = true;
			serverCluster.addServer();
			$scope.saving = false;
		};
		$scope.deleteServer = function (serverId) {
			serverCluster.deleteServer(serverId);			
		};
		$scope.addApp = function (type) {
			serverCluster.addApp(type);
		};
		$scope.deleteApp = function (app) {
			serverCluster.deleteApp(app);
		};
		$scope.getAppClassName = function(server, app) {
			if (app === undefined) {
				return '';
			}
			var appClass  = app.grad;
			if (server !== undefined && server.apps.length === 2) {
				appClass += ' multiple';
			}
			return appClass;
		};
		$scope.init();
	});
