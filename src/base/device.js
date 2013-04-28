if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define(
    function(){
        "use strict";
	
	var userAgent = navigator.userAgent.toLowerCase(),
	    audio = new Audio,
	    video = document.createElement("video");
	
        
	function Device(){
	    
	    this.userAgent = userAgent;
	    
	    this.pixelRatio = 1 / ( window.devicePixelRatio || 1 );
	    
	    this.browser = (
		userAgent.indexOf("iphone") !== -1 ? "iphone" :
		userAgent.indexOf("ipad") !== -1 ? "ipad" :
		userAgent.indexOf("android") !== -1 ? "android" :
		userAgent.indexOf("blackberry") !== -1 ? "blackberry" :
		userAgent.indexOf("msie") !== -1 ? "ie" :
		userAgent.indexOf("firefox") !== -1 ? "firefox" :
		userAgent.indexOf("chrome") !== -1 ? "chrome" :
		userAgent.indexOf("safari") !== -1 ? "safari" :
		userAgent.indexOf("opera") !== -1 ? "opera" : "unknown"
	    );
	    
	    this.browserVersion = Number( userAgent.match( new RegExp("(" + this.browser + ")( |/)([0-9]+)") )[3] );
	    
	    this.touch = "ontouchstart" in window;
	    
	    this.webgl = "WebGLRenderingContext" in window;
	    
	    this.audioMpeg = !!audio.canPlayType("audio/mpeg");
	    this.audioOgg = !!audio.canPlayType("audio/ogg");
	    this.audioMp4 = !!audio.canPlayType("audio/mp4");
	    
	    this.videoWebm = !!video.canPlayType("video/webm");
	    this.videoOgg = !!video.canPlayType("video/ogg");
	    this.videoMp4 = !!video.canPlayType("video/mp4");
	}
	
	
	Device.prototype.audioContext = function(){
	    return (
		window.audioContext || 
		window.webkitAudioContext || 
		window.mozAudioContext || 
		window.oAudioContext || 
		window.msAudioContext ||
		undefined
	    );
	}();
	
	
	Device.prototype.requestAnimFrame = function(){
	    var step = 50 / 3;
	    
	    return (
		window.requestAnimationFrame || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame || 
		window.oRequestAnimationFrame || 
		window.msRequestAnimationFrame || 
		function( callback ){
		    window.setTimeout( callback, step );
		}
	    );
	}();
	
	
	Device.prototype.cancelAnimFrame = function( id ){
	    window.clearTimeout( id );
	};
	
	
	return new Device;
    }
);