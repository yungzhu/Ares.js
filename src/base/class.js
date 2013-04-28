if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/utils"
    ],
    function( Utils ){
	"use strict";
	
	var id = 0,
	    slice = Array.prototype.slice;
	
	
	function Class(){
	    this._id = id++;
	    this._class = this.constructor.name;
	    this._events = {};
	}
	
	
	Class.prototype.on = function( name, callback, context ){
	    var events = this._events[ name ] || ( this._events[ name ] = [] );
	    
	    events.push({
		callback: callback,
		context: context,
		ctx: context || this
	    });
	    
	    return this;
        };
	
	
	Class.prototype.off = function( name ){
	    
	    this._events[ name ].length = 0;
	    
	    return this;
        };
	
	
	Class.prototype.trigger = function( name ){
	    var event, i, il, args,
		events = this._events[ name ];
		
	    if( !events || !events.length ) return this;
	    args = slice.call( arguments, 1 );
	    
	    for( i = 0, il = events.length; i < il; i++ ){
		( event = events[i] ).callback.apply( event.ctx, args );
	    }
	    
	    return this;
        };
	
	
	Class.prototype.listenTo = function( obj, name, callback ){
	    
	    obj.on( name, callback, this );
	    
	    return this;
        };
	
	
	Class.prototype.toString = function(){
	    
	    return this._class;
        };
	
	
	Class.prototype.getId = function(){
	    
	    return this._id;
        };
	
	
	return Class;
    }
);