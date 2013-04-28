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
	    lerp = Mathf.lerp,
	    acos = Math.acos,
	    sin = Math.sin,
	    cos = Math.cos,
	    clamp = Mathf.clamp,
	    equals= Mathf.equals;
	    
	
	function Vec3( x, y, z ){
	    this.x = x || 0;
	    this.y = y || 0;
	    this.z = z || 0;
	}
        
        
        Vec3.prototype.clone = function(){
            
            return new Vec3( this.x, this.y, this.z );
        };
        
        
        Vec3.prototype.copy = function( other ){
            
            this.x = other.x;
            this.y = other.y;
            this.z = other.z;
            
            return this;
        };
        
        
        Vec3.prototype.set = function( x, y, z ){
            
            this.x = x;
            this.y = y;
            this.z = z;
            
            return this;
        };
        
        
        Vec3.prototype.vadd = function( a, b ){
            
            this.x = a.x + b.x;
            this.y = a.y + b.y;
            this.z = a.z + b.z;
            
            return this;
        };
        
        
        Vec3.prototype.add = function( other ){
            
            return this.vadd( this, other );
        };
        
        
        Vec3.prototype.sadd = function( s ){
            
            this.x += s;
            this.y += s;
            this.z += s;
            
            return this;
        };
        
        
        Vec3.prototype.vsub = function( a, b ){
            
            this.x = a.x - b.x;
            this.y = a.y - b.y;
            this.z = a.z - b.z;
            
            return this;
        };
        
        
        Vec3.prototype.sub = function( other ){
            
            return this.vsub( this, other );
        };
        
        
        Vec3.prototype.ssub = function( s ){
            
            this.x -= s;
            this.y -= s;
            this.z -= s;
            
            return this;
        };
        
        
        Vec3.prototype.vmul = function( a, b ){
            
            this.x = a.x * b.x;
            this.y = a.y * b.y;
            this.z = a.z * b.z;
            
            return this;
        };
        
        
        Vec3.prototype.mul = function( other ){
            
            return this.vmul( this, other );
        };
        
        
        Vec3.prototype.smul = function( s ){
            
            this.x *= s;
            this.y *= s;
            this.z *= s;
            
            return this;
        };
        
        
        Vec3.prototype.vdiv = function( a, b ){
            var x = b.x, y = b.y, z = b.z;
            
            if( x !== 0 && y !== 0 ){
                this.x = a.x / x;
                this.y = a.y / y;
                this.z = a.z / z;
            }
            else{
                this.x = 0;
                this.y = 0;
                this.z = 0;
            }
            
            return this;
        };
        
        
        Vec3.prototype.div = function( other ){
            
            return this.vdiv( this, other );
        };
        
        
        Vec3.prototype.sdiv = function( s ){
            
            if( s !== 0 ){
		s = 1 / s;
		
                this.x *= s;
                this.y *= s;
                this.z *= s;
            }
            else{
                this.x = 0;
                this.y = 0;
                this.z = 0;
            }
            
            return this;
        };
        
        
        Vec3.vdot = Vec3.prototype.vdot = function( a, b ){
            
            return a.x * b.x + a.y * b.y + a.z * b.z;
        };
        
        
        Vec3.prototype.dot = function( other ){
            
            return this.vdot( this, other );
        };
        
        
        Vec3.prototype.vlerp = function( a, b, t ){
            
            this.x = lerp( a.x, b.x, t );
            this.y = lerp( a.y, b.y, t );
            this.z = lerp( a.z, b.z, t );
            
            return this;
        };
        
        
        Vec3.prototype.lerp = function( other, t ){
            
            return this.vlerp( this, other, t );
        };
        
        
        Vec3.prototype.vslerp = function(){
	    var start = new Vec3(),
		end = new Vec3(),
		vec = new Vec3(),
		relative = new Vec3();
	    
	    return function( a, b, t ){
		var dot = clamp( Vec3.vdot( a, b ), -1, 1 ),
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
        
        
        Vec3.prototype.slerp = function( other, t ){
            
            return this.vslerp( this, other, t );
        };
        
        
        Vec3.prototype.applyMat3 = function( m ){
            var x = this.x, y = this.y, z = this.z,
                me = m.elements;
                
            this.x = me[0] * x + me[3] * y + me[6] + z;
            this.y = me[1] * x + me[4] * y + me[7] + z;
            this.z = me[2] * x + me[5] * y + me[8] + z;
            
            return this;
        };
        
        
        Vec3.prototype.applyMat4 = function( m ){
            var x = this.x, y = this.y, z = this.z,
                me = m.elements;
                
            this.x = me[0] * x + me[4] * y + me[8] + z * me[12];
	    this.y = me[1] * x + me[5] * y + me[9] + z * me[13];
	    this.z = me[2] * x + me[6] * y + me[10] + z * me[14];
            
            return this;
        };
        
        
        Vec3.prototype.applyQuat = function( q ){
            var x = this.x,
		y = this.y,
		z = this.z,
		
		qx = q.x,
		qy = q.y,
		qz = q.z,
		qw = q.w,
		
		ix =  qw * x + qy * z - qz * y,
		iy =  qw * y + qz * x - qx * z,
		iz =  qw * z + qx * y - qy * x,
		iw = -qx * x - qy * y - qz * z;
		
	    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	    
	    return this;
        };
        
        
        Vec3.prototype.applyProjection = function( m ){
            var x = this.x, y = this.y, z = this.z,
                me = m.elements,
                d = 1 / ( me[3] * x + me[7] * y + me[11] * z + me[15] );
	    
            this.x = ( me[0] * x + me[4] * y + me[8] * z + me[12] ) * d;
            this.y = ( me[1] * x + me[5] * y + me[9] * z + me[13] ) * d;
            this.z = ( me[2] * x + me[6] * y + me[10] * z + me[14] ) * d;
            
            return this;
        };
        
        
        Vec3.prototype.getPositionMat3 = function( m ){
            var me = m.elements;
            
            this.x = me[6];
            this.y = me[7];
            
            return this;
        };
        
        
        Vec3.prototype.getPositionMat4 = function( m ){
            var me = m.elements;
            
            this.x = me[12];
            this.y = me[13];
            this.z = me[14];
            
            return this;
        };
        
        
        Vec3.prototype.getScaleMat3 = function( m ){
            var me = m.elements,
                sx = this.set( me[0], me[1] ).len(),
                sy = this.set( me[3], me[4] ).len();
            
            this.x = sx;
            this.y = sy;
	    this.z = 1;
            
            return this;
        };
        
        
        Vec3.prototype.getScaleMat4 = function( m ){
            var me = m.elements,
                sx = this.set( me[0], me[1], me[2] ).len(),
                sy = this.set( me[4], me[5], me[6] ).len(),
                sz = this.set( me[8], me[9], me[10] ).len();
            
            this.x = sx;
            this.y = sy;
            this.z = sz;
            
            return this;
        };
        
        
        Vec3.prototype.lenSq = function(){
            
            return this.dot( this );
        };
        
        
        Vec3.prototype.len = function(){
            
            return sqrt( this.lenSq() );
        };
        
        
        Vec3.prototype.norm = function(){
            
            return this.sdiv( this.len() );
        };
        
        
        Vec3.prototype.setLen = function( len ){
            
            return this.norm().smul( len );
        };
        
        
        Vec3.prototype.inverse = function(){
            
            return this.smul( -1 );
        };
        
        
        Vec3.prototype.abs = function(){
	    
	    this.x = abs( this.x );
	    this.y = abs( this.y );
	    this.z = abs( this.z );
            
            return this;
        };
        
        
        Vec3.prototype.min = function( other ){
            var x = other.x, y = other.y, z = other.z;
            
	    this.x = x < this.x ? x : this.x;
	    this.y = y < this.y ? y : this.y;
	    this.z = z < this.z ? z : this.z;
            
            return this;
        };
        
        
        Vec3.prototype.max = function( other ){
            var x = other.x, y = other.y, z = other.z;
            
	    this.x = x > this.x ? x : this.x;
	    this.y = y > this.y ? y : this.y;
	    this.z = z > this.z ? z : this.z;
            
            return this;
        };
	
        
        Vec3.prototype.clamp = function( min, max ){
            
            this.x = clamp( this.x, min.x, max.x );
            this.y = clamp( this.y, min.y, max.y );
            this.z = clamp( this.z, min.z, max.z );
            
            return this;
        };
        
        
        Vec3.distSq = Vec3.prototype.distSq = function(){
	    var dist = new Vec3();
	    
	    return function( a, b ){
		
		return dist.vsub( a, b ).lenSq();
	    };
        }();
        
        
        Vec3.dist = Vec3.prototype.dist = function( a, b ){
            
            return sqrt( Vec3.distSq( a, b ) );
        };
        
        
        Vec3.prototype.toString = function(){
            
            return "Vec3( "+ this.x +", "+ this.y +", "+ this.z +")";
        };
	
        
        Vec3.prototype.equals = function( other ){
            
            return Vec3.equals( this, other );
        };
        
        
        Vec3.equals = function( a, b ){
	    
            return (
                equals( a.x, b.x ) &&
                equals( a.y, b.y ) &&
                equals( a.z, b.z )
            );
        };
	
	
	return Vec3;
    }
);