$.extend($, {

	domain : function ( ) {
		return window.location.origin;
	},
	
	path : function ( ) {
		return window.location.path;
	},
	
	// Routing interface for ChocolateChip. This allows you to use 
	// routes to trigger dynamic page manipulation. These routes also 
	// allow the browser back button to reload the previous state.
	router : {
		route : function (path) {
			if ($.router.routes.defined.hasOwnProperty(path)) {
				return $.router.routes.defined[path];
			} else {
				return new $.router.core.route(path);
			}
		},
		default : function (path) {
			$.router.routes.default = path;
		},
		error : function (fn) {
			$.router.routes.error = fn;
		},
		history : {
			pushState : function(state, title, path){
				if($.router.dispatch(path)){
					history.pushState(state, title, path);
				}
			},
			popState : function(event){
				$.router.dispatch(document.location.pathname);
			},
			observe : function(){
				window.onpopstate = $.router.history.popState;
			}
		},
		match : function (path, parameterize) {
			var params = {}, 
			route = null, 
			possible_routes, 
			slice, 
			compare;
			for (route in $.router.routes.defined) {
				if (route !== null && route !== undefined) {
					route = $.router.routes.defined[route];
					possible_routes = route.parse();
					for (var j = 0; j < possible_routes.length; j++) {
						slice = possible_routes[j];
						compare = path;
						if (slice.search(/:/) > 0) {
							for (var i = 0; i < slice.split('/').length; i++) {
								if ((i < compare.split('/').length) && (slice.split('/')[i].charAt(0) === ':')) {
									params[slice.split('/')[i].replace(/:/, '')] = compare.split('/')[i];
									compare = compare.replace(compare.split('/')[i], slice.split('/')[i]);
								}
							}
						}
						if (slice === compare) {
							if (parameterize) {
								route.params = params;
							}
							return route;
						}
					}
				}
			}
			return null;
		},
		dispatch : function (passed_route) {
			var previous_route, matched_route;
			if ($.router.routes.current !== passed_route) {
				$.router.routes.previous = $.router.routes.current;
				$.router.routes.current = passed_route;
				matched_route = $.router.match(passed_route, true);
	
				if ($.router.routes.previous) {
					previous_route = $.router.match($.router.routes.previous);
					if (previous_route !== null && previous_route._disembark !== null) {
						previous_route._disembark();
					}
				}
	
				if (matched_route !== null) {
					matched_route.execute();
					return true;
				} else {
					if ($.router.routes.error !== null) {
						$.router.routes.error();
					}
				}
			}
		},
		observe : function () {
			var fn = function(){ $.router.dispatch(location.hash); }
	
			if (location.hash === '') {
				if ($.router.routes.default !== null) {
					location.hash = $.router.routes.default;
				}
			}
	
			if ('onhashchange' in window) {
				window.onhashchange = fn;
			}
	
			if(location.hash !== '') {
				$.router.dispatch(location.hash);
			}
		},
		core : {
			'route': function (path) {
				this.path = path;
				this.action = null;
				this._beforeBoarding = null;
				this._disembark = null;
				this.params = {};
				$.router.routes.defined[path] = this;
			}
		},
		routes : {
			'current': null,
			'default': null,
			'error': null,
			'previous': null,
			'defined': {}
		}
	}
});	

$.router.core.route.prototype = {
	onboard : function (fn) {
		this.action = fn;
		return this;
	},
	beforeBoarding : function (fn) {
		this._beforeBoarding = fn;
		return this;
	},
	ondisembark : function (fn) {
		this._disembark = fn;
		return this;
	},
	parse : function () {
		var parts = [], options = [], re = /\(([^}]+?)\)/g, text;
		while (text = re.exec(this.path)) {
			parts.push(text[1]);
		}
		options.push(this.path.split('(')[0]);
		parts.forEach(function(item, idx) {
			options.push(options[idx] + item);
		});
		return options;
	},
	execute : function () {
		var halt_execution = false, result, previous;

		if ($.router.routes.defined[this.path].hasOwnProperty('_beforeBoarding')) {
			if ($.router.routes.defined[this.path]._beforeBoarding) {
				result = $.router.routes.defined[this.path]._beforeBoarding();
				if (result === false) {
					halt_execution = true;
					return;
				}
			}
		}
		if (!halt_execution) {
			$.router.routes.defined[this.path].action();
		}
	}
};
$.route = $.router.route;

$.extend($.route, {
	reroute : function ( route ) {
		window.location = window.location.host +  route;
	}
});
$.extend($, {
	defineRoutes : function ( args ) {
		args();
		$.router.observe();
	},
	paths : function ( args ) {
		args();
		$.router.observe();
	}
});
