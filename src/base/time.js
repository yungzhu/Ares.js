if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/utils"
    ],
    function( Utils ){
        "use strict";
	
        
	function Time(){
	    
	    this.sinceStartup = 0;
	    
	    this.time = 0;
	    
	    this.delta = 1/60;
	    
	    this.scale = 1;
	    
	    this.fps = 60;
	    
	    this.frame = 0;
	}
	
	
	var s, sLast, ms = 0, msLast = -16, last = -1000,
	    dt = 1/60, frames = 60;
	    
	
	Time.prototype.start = function(){
	    ms = Utils.now();
	    
	    frames++;
	    
	    if( last + 1000 < ms ){
		
		this.fps = ( frames * 1000 ) / ( ms - last );
		
		last = ms;
		frames = 0;
	    }
	    
	    s = ms / 1000;
	    sLast = msLast / 1000;
	    dt = s - sLast;
	    
	    this.time = s * this.scale;
	    this.delta = dt * this.scale;
	    this.frame++;
	};
	
	
	Time.prototype.end = function(){
	    msLast = ms;
	};
	
	
	return new Time;
    }
);