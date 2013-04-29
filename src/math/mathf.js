if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define(
    function(){
	"use strict";
	
	var random = Math.random,
	    floor = Math.floor,
	    abs = Math.abs,
	    atan2 = Math.atan2;
	
	
	function Mathf(){
	    
	    this.PI = 3.141592653589793;
	    this.TWO_PI = this.PI * 2;
	    this.HALF_PI = this.PI / 2;
	    
	    this.EPSILON = 0.000001;
	    
	    this.TO_RADS = this.PI / 180;
	    this.TO_DEGS = 180 / this.PI;
	}
	
	
	Mathf.prototype.acos = Math.acos;
	Mathf.prototype.asin = Math.asin;
	Mathf.prototype.atan = Math.atan;
	Mathf.prototype.atan2 = Math.atan2;
	
	Mathf.prototype.cos = Math.cos;
	Mathf.prototype.sin = Math.sin;
	Mathf.prototype.tan = Math.tan;
	
	Mathf.prototype.abs = Math.abs;
	Mathf.prototype.ceil = Math.ceil;
	Mathf.prototype.exp = Math.exp;
	Mathf.prototype.floor = Math.floor;
	Mathf.prototype.log = Math.log;
	Mathf.prototype.max = Math.max;
	Mathf.prototype.min = Math.min;
	Mathf.prototype.pow = Math.pow;
	Mathf.prototype.random = Math.random;
	Mathf.prototype.round = Math.round;
	Mathf.prototype.sqrt = Math.sqrt;
	
	
	Mathf.prototype.equals = function( a, b ){
	    
	    return abs( a - b ) <= this.EPSILON;
	};
	
	
	Mathf.prototype.modulo = function( a, b ){
            var r = a % b;
            
            return ( r * b < 0 ) ? r + b : r;
        };
	
	
	Mathf.prototype.standardRadian = function( t ){
	    
	    return this.modulo( t, this.TWO_PI );
	};
	
	
	Mathf.prototype.standardAngle = function( t ){
	    
	    return this.modulo( t, 360 );
	};
	
	
	Mathf.prototype.sign = function( t ){
	    
	    return t < 0 ? -1 : 1;
	};
	
	
	Mathf.prototype.clamp = function( t, min, max ){
	    
	    return t < min ? min : t > max ? max : t;
	};
	
	
	Mathf.prototype.clamp01 = function( t ){
	    
	    return t < 0 ? 0 : t > 1 ? 1 : t;
	};
	
	
	Mathf.prototype.lerp = function( a, b, t ){
	    
	    return a + ( b - a ) * this.clamp01( t );
	};
	
	
	Mathf.prototype.lerpAngle = function( a, b, t ){
	    
	    return this.standardRadian( a + ( b - a ) * this.clamp01( t ) );
	};
	
	
	Mathf.prototype.smoothStep = function( t, min, max ){
            t = ( this.clamp01( t ) - min ) / ( max - min );
            
            return t * t * ( 3 - 2 * t );
        };
        
        
        Mathf.prototype.smootherStep = function( t, min, max ){
            t = ( this.clamp01( t ) - min ) / ( max - min );
            
            return t * t * t * ( t * ( t * 6 - 15 ) + 10 );
        };
        
        
        Mathf.prototype.pingPong = function( t, length ){
	    length || ( length = 1 );
	    
	    return length - abs( t % ( 2 * length ) - length );
        };
        
        
        Mathf.prototype.toRadians = function( x ){
	    
	    return this.standardRadian( x * this.TO_RADS );
        };
        
        
        Mathf.prototype.toDegrees = function( x ){
	    
	    return this.standardAngle( x * this.TO_DEGS );
        };
        
        
        Mathf.prototype.randomRange = function( min, max ){
	    
	    return min + ( random() * ( max - min ) );
        };
        
        
        Mathf.prototype.randomChoice = function( array ){
	    
	    return array[ floor( random() * array.length ) ]
        };
        
        
        Mathf.prototype.isPowerOfTwo = function( x ){
	    
	    return ( x & -x ) === x;
        };
        
        
        Mathf.prototype.nextPowerOfTwo = function( x ){
	    var i = 2;
	    
	    while( i < x ){
		i *= 2;
	    }
	    
	    return i;
        };
        
        
        Mathf.prototype.direction = function( x, y ){
	    
	    if( abs( x ) >= abs( y ) ){
		
		return x > 0 ? "right" : "left"
	    }
	    
	    return y > 0 ? "up" : "down"
	};
	
	
	return new Mathf;
    }
);