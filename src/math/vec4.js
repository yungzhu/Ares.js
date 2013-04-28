if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"math/mathf"
    ],
    function( Mathf ){
        "use strict";
	
	var abs = Math.abs,
	    sqrt = Math.sqrt,
	    acos = Math.acos,
	    sin = Math.sin,
	    cos = Math.cos,
	    lerp = Mathf.lerp,
	    clamp = Mathf.clamp,
	    equals= Mathf.equals;
        
        
        function Vec4( x, y, z, w ){
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
            this.w = w !== undefined ? w : 1;
        }
        
        
        Vec4.prototype.clone = function(){
            
            return new Vec4( this.x, this.y, this.z, this.w );
        };
        
        
        Vec4.prototype.copy = function( other ){
            
            this.x = other.x;
            this.y = other.y;
            this.z = other.z;
            this.w = other.w;
            
            return this;
        };
        
        
        Vec4.prototype.set = function( x, y, z, w ){
            
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            
            return this;
        };
        
        
        Vec4.prototype.vadd = function( a, b ){
            
            this.x = a.x + b.x;
            this.y = a.y + b.y;
            this.z = a.z + b.z;
            this.w = a.w + b.w;
            
            return this;
        };
        
        
        Vec4.prototype.add = function( other ){
            
            return this.vadd( this, other );
        };
        
        
        Vec4.prototype.sadd = function( s ){
            
            this.x += s;
            this.y += s;
            this.z += s;
            this.w += s;
            
            return this;
        };
        
        
        Vec4.prototype.vsub = function( a, b ){
            
            this.x = a.x - b.x;
            this.y = a.y - b.y;
            this.z = a.z - b.z;
            this.w = a.w - b.w;
            
            return this;
        };
        
        
        Vec4.prototype.sub = function( other ){
            
            return this.vsub( this, other );
        };
        
        
        Vec4.prototype.ssub = function( s ){
            
            this.x -= s;
            this.y -= s;
            this.z -= s;
            this.w -= s;
            
            return this;
        };
        
        
        Vec4.prototype.vmul = function( a, b ){
            
            this.x = a.x * b.x;
            this.y = a.y * b.y;
            this.z = a.z * b.z;
            this.w = a.w * b.w;
            
            return this;
        };
        
        
        Vec4.prototype.mul = function( other ){
            
            return this.vmul( this, other );
        };
        
        
        Vec4.prototype.smul = function( s ){
            
            this.x *= s;
            this.y *= s;
            this.z *= s;
            this.w *= s;
            
            return this;
        };
        
        
        Vec4.prototype.vdiv = function( a, b ){
            var x = b.x, y = b.y, z = b.z;
            
            if( x !== 0 && y !== 0 ){
                this.x = a.x / x;
                this.y = a.y / y;
                this.z = a.z / z;
                this.w = a.w / w;
            }
            else{
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.w = 0;
            }
            
            return this;
        };
        
        
        Vec4.prototype.div = function( other ){
            
            return this.vdiv( this, other );
        };
        
        
        Vec4.prototype.sdiv = function( s ){
            
            if( s !== 0 ){
		s = 1 / s;
		
                this.x *= s;
                this.y *= s;
                this.z *= s;
                this.w *= s;
            }
            else{
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.w = 0;
            }
            
            return this;
        };
        
        
        Vec4.vdot = Vec4.prototype.vdot = function( a, b ){
            
            return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
        };
        
        
        Vec4.prototype.dot = function( other ){
            
            return this.vdot( this, other );
        };
        
        
        Vec4.prototype.vlerp = function( a, b, t ){
            
            this.x = lerp( a.x, b.x, t );
            this.y = lerp( a.y, b.y, t );
            this.z = lerp( a.z, b.z, t );
            this.w = lerp( a.w, b.w, t );
            
            return this;
        };
        
        
        Vec4.prototype.lerp = function( other, t ){
            
            return this.vlerp( this, other, t );
        };
	
        
        Vec4.prototype.vslerp = function(){
	    var start = new Vec4(),
		end = new Vec4(),
		vec = new Vec4(),
		relative = new Vec4();
	    
	    return function( a, b, t ){
		var dot = clamp( Vec4.vdot( a, b ), -1, 1 ),
		    theta = acos( dot ) * t;
		
		start.copy( a );
		end.copy( b );
		
		vec.copy( start );
		relative.vsub( end, vec.smul( dot ) );
		
		relative.norm();
		
		return this.vadd(
		    start.smul( cos( theta ) ),
		    relative.smul( sin( theta ) )
		);
	    };
        }();
        
        
        Vec4.prototype.slerp = function( other, t ){
            
            return this.vslerp( this, other, t );
        };
        
        
        Vec4.prototype.applyMat4 = function( m ){
            var x = this.x, y = this.y, z = this.z,
                me = m.elements;
                
            this.x = me[0] * x + me[4] * y + me[8] * z + me[12] * w;
	    this.y = me[1] * x + me[5] * y + me[9] * z + me[13] * w;
            this.z = me[2] * x + me[6] * y + me[10] * z + me[14] * w;
            this.w = me[3] * x + me[7] * y + me[11] * z + me[15] * w;
            
            return this;
        };
        
        
        Vec4.prototype.applyProjection = function( m ){
            var x = this.x, y = this.y, z = this.z,
                me = m.elements,
                d = 1 / ( me[3] * x + me[7] * y + me[11] * z + me[15] );
                
            this.x = ( me[0] * x + me[4] * y + me[8] * z + me[12] * w ) * d;
            this.y = ( me[1] * x + me[5] * y + me[9] * z + me[13] * w ) * d;
            this.z = ( me[2] * x + me[6] * y + me[10] * z + me[14] * w ) * d;
            this.w = ( me[3] * x + me[7] * y + me[11] * z + me[15] * w ) * d;
            
            return this;
        };
        
        
        Vec4.prototype.lenSq = function(){
            
            return this.dot( this );
        };
        
        
        Vec4.prototype.len = function(){
            
            return sqrt( this.lenSq() );
        };
        
        
        Vec4.prototype.norm = function(){
            
            return this.sdiv( this.len() );
        };
        
        
        Vec4.prototype.setLen = function( len ){
            
            return this.norm().smul( len );
        };
        
        
        Vec4.prototype.inverse = function(){
            
            return this.smul( -1 );
        };
        
        
        Vec4.prototype.abs = function(){
	    
	    this.x = abs( this.x );
	    this.y = abs( this.y );
	    this.z = abs( this.z );
	    this.w = abs( this.w );
            
            return this;
        };
        
        
        Vec4.prototype.min = function( other ){
            var x = other.x, y = other.y, z = other.z, w = other.w;
            
	    this.x = x < this.x ? x : this.x;
	    this.y = y < this.y ? y : this.y;
	    this.z = z < this.z ? z : this.z;
	    this.w = w < this.w ? w : this.w;
            
            return this;
        };
        
        
        Vec4.prototype.max = function( other ){
            var x = other.x, y = other.y, z = other.z, w = other.w;
            
	    this.x = x > this.x ? x : this.x;
	    this.y = y > this.y ? y : this.y;
	    this.z = z > this.z ? z : this.z;
	    this.w = w > this.w ? w : this.w;
            
            return this;
        };
        
        
        Vec4.prototype.clamp = function( min, max ){
	    
            this.x = clamp( this.x, min.x, max.x );
            this.y = clamp( this.y, min.y, max.y );
            this.z = clamp( this.z, min.y, max.z );
            this.w = clamp( this.w, min.w, max.w );
            
            return this;
        };
        
        
        Vec4.distSq = Vec4.prototype.distSq = function(){
	    var dist = new Vec4();
	    
	    return function( a, b ){
		
		return dist.vsub( a, b ).lenSq();
	    };
        }();
        
        
        Vec4.dist = Vec4.prototype.dist = function( a, b ){
            
            return sqrt( Vec4.distSq( a, b ) );
        };
        
        
        Vec4.prototype.toString = function(){
            
            return "Vec4( "+ this.x +", "+ this.y +", "+ this.z +", "+ this.w +" )";
        };
        
        Vec4.prototype.equals = function( other ){
            
            return Vec4.equals( this, other );
        };
        
        
        Vec4.equals = function( a, b ){
	    
            return (
                equals( a.x, b.x ) &&
                equals( a.y, b.y ) &&
                equals( a.z, b.z ) &&
                equals( a.w, b.w )
            );
        };
        
        
        return Vec4;
    }
);