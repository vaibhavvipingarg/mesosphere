/*global angular */

/**
 * The main server cluster app module
 *
 * @type {angular.Module}
 */
angular.module('servercluster', ['ngRoute'])
	.config(function ($routeProvider) {
		'use strict';

		var routeConfig = {
			controller: 'ServerClusterCtrl',
			templateUrl: 'serverCluster.html',
			resolve: {
				serverCluster: function (serverStorage) {
					// Get the correct module (API or localStorage).
					return serverStorage.then(function (module) {
						module.get(); // Fetch the model
						return module;
					});
				}
			}
		};

		$routeProvider
			.when('/', routeConfig)
			.otherwise({
				redirectTo: '/'
			});
	});
