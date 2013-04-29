if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
	"base/time",
	"math/vec2"
    ],
    function( Class, Time, Vec2 ){
	"use strict";
        
        var min = Math.min,
	    startNeedsUpdate = true,
            moveNeedsUpdate = true,
            endNeedsUpdate = true,
            
            element, offsetX, offsetY, x, y, last = new Vec2,
            
            touches, touch, count, i, j,
            evtTouches, evtTouch;
        
        
        function Touches( max ){
            
            Class.call( this );
            
            max = min( max || 5, 5 );
            this.array = [];
            
            for( var i = 0; i < max; i++ ){
                this.array.push( new Touch );
            }
        };
        
        Touches.prototype = Object.create( Class.prototype );
	Touches.prototype.constructor = Touches;
        
        
        Touches.prototype.clear = function(){
            var array =  this.array,
                t = 0, tl = array.length;
            
            for( t; t < tl; t++ ){
                
                array[t].clear();
            }
        };
        
        
        Touches.prototype.getTouches = function(){
	    var defaultArray = [];
	    
	    return function( array ){
		array = array instanceof Array ? array : defaultArray;
		array.length = 0;
		
		var thisArray = this.array, touch,
		    t = 0, tl = thisArray.length;
		
		for( t; t < tl; t++ ){
		    touch = thisArray[t];
		    
		    if( touch.identifier !== -1 ){
			array.push( touch );
		    }
		}
		
		return array;
	    };
	}();
        
        
        Touches.prototype.forEach = function( callback ){
	    var thisArray = this.array, touch,
		t = 0, tl = thisArray.length;
	    
	    for( t; t < tl; t++ ){
		touch = thisArray[t];
		
		if( touch.identifier !== -1 ){
		    callback( touch );
		}
	    }
	};
        
        
        Touches.prototype.count = function(){
	    var thisArray = this.array, touch,
		t = 0, tl = thisArray.length,
		count = 0;
	    
	    for( t; t < tl; t++ ){
		touch = thisArray[t];
		
		if( touch.identifier !== -1 ){
		    count++;
		}
	    }
	    
	    return count;
	};
	
        
        Touches.prototype.update = function(){
            
            startNeedsUpdate = true;
            moveNeedsUpdate = true;
            endNeedsUpdate = true;
        };
        
        
        Touches.prototype.handleEvents = function( e ){
            e.preventDefault();
            
            switch( e.type ){
                case "touchstart":
                    this.handle_touchstart( e );
                    break;
                
                case "touchmove":
                    this.handle_touchmove( e );
                    break;
                
                case "touchend":
                case "touchcancel":
                    this.handle_touchend( e );
                    break;
            }
        };
        
        
        Touches.prototype.handle_touchstart = function( e ){
            
            if( startNeedsUpdate ){
                
                touches = this.array;
                evtTouches = e.touches;
                count = evtTouches.length;
		
		if( count <= touches.length ){
		    for( i = 0; i < count; i++ ){
			evtTouch = evtTouches[i];
			touch = touches[i];
                        
                        touch.identifier = evtTouch.identifier;
                        
			touch.startTime = Time.time;
			
                        touch.getPosition( evtTouch );
			
			if( touch._first ){
			    touch._downFrame = Time.frame;
			    touch._first = false;
			}
                        
                        touch.start.copy( touch.position );
                        
                        this.trigger("touchStart", touch );
                    }
                }
                else{
                    this.clear();
                }
                
                startNeedsUpdate = false;
            }
        };
        
        
        Touches.prototype.handle_touchmove = function( e ){
            
            if( moveNeedsUpdate ){
                
                touches = this.array;
                evtTouches = e.changedTouches;
                count = evtTouches.length;
		
		for( i = 0; i < count; i++ ){
		    evtTouch = evtTouches[i];
		    
		    for( j = 0; j < touches.length; j++ ){
			touch = touches[j];
                        
			if( touch.identifier === evtTouch.identifier ){
                        
                            last.copy( touch.position );
                            
                            touch.getPosition( evtTouch );
                            
                            touch.delta.vsub( touch.position, last );
                            
                            this.trigger("touchMove", touch );
                        }
                    }
                }
                
                moveNeedsUpdate = false;
            }
        };
        
        
        Touches.prototype.handle_touchend = Touches.prototype.handle_touchcancel = function( e ){
            
            if( endNeedsUpdate ){
                
                touches = this.array;
                evtTouches = e.changedTouches;
                count = evtTouches.length;
		
		for( i = 0; i < count; i++ ){
		    evtTouch = evtTouches[i];
		    
		    for( j = 0; j < touches.length; j++ ){
			touch = touches[j];
			
			if( touch.identifier === evtTouch.identifier ){ 
                            
                            last.copy( touch.position );
                            
                            touch.getPosition( evtTouch );
			    
			    if( !touch._first ){
				touch._upFrame = Time.frame;
				touch._first = true;
			    }
                            
			    touch.endTime = Time.time;
			    touch.deltaTime = touch.endTime - touch.startTime;
			    
                            touch.end.copy( touch.position );
                            
			    touch.identifier = -1;
                            
                            this.trigger("touchEnd", touch );
                        }
                    }
                }
                
                endNeedsUpdate = false;
            }
        };
        
        
        function Touch(){
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
            element = e.target || e.srcElement,
            offsetX = element.offsetLeft,
            offsetY = element.offsetTop;
            
            x = ( e.pageX || e.clientX ) - offsetX;
            y = ( window.innerHeight - ( e.pageY || e.clientY ) ) - offsetY;
            
            this.position.set( x, y );
        };
        
        
        return new Touches();
    }
);