if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
	"base/utils",
	"base/device"
    ],
    function( Class, Utils, Device ){
        "use strict";
        
	var addMeta = Utils.addMeta,
	    addEvent = Utils.addEvent;
	
        
        function Canvas( width, height ){
            
            Class.call( this );
	    
	    this.viewportId = "viewport"+ this._id;
	    
	    addMeta( this.viewportId, "viewport", "initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" );
	    addMeta( this.viewportId +"-width", "viewport", "width=device-width" );
	    addMeta( this.viewportId +"-height", "viewport", "height=device-height" );
	    
	    addMeta( undefined, "apple-mobile-web-app-status-bar-style", "black" );
	    addMeta( undefined, "apple-mobile-web-app-capable", "yes" );
	    
	    var element = document.createElement("canvas")
	    this.element = element; 
	    
	    if( !width && !height ){
		this.fullScreen = true;
		
		this.width = window.innerWidth;
		this.height = window.innerHeight;
	    }
	    else{
		this.width = width !== undefined ? width : 960;
		this.height = height !== undefined ? height : 640;
	    }
	    
	    element.style.position = "absolute";
	    element.style.left = "50%";
	    element.style.top = "50%";
	    element.style.padding = "0px";
	    element.style.margin = "0px";
	    
	    element.marginLeft = -this.width * 0.5 +"px";
	    element.marginTop = -this.height * 0.5 +"px";
	    
	    element.style.width = Math.floor( this.width ) +"px";
	    element.style.height = Math.floor( this.height ) +"px";
	    element.width = this.width;
	    element.height = this.height;
	    
	    this.aspect = this.width / this.height;
	    
	    element.oncontextmenu = function(){ return false; };
	    
	    document.body.appendChild( element );
	    
	    this.handleResize();
	    
	    addEvent( window, "resize orientationchange", this.handleResize, this );
        }
        
        Canvas.prototype = Object.create( Class.prototype );
        Canvas.prototype.constructor = Canvas;
        
        
	Canvas.prototype.set = function( width, height ){
	    if( !width || !height ){
		console.warn("Canvas.set: no width and or height specified using default width and height");
		return;
	    }
	    
	    width = width;
	    height = height;
	    
	    this.width = width;
	    this.height = height;
	    this.aspect = this.width / this.height;
	    
	    this.handleResize();
	};
	
	
        Canvas.prototype.handleResize = function(){
            var element = this.element,
		elementStyle = element.style,
		w = window.innerWidth,
		h = window.innerHeight,
		pixelRatio = Device.pixelRatio,
		aspect = w / h, width, height,
		id = "#"+ this.viewportId,
		viewportScale = document.querySelector( id ).getAttribute("content");
	    
	    
	    if( this.fullScreen ){
		width = w;
		height = h;
		
		this.width = element.width = width;
		this.height = element.height = height;
		
		this.aspect = width / height;
	    }
	    else{
		if( aspect >= this.aspect ){
		    width = h * this.aspect;
		    height = h;
		}
		else{
		    width = w;
		    height = w / this.aspect;
		}
	    }
	    
	    elementStyle.width = Math.floor( width ) +"px";
	    elementStyle.height = Math.floor( height ) +"px";
	    
	    elementStyle.marginLeft = -width * 0.5 +"px";
	    elementStyle.marginTop = -height * 0.5 +"px";
	    
	    document.querySelector( id ).setAttribute("content", viewportScale.replace(/-scale\s*=\s*[.0-9]+/g, "-scale=" + pixelRatio ) );
	    
	    document.querySelector( id +"-width").setAttribute("content", "width="+ w );
	    document.querySelector( id +"-height").setAttribute("content", "height="+ h );
	    
	    window.scrollTo( 0, 0 );
	    
	    this.trigger("resize");
        };
	
        
        return Canvas;
    }
);