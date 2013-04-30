if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
	"math/vec2"
    ],
    function( Class, Vec2 ){
	"use strict";
        
        
        function Touch(){
	    
	    Class.call( this );
	    
            this.identifier = -1;
            
            this.start = new Vec2;
            this.delta = new Vec2;
            this.position = new Vec2;
            this.end = new Vec2;
	    
	    this._first = false;
	    
	    this._downFrame = -1;
	    this._upFrame = -1;
	    
	    this.startTime = 0;
	    this.deltaTime = 0;
	    this.endTime = 0;
        };
	
	Touch.prototype = Object.create( Class.prototype );
	Touch.prototype.constructor = Touch;
        
        
        Touch.prototype.clear = function(){
            this.identifier = -1;
            
            this.start.set( 0, 0 );
            this.delta.set( 0, 0 );
            this.position.set( 0, 0 );
            this.end.set( 0, 0 );
	    
	    this.startTime = 0;
	    this.deltaTime = 0;
	    this.endTime = 0;
        };
        
        
        Touch.prototype.getPosition = function( e ){
            var element = e.target || e.srcElement,
		offsetX = element.offsetLeft,
		offsetY = element.offsetTop,
		
		x = ( e.pageX || e.clientX ) - offsetX,
		y = ( window.innerHeight - ( e.pageY || e.clientY ) ) - offsetY;
            
            this.position.set( x, y );
        };
        
        
        return Touch;
    }
);