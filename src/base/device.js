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
	    var request = (
		window.requestAnimationFrame || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame || 
		window.oRequestAnimationFrame || 
		window.msRequestAnimationFrame || 
		function( callback, element ){
		    window.setTimeout(function(){
			callback( Date.now() );
		    }, 50/3 );
		}
	    );
	    
	    return function( callback, element ){
		request.call( window, callback, element );
	    };
	}();
	
	
	Device.prototype.cancelAnimFrame = function( id ){
	    window.clearTimeout( id );
	};
	
	
	Device.prototype.getWebGLContext = function(){
	    var defaultAttributes = {
		alpha: true,
		antialias: true,
		depth: true,
		premultipliedAlpha: true,
		preserveDrawingBuffer: false,
		stencil: true
	    },
	    names = ["webgl", "webkit-3d", "moz-webgl", "experimental-webgl", "3d"];
	    
	    return function( canvas, attributes ){
		attributes = !!attributes ? attributes : defaultAttributes;
		
		var gl, i = 0, name;
		    
		for( i; i < names.length; i++ ){
		    
		    gl = canvas.getContext( names[i], attributes );
		    
		    if( !!gl ){
			break;
		    }
		}
		
		if( !gl ){
		    throw new Error("Device.getWebGLContext: WebGL Context Creation Failed: "+ error );
		}
		
		return gl;
	    };
	}();
	
	
        Device.prototype.createShader = function( gl, type, source ){
            var shader;
            
            if( type === "fragment" ){
                shader = gl.createShader( gl.FRAGMENT_SHADER );
            }
            else if( type === "vertex" ){
                shader = gl.createShader( gl.VERTEX_SHADER );
            }
	    else{
		throw new Error("Device.createShader: no shader called"+ type );
	    }
            
            gl.shaderSource( shader, source );
            gl.compileShader( shader );
            
            if( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ){
                throw Error("Device.createShader: problem compiling shader "+ gl.getShaderInfoLog( shader ) );
                gl.deleteShader( shader );
                return undefined;
            }
            
            return shader;
        };
        
        
        Device.prototype.createProgram = function( gl, vertex, fragment ){
            var program = gl.createProgram(),
                shader, i, il;
            
	    if( vertex instanceof Array ){
		for( i = 0, il = vertex.length; i < il; i++ ){
		    shader = this.createShader( gl, "vertex", vertex[i] );
		    gl.attachShader( program, shader );
		    gl.deleteShader( shader );
		}
	    }
	    else{
		shader = this.createShader( gl, "vertex", vertex );
		gl.attachShader( program, shader );
		gl.deleteShader( shader );
	    }
	    
	    if( fragment instanceof Array ){
		for( i = 0, il = fragment.length; i < il; i++ ){
		    shader = this.createShader( gl, "fragment", fragment[i] );
		    gl.attachShader( program, shader );
		    gl.deleteShader( shader );
		}
	    }
	    else{
		shader = this.createShader( gl, "fragment", fragment );
		gl.attachShader( program, shader );
		gl.deleteShader( shader );
	    }
            
            gl.linkProgram( program );
            gl.validateProgram( program );
            gl.useProgram( program );
            
            if( !gl.getProgramParameter( program, gl.LINK_STATUS ) ){
                throw Error("Device.createProgram: problem compiling Program "+ gl.getProgramInfoLog( program ) );
                gl.deleteProgram( program );
                return undefined;
            }
            
            return program;
        };
	
	
	return new Device;
    }
);