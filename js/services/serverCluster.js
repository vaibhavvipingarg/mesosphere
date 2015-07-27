/*global angular */

/**
 * Services that persists and retrieves model from localStorage/fileStorage if available.
 *
 */
angular.module('servercluster')
	.factory('serverStorage', function ($http, $injector) {
		'use strict';

		// Detect if an API backend is present. If so, return the API module, else
		// hand off the localStorage adapter
		return $http.get('/api')
			.then(function () {
				return $injector.get('api');
			}, function () {
				return $injector.get('localStorage');
			});
	})
	.factory('localStorage', function ($q, $http) {
		'use strict';

		var STORAGE_ID = 'local-serverStorage';

		function getAvailableServer() {
			var server = {};
			var singleServers = [],
				servers = serverCluster.getServers();
			//Iterate over the cluster's servers to find the one that has 0 apps
			for(var i = 0; i < servers.length; i++) {
				server = servers[i];
			    if(server.apps.length === 0) {
			    	return server;
			    } else if (server.apps.length === 2) {
			    	continue;
			    } else if (server.apps.length === 1) {
			    	singleServers.push(server);
			    }
			}
			if (singleServers.length !== 0) {
				return singleServers[0];
			}
		}
		//Get the app details read from the json - available apps
		function getAppDetails(type) {
			var apps = serverCluster.getApps();
			return apps[type];
		}

		var serverCluster = {
			clusterInfo: {
				servers: [],
				availableApps: [
							{
								"name": "Hadoop",
								"sc": "HD",
								"type": 0,
								"grad": "grad0",
								"appMap": []
							},
							{
								"name": "Rails",
								"sc": "RL",
								"type": 1,
								"grad": "grad1",
								"appMap": []
							},
							{
								"name": "Chronos",
								"sc": "CH",
								"type": 2,
								"grad": "grad2",
								"appMap": []
							},
							{
								"name": "Storm",
								"sc": "ST",
								"type": 3,
								"grad": "grad3",
								"appMap": []
							},
							{
								"name": "Spark",
								"sc": "SP",
								"type": 4,
								"grad": "grad4",
								"appMap": []
							}
				]
			},

			_getFromLocalStorage: function () {
				return JSON.parse(localStorage.getItem(STORAGE_ID) || '{}');
			},

			_saveToLocalStorage: function (clusterInfo) {
				localStorage.setItem(STORAGE_ID, JSON.stringify(clusterInfo));
			},
			getServers: function() {
				return serverCluster.clusterInfo.servers;
			},
			getApps: function() {
				return serverCluster.clusterInfo.availableApps;
			},
			initCluster: function() {
				//add 4 empty servers to the list
				if (serverCluster.getServers().length === 0) {
					for (var i = 0; i<4; i++) {
						serverCluster.addServer();
					}
				}
			},

			addServer: function() {
				//Add entry to the list of servers
				var server = {
					id: (new Date().getTime())/1000,
					apps:[]
				};
				serverCluster.getServers().push(server);
				serverCluster._saveToLocalStorage(serverCluster.clusterInfo);
			},

			deleteServer: function(serverId) {
				var apps = null,
					servers =  serverCluster.getServers();

				if (serverId !== undefined) {
					//Remove the server matching the serverId
					for(var i = servers.length-1; i>=0; i--) {
						var server = servers[i];
					    if(server.id === serverId) {
					    	apps = server.apps;
					    	servers.splice(i,1);
					    	break;	
					    } 
					}
				} else {
					//Remove the last server entry
					var s = servers.pop();
					apps = s.apps;
				}

				//Redistribute the apps running on that server
				if (apps !== null && apps.length > 0) {
					//redistribute the apps
					for (var i =0; i< apps.length; i++) {
						serverCluster.addApp(apps[i].type);
					}	
				}

				serverCluster._saveToLocalStorage(serverCluster.clusterInfo);
			},

			addApp: function(type) {
				//Logic to figure out which server to add to, delegate to the cluster
				var server = getAvailableServer();
				if (server !== undefined) {
					var appDetails = getAppDetails(type);
					var app = {
						id: (new Date().getTime())/1000,
						creationTime: (new Date().getTime())/1000,
						type: type,
						name: appDetails.name,
						sc: appDetails.sc,
						grad: appDetails.grad,
						appMap: appDetails.appMap,
					}
					server.apps.push(app);

					//Add app to server map
					serverCluster.getApps()[type].appMap.push({'app': app.id, 'server': server.id});
				}

				//Resolve
				serverCluster._saveToLocalStorage(serverCluster.clusterInfo);
			},

			deleteApp: function(app) {
				//find from the app map which server the app of this type was added to. If the server
				//contains this app then delete it from that server.
				var lastEntry = serverCluster.getApps()[app.type].appMap.pop();
				var serverId = lastEntry.server,
					appId = lastEntry.app,
					servers = serverCluster.getServers();
				if (serverId !== undefined) {
					//Remove the server matching the serverId
					var finish = false;
					for(var i = servers.length-1; i>=0; i--) {
						var server = servers[i];
					    if(server.id === serverId) {
					    	var apps = server.apps;
					    	for (var j = 0 ; j < apps.length; j++) {
					    		if (apps[j].id === appId) {
					    			apps.splice(j,1);
					    			finish = true;
					    			break;
					    		}
					    	}
					    	if (finish === true) {
					    		break;
					    	}
					    } 
					}
				} 

				serverCluster._saveToLocalStorage(serverCluster.clusterInfo);
			},
			
			get: function () {
				var deferred = $q.defer();
				var clusterInfo = serverCluster._getFromLocalStorage();
				//Copy over the contents from the data source
				angular.copy(clusterInfo.servers, serverCluster.clusterInfo.servers);
				if (clusterInfo.availableApps !== undefined && clusterInfo.availableApps.length !== 0) {
					angular.copy(clusterInfo.availableApps, serverCluster.clusterInfo.availableApps);					
				}

				deferred.resolve(serverCluster.clusterInfo.servers);
				deferred.resolve(serverCluster.clusterInfo.availableApps);

				return deferred.promise;
			}
		};

		return serverCluster;
	});
