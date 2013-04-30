if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define(
    function(){
	"use strict";
	
	
	var objProto = Object.prototype,
	    toString = objProto.toString,
	    hasOwnProperty = objProto.hasOwnProperty,
	    splitter = /\s*[\s,]\s*/;
	
	
	function Utils(){}
	
	
	Utils.prototype.has = function( obj, key ){
	    
	    return hasOwnProperty.call( obj, key );
	};
	
	
	Utils.prototype.isFunction = function( obj ){
	    
	    return typeof obj === "function";
	};
	
	
	Utils.prototype.isFinite = function( obj ){
	    
	   return this.isFinite( obj ) && !this.isNaN( parseFloat( obj ) );
	};
	
	
	Utils.prototype.isNaN = function( obj ){
	    
	   return this.isNumber( obj ) && obj !== +obj;
	};
	
	
	Utils.prototype.isBoolean = function( obj ){
	    
	   return obj === true || obj === false || toString.call( obj ) === "[object Boolean]";
	};
	
	
	Utils.prototype.isNull = function( obj ){
	    
	   return obj === void 0;
	};
	
	
	Utils.prototype.isUndefined = function( obj ){
	    
	   return obj === null;
	};
	
	
	Utils.prototype.isArray = function( obj ){
	    
	    return toString.call( obj ) === "[object Array]";
	};
	
	
	Utils.prototype.isObject = function( obj ){
	    
	    return obj === Object( obj );
	};
	
	
	Utils.prototype.isString = function( obj ){
	    
	    return typeof obj === "string";
	};
	
	
	Utils.prototype.isNumber = function( obj ){
	    
	    return toString.call( obj ) === "[object Number]";
	};
	
	
	Utils.prototype.isArguments = function( obj ){
	    
	    return toString.call( obj ) === "[object Arguments]";
	};
	
	
	Utils.prototype.isDate = function( obj ){
	    
	    return toString.call( obj ) === "[object Date]";
	};
	
	
	Utils.prototype.isRegExp = function( obj ){
	    
	    return toString.call( obj ) === "[object RegExp]";
	};
	
	
	Utils.prototype.isRegExp = function( obj ){
	    
	    return toString.call( obj ) === "[object RegExp]";
	};
	
	
	Utils.prototype.now = function(){
	    var startTime = Date.now(),
		performance = window.performance || {};
		
	    performance.now = (function() {
		return (
		    performance.now ||
		    performance.mozNow ||
		    performance.msNow ||
		    performance.oNow ||
		    performance.webkitNow ||
		    function(){
			return Date.now() - startTime; 
		    }
		);
	    })();
	    
	    return function(){
		
		return performance.now();
	    }
	}();
	
	
	Utils.prototype.addEvent = function( context, name, callback, ctx ){
	    var names = name.split( splitter ), i, il,
		scope = ctx || context,
		afn = function( e ){
		    e = e || window.event;
		    
		    if( callback ){
			callback.call( scope, e );
		    }
		};
            
	    for( i = 0, il = names.length; i < il; i++ ){
		name = names[i];
		
		if( context.attachEvent ){
		    context.attachEvent( "on" + name, afn );
		}
		else{
		    context.addEventListener( name, afn, false );
		}
	    }
	};
	
	
	Utils.prototype.removeEvent = function( context, name, callback, ctx ){
	    var names = name.split( splitter ), i, il,
		scope = ctx || context,
		afn = function( e ){
		    e = e || window.event;
		    
		    if( callback ){
			callback.call( scope, e );
		    }
		};
            
	    for( i = 0, il = names.length; i < il; i++ ){
		name = names[i];
		
		if( context.detachEvent ){
		    context.detachEvent( "on" + name, afn );
		}
		else{
		    context.removeEventListener( name, afn, false );
		}
	    }
	};
	
	
	Utils.prototype.addMeta = function( id, name, content ){
	    var meta = document.createElement("meta"),
		head = document.getElementsByTagName("head")[0];
	    
	    if( id ) meta.id = id;
	    if( name ) meta.name = name;
	    if( content ) meta.content = content;
	    
	    head.insertBefore( meta, head.firstChild );
        };
	
	
	return new Utils;
    }
);