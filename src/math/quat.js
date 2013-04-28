if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"math/mathf",
	"math/vec3"
    ],
    function( Mathf, Vec3 ){
        "use strict";
	
	var abs = Math.abs,
	    sqrt = Math.sqrt,
	    acos = Math.acos,
	    cos = Math.cos,
	    sin = Math.sin,
	    lerp = Mathf.lerp,
	    clamp = Mathf.clamp,
	    equals= Mathf.equals;
        
        
        function Quat( x, y, z, w ){
	    
	    this.x = x || 0;
	    this.y = y || 0;
	    this.z = z || 0;
	    this.w = w !== undefined ? w : 1;
        }
        
        
        Quat.prototype.clone = function(){
            
            return new Quat( this.x, this.y, this.z, this.w );
        };
        
        
        Quat.prototype.copy = function( other ){
            
            this.x = other.x;
            this.y = other.y;
            this.z = other.z;
            this.w = other.w;
            
            return this;
        };
        
        
        Quat.prototype.set = function( x, y, z, w ){
            
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            
            return this;
        };
        
        
        Quat.prototype.qadd = function( a, b ){
            
            this.x = a.x + b.x;
            this.y = a.y + b.y;
            this.z = a.z + b.z;
            this.w = a.w + b.w;
            
            return this;
        };
        
        
        Quat.prototype.add = function( other ){
            
            return this.qadd( this, other );
        };
        
        
        Quat.prototype.sadd = function( s ){
            
            this.x += s;
            this.y += s;
            this.z += s;
            this.w += s;
            
            return this;
        };
        
        
        Quat.prototype.qsub = function( a, b ){
            
            this.x = a.x - b.x;
            this.y = a.y - b.y;
            this.z = a.z - b.z;
            this.w = a.w - b.w;
            
            return this;
        };
        
        
        Quat.prototype.sub = function( other ){
            
            return this.qsub( this, other );
        };
        
        
        Quat.prototype.ssub = function( s ){
            
            this.x -= s;
            this.y -= s;
            this.z -= s;
            this.w -= s;
            
            return this;
        };
        
        
        Quat.prototype.qmul = function( a, b ){
            var ax = a.x, ay = a.y, az = a.z, aw = a.w,
                bx = b.x, by = b.y, bz = b.z, bw = b.w;
                
            this.x = ax * bw + aw * bx + ay * bz - az * by;
            this.y = ay * bw + aw * by + az * bx - ax * bz;
            this.z = az * bw + aw * bz + ax * by - ay * bx;
            this.w = aw * bw - ax * bx - ay * by - az * bz;
            
            return this;
        };
        
        
        Quat.prototype.mul = function( other ){
            
            return this.qmul( this, other );
        };
        
        
        Quat.prototype.smul = function( s ){
            
            this.x *= s;
            this.y *= s;
            this.z *= s;
            this.w *= s;
            
            return this;
        };
        
        
        Quat.prototype.sdiv = function( s ){
            
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
        
        
        Quat.qdot = Quat.prototype.qdot = function( a, b ){
            
            return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
        };
        
        
        Quat.prototype.dot = function( other ){
	    
            return this.qdot( this, other );
        };
        
        
        Quat.prototype.qlerp = function( a, b, t ){
	    
            this.x = lerp( a.x, b.x, t );
            this.y = lerp( a.y, b.y, t );
            this.z = lerp( a.z, b.z, t );
            this.w = lerp( a.w, b.w, t );
            
            return this;
        };
        
        
        Quat.prototype.lerp = function( other, t ){
            
            return this.qlerp( this, other, t );
        };
        
        
        Quat.prototype.qslerp = function(){
	    var start = new Quat(),
		end = new Quat(),
		quat = new Quat(),
		relative = new Quat();
	    
	    return function( a, b, t ){
		var dot = clamp( Quat.qdot( a, b ), -1, 1 ),
		    theta = acos( dot ) * t;
		
		start.copy( a );
		end.copy( b );
		
		quat.copy( start );
		relative.qsub( end, quat.smul( dot ) );
		
		relative.norm();
		
		return this.qadd(
		    start.smul( cos( theta ) ),
		    relative.smul( sin( theta ) )
		);
	    };
        }();
        
        
        Quat.prototype.slerp = function( other, t ){
            
            return this.qslerp( this, other, t );
        };
        
        
        Quat.prototype.lenSq = function(){
            
            return this.dot( this );
        };
        
        
        Quat.prototype.len = function(){
	    
            return sqrt( this.lenSq() );
        };
        
        
        Quat.prototype.norm = function(){
            
            return this.sdiv( this.len() );
        };
        
        
        Quat.prototype.inverse = function( q ){
            
            return this.inverse().norm();
        };
        
        
        Quat.prototype.calculateW = function(){
            var x = this.x, y = this.y, z = this.z;
            
            this.w = -sqrt( abs( 1.0 - x * x - y * y - z * z ) );
            
            return this;
        };
        
        
        Quat.prototype.axisAngle = function( axis, angle ){
            var halfAngle = angle * 0.5,
                s = sin( halfAngle );
                
            this.x = axis.x * s;
            this.y = axis.y * s;
            this.z = axis.z * s;
            this.w = cos( halfAngle );
	    
            return this;
        };
        
        
        Quat.prototype.getRotationMat4 = function( m ){
            var te = m.elements,
                m11 = te[0], m12 = te[4], m13 = te[8],
                m21 = te[1], m22 = te[5], m23 = te[9],
                m31 = te[2], m32 = te[6], m33 = te[10],
                trace = m11 + m22 + m33,
                s;
                
            if( trace > 0 ){
                s = 0.5 / sqrt( trace + 1.0 );
                
                this.w = 0.25 / s;
                this.x = ( m32 - m23 ) * s;
                this.y = ( m13 - m31 ) * s;
                this.z = ( m21 - m12 ) * s;
            }
            else if( m11 > m22 && m11 > m33 ){
                s = 2.0 * sqrt( 1.0 + m11 - m22 - m33 );
                
                this.w = (m32 - m23 ) / s;
                this.x = 0.25 * s;
                this.y = (m12 + m21 ) / s;
                this.z = (m13 + m31 ) / s;
            }
            else if( m22 > m33 ){
                s = 2.0 * sqrt( 1.0 + m22 - m11 - m33 );
                
                this.w = (m13 - m31 ) / s;
                this.x = (m12 + m21 ) / s;
                this.y = 0.25 * s;
                this.z = (m23 + m32 ) / s;
            }
            else{
                s = 2.0 * sqrt( 1.0 + m33 - m11 - m22 );
                
                this.w = ( m21 - m12 ) / s;
                this.x = ( m13 + m31 ) / s;
                this.y = ( m23 + m32 ) / s;
                this.z = 0.25 * s;
            }
            
            return this;
        };
        
        
        Quat.prototype.rotateX = function( angle ){
            angle /= 2;
	    
            var x = this.x, y = this.y, z = this.z, w = this.w,
                s = sin( angle ), c = cos( angle );
                
            this.x = x * c + w * s;
            this.y = y * c + z * s;
            this.z = z * c - y * s;
            this.w = w * c - x * s;
            
            return this;
        };
        
        
        Quat.prototype.rotateY = function( angle ){
            angle /= 2;
            
            var x = this.x, y = this.y, z = this.z, w = this.w,
                s = sin( angle ), c = cos( angle );
                
            this.x = x * c - z * s;
            this.y = y * c + w * s;
            this.z = z * c + x * s;
            this.w = w * c - y * s;
            
            return this;
        };
        
        
        Quat.prototype.rotateZ = function( angle ){
            angle /= 2;
            
            var x = this.x, y = this.y, z = this.z, w = this.w,
                s = sin( angle ), c = cos( angle );
                
            this.x = x * c + y * s;
            this.y = y * c - x * s;
            this.z = z * c + w * s;
            this.w = w * c - z * s;
            
            return this;
        };
        
        
        Quat.prototype.rotate = function( x, y, z ){
            
	    this.rotateZ( z );
            this.rotateX( x );
            this.rotateY( y );
	    
	    return this;
        };
        
        
        Quat.distSq = Quat.prototype.distSq = function(){
	    var dist = new Quat();
	    
	    return function( a, b ){
		
		return dist.qsub( a, b ).lenSq();
	    };
        }();
        
        
        Quat.dist = Quat.prototype.dist = function( a, b ){
            
            return sqrt( this.distSq( a, b ) );
        };
        
        
        Quat.prototype.toString = function(){
            
            return "Quat( "+ this.x +", "+ this.y +", "+ this.z +", "+ this.w +" )";
        };
        
        Quat.prototype.equals = function( other ){
            
            return Quat.equals( this, other );
        };
        
        
        Quat.equals = function( a, b ){
	    
            return (
                equals( a.x, b.x ) &&
                equals( a.y, b.y ) &&
                equals( a.z, b.z ) &&
                equals( a.w, b.w )
            );
        };
        
        
        return Quat;
    }
);