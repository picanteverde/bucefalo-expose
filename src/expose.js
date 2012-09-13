var bucefalo = bucefalo || {};
(function(){
	bucefalo.createFakeSocket = function(){
		return {
			events:[],
			on: function(evt,cb){
				if(!this.events[evt]){
					this.events[evt] = [];
				}
				this.events[evt].push(cb);
			},
			emit: function(evt, data){
				this.socket.recieve(evt,data);
			},
			recieve: function(evt,data){
				var l,i, cbs;
				if(this.events[evt]){
					cbs = this.events[evt];
					l = cbs.length;
					for(i = 0; i < l; i++){
						cbs[i](data);
					}
				}
			}
		};
	};

	var createDefinition = function(o){
		var i, 
			def = {};
		for (member in o ) {
			if (typeof(member) === "function"){
				def[member] = "function";
			}else{
				def[member] = "property";
			}
		}
		return def;
	};

	var createProxy = function(def){
		var p = {};
		for(member in def){
			if(def.hasOwnProperty(member)){
				switch(def[member]){
					case "function":
						p[member] = methodWrapper;
						break;
					case "property":
						p[member] = propertyWrapper;
						break;
				}
			}
		}
	};


	bucefalo.createExposer = function(socket){
		var exposedObjects = {},
			proxyObjects = {},
			definitions = {},
			exposer = {
				expose: function(o, instanceId){
					var def = createDefinition(o);

					definitions[instanceId] = def;

					exposedObjects[instanceId] = {
						instance: o,
						definition: def
					};
					this.publish();
				},
				get: function(instanceId){

				},
				publish: function(){
					socket.emit('bucefalo-expose-publish',definitions);
				}
			};

			socket.on('bucefalo-expose-publish',function(definitions){
				var instanceId;
				for(instanceId in definitions){
					if(!proxyObjects[instanceId]){
						proxyObjects[instanceId] = createProxy(definitions[instanceId], instanceId, socket);
					}
				}
			});

			socket.on('bucefalo-expose-call',function(call){
				var o;
				if(exposedObjects[call.instance]){
					o = exposedObjects[call.instance];
					socket.emit('bucefalo-expose-response',o[call.method](call.args));
				}
			});

			
		return exposer;
	};

}());