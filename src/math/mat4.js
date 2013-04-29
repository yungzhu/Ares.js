if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"math/mathf",
	"math/vec3",
	"math/quat"
    ],
    function( Mathf, Vec3, Quat ){
        "use strict";
        
	var cos = Math.cos,
	    sin = Math.sin,
	    abs = Math.abs,
	    tan = Math.tan,
	    equals = Mathf.equals;
	    
        
        function Mat4( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 ){
	    
            this.elements = new Float32Array(16);
            
	    this.set(
		m11 !== undefined ? m11 : 1, m12 || 0, m13 || 0, m14 || 0,
		m21 || 0, m22 !== undefined ? m22 : 1, m23 || 0, m34 || 0,
		m31 || 0, m32 || 0, m33 !== undefined ? m33 : 1, m34 || 0,
		m41 || 0, m42 || 0, m43 || 0, m44 !== undefined ? m44 : 1
	    );
        }
	
	
	Mat4.prototype.clone = function(){
	    var te = this.elements;
            
            return new Mat3(
                te[0], te[4], te[8], te[12],
		te[1], te[5], te[9], te[13],
		te[2], te[6], te[10], te[14],
		te[3], te[7], te[11], te[15]
            );
        };
	
	
	Mat4.prototype.copy = function( m ){
            var me = m.elements;
	    
            return this.set(
		me[0], me[4], me[8], me[12],
		me[1], me[5], me[9], me[13],
		me[2], me[6], me[10], me[14],
		me[3], me[7], me[11], me[15]
	    );
        };
	
        
        Mat4.prototype.set = function( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 ){
            var te = this.elements;
            
            te[0] = m11; te[4] = m12; te[8] = m13; te[12] = m14;
	    te[1] = m21; te[5] = m22; te[9] = m23; te[13] = m24;
	    te[2] = m31; te[6] = m32; te[10] = m33; te[14] = m34;
	    te[3] = m41; te[7] = m42; te[11] = m43; te[15] = m44;
            
            return this;
        };
	
	
	Mat4.prototype.identity = function(){
            
            this.set(
                1, 0, 0, 0,
                0, 1, 0, 0,
		0, 0, 1, 0,
                0, 0, 0, 1
            );
            
            return this;
        };
	
	
	Mat4.prototype.determinant = function(){
	    var te = this.elements,
		m11 = te[0], m12 = te[4], m13 = te[8], m14 = te[12],
		m21 = te[1], m22 = te[5], m23 = te[9], m24 = te[13],
		m31 = te[2], m32 = te[6], m33 = te[10], m34 = te[14],
		m41 = te[3], m42 = te[7], m43 = te[11], m44 = te[15];
		
	    return (
		m41 * (
		    + m14 * m23 * m32
		    - m13 * m24 * m32
		    - m14 * m22 * m33
		    + m12 * m24 * m33
		    + m13 * m22 * m34
		    - m12 * m23 * m34
		) +
		m42 * (
		    + m11 * m23 * m34
		    - m11 * m24 * m33
		    + m14 * m21 * m33
		    - m13 * m21 * m34
		    + m13 * m24 * m31
		    - m14 * m23 * m31
		) +
		m43 * (
		    + m11 * m24 * m32
		    - m11 * m22 * m34
		    - m14 * m21 * m32
		    + m12 * m21 * m34
		    + m14 * m22 * m31
		    - m12 * m24 * m31
		) +
		m44 * (
		    - m13 * m22 * m31
		    - m11 * m23 * m32
		    + m11 * m22 * m33
		    + m13 * m21 * m32
		    - m12 * m21 * m33
		    + m12 * m23 * m31
		)
	    );
        };
	
	
	Mat4.prototype.transpose = function(){
            var te = this.elements, tmp;
	    
	    tmp = te[1]; te[1] = te[4]; te[4] = tmp;
	    tmp = te[2]; te[2] = te[8]; te[8] = tmp;
	    tmp = te[6]; te[6] = te[9]; te[9] = tmp;
	    
	    tmp = te[3]; te[3] = te[12]; te[12] = tmp;
	    tmp = te[7]; te[7] = te[13]; te[13] = tmp;
	    tmp = te[11]; te[11] = te[14]; te[14] = tmp;
	    
	    return this;
        };
	
	
	Mat4.prototype.getInverse = function( m ){
            var te = this.elements,
		me = m.elements, det,
		m11 = me[0], m12 = me[4], m13 = me[8], m14 = me[12],
		m21 = me[1], m22 = me[5], m23 = me[9], m24 = me[13],
		m31 = me[2], m32 = me[6], m33 = me[10], m34 = me[14],
		m41 = me[3], m42 = me[7], m43 = me[11], m44 = me[15];
	    
	    te[0] = m23 * m34 * m42 - m24 * m33 * m42 + m24 * m32 * m43 - m22 * m34 * m43 - m23 * m32 * m44 + m22 * m33 * m44;
            te[1] = m24 * m33 * m41 - m23 * m34 * m41 - m24 * m31 * m43 + m21 * m34 * m43 + m23 * m31 * m44 - m21 * m33 * m44;
            te[2] = m22 * m34 * m41 - m24 * m32 * m41 + m24 * m31 * m42 - m21 * m34 * m42 - m22 * m31 * m44 + m21 * m32 * m44;
            te[3] = m23 * m32 * m41 - m22 * m33 * m41 - m23 * m31 * m42 + m21 * m33 * m42 + m22 * m31 * m43 - m21 * m32 * m43;
            
            te[4] = m14 * m33 * m42 - m13 * m34 * m42 - m14 * m32 * m43 + m12 * m34 * m43 + m13 * m32 * m44 - m12 * m33 * m44;
            te[5] = m13 * m34 * m41 - m14 * m33 * m41 + m14 * m31 * m43 - m11 * m34 * m43 - m13 * m31 * m44 + m11 * m33 * m44;
            te[6] = m14 * m32 * m41 - m12 * m34 * m41 - m14 * m31 * m42 + m11 * m34 * m42 + m12 * m31 * m44 - m11 * m32 * m44;
            te[7] = m12 * m33 * m41 - m13 * m32 * m41 + m13 * m31 * m42 - m11 * m33 * m42 - m12 * m31 * m43 + m11 * m32 * m43;
            
            te[8] = m13 * m24 * m42 - m14 * m23 * m42 + m14 * m22 * m43 - m12 * m24 * m43 - m13 * m22 * m44 + m12 * m23 * m44;
            te[9] = m14 * m23 * m41 - m13 * m24 * m41 - m14 * m21 * m43 + m11 * m24 * m43 + m13 * m21 * m44 - m11 * m23 * m44;
            te[10] = m12 * m24 * m41 - m14 * m22 * m41 + m14 * m21 * m42 - m11 * m24 * m42 - m12 * m21 * m44 + m11 * m22 * m44;
            te[11] = m13 * m22 * m41 - m12 * m23 * m41 - m13 * m21 * m42 + m11 * m23 * m42 + m12 * m21 * m43 - m11 * m22 * m43;
            
            te[12] = m14 * m23 * m32 - m13 * m24 * m32 - m14 * m22 * m33 + m12 * m24 * m33 + m13 * m22 * m34 - m12 * m23 * m34;
            te[13] = m13 * m24 * m31 - m14 * m23 * m31 + m14 * m21 * m33 - m11 * m24 * m33 - m13 * m21 * m34 + m11 * m23 * m34;
            te[14] = m14 * m22 * m31 - m12 * m24 * m31 - m14 * m21 * m32 + m11 * m24 * m32 + m12 * m21 * m34 - m11 * m22 * m34;
            te[15] = m12 * m23 * m31 - m13 * m22 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 + m11 * m22 * m33;
	    
	    det = m11 * te[0] + m21 * te[4] + m31 * te[8] + m41 * te[12];
	    
	    if( det == 0 ){
		this.identity();
	    }
	    else{
		this.smul( 1 / det );
	    }
	    
	    return this;
        };
	
	
	Mat4.prototype.inverse = function(){
	    
            return this.getInverse( this );
        };
	
	
	Mat4.prototype.mmul = function( a, b ){
	    var te = this.elements,
		ae = a.elements,
		be = b.elements,
                
		a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12],
		a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13],
		a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14],
		a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15],
                
		b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12],
		b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13],
		b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14],
		b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
            
	    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
            te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
            te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
            te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
            
            te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
            te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
            te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
            te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
            
            te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
            te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
            te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
            te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
            
            te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
            te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
            te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
            te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
            
            return this;
	};
	
	
	Mat4.prototype.mul = function( m ){
            
            return this.mmul( this, m );
        };
	
	
	Mat4.prototype.smul = function( s ){
	    var te = this.elements;
	    
	    te[0] *= s;
            te[1] *= s;
	    te[2] *= s;
            te[3] *= s;
	    te[4] *= s;
            te[5] *= s;
	    te[6] *= s;
            te[7] *= s;
	    te[8] *= s;
            te[9] *= s;
	    te[10] *= s;
            te[11] *= s;
	    te[12] *= s;
            te[13] *= s;
	    te[14] *= s;
            te[15] *= s;
	    
	    return this;
        };
	
	
	Mat4.prototype.abs = function(){
	    var te = this.elements;
	    
	    te[0] = abs( te[0] );
            te[1] = abs( te[1] );
	    te[2] = abs( te[2] );
            te[3] = abs( te[3] );
	    te[4] = abs( te[4] );
            te[5] = abs( te[5] );
	    te[6] = abs( te[6] );
            te[7] = abs( te[7] );
	    te[8] = abs( te[8] );
	    te[9] = abs( te[9] );
            te[10] = abs( te[10] );
	    te[11] = abs( te[11] );
            te[12] = abs( te[12] );
	    te[13] = abs( te[13] );
	    te[14] = abs( te[14] );
	    te[15] = abs( te[15] );
	    
	    return this;
        };
	
	
	Mat4.prototype.setRotationQuat = function( q ){
	    var te = this.elements,
		x = q.x, y = q.y, z = q.z, w = q.w,
		x2 = x + x, y2 = y + y, z2 = z + z,
		xx = x * x2, xy = x * y2, xz = x * z2,
		yy = y * y2, yz = y * z2, zz = z * z2,
		wx = w * x2, wy = w * y2, wz = w * z2;
		
	    te[0] = 1 - ( yy + zz );
	    te[4] = xy - wz;
	    te[8] = xz + wy;
	    
	    te[1] = xy + wz;
	    te[5] = 1 - ( xx + zz );
	    te[9] = yz - wx;
	    
	    te[2] = xz - wy;
	    te[6] = yz + wx;
	    te[10] = 1 - ( xx + yy );
	    
	    return this;
	};
	
	
	Mat4.prototype.setPositionVec2 = function( v ){
	    var te = this.elements;
	    
	    te[12] = v.x;
	    te[13] = v.y;
	    
	    return this;
	};
	
	
	Mat4.prototype.setPositionVec3 = function( v ){
	    var te = this.elements;
	    
	    te[12] = v.x;
	    te[13] = v.y;
	    te[14] = v.z;
	    
	    return this;
	};
	
	
	Mat4.prototype.lookAt = function(){
	    var defaultUp = new Vec3( 0, 0, 1 ),
		x = new Vec3,
		y = new Vec3,
		z = new Vec3;
	    
	    return function( eye, target, up ){
		up = up instanceof Vec3 ? up : defaultUp;
		
		var te = this.elements;
		
		z.vsub( eye, target ).norm();
		
		if( z.len() === 0 ){
		    z.z = 1;
		}
		
		x.vcross( up, z ).norm();
		
		if( x.len() === 0 ){
		    z.x += 0.0001;
		    x.vcross( up, z ).norm();
		}
		
		y.vcross( z, x );
		
		te[0] = x.x; te[4] = y.x; te[8] = z.x;
		te[1] = x.y; te[5] = y.y; te[9] = z.y;
		te[2] = x.z; te[6] = y.z; te[10] = z.z;
		
		return this;
	    };
	}();
	
	
	Mat4.prototype.extractPosition = function( m ){
	    var te = this.elements,
		me = m.elements;
		
	    te[12] = me[12];
	    te[13] = me[13];
	    te[14] = me[14];
	    
	    return this;
	};
	
	
	Mat4.prototype.extractRotation = function(){
	    var vec = new Vec3();
	    
	    return function( m ){
		var te = this.elements,
		    me = m.elements,
		    scaleX = 1 / vec.set( me[0], me[1], me[2] ).len(),
		    scaleY = 1 / vec.set( me[4], me[5], me[6] ).len(),
		    scaleZ = 1 / vec.set( me[8], me[9], me[10] ).len();
		    
		te[0] = me[0] * scaleX;
		te[1] = me[1] * scaleX;
		te[2] = me[2] * scaleX;
		
		te[4] = me[4] * scaleY;
		te[5] = me[5] * scaleY;
		te[6] = me[6] * scaleY;
		
		te[8] = me[8] * scaleZ;
		te[9] = me[9] * scaleZ;
		te[10] = me[10] * scaleZ;
		
		return this;
	    };
	}();
	
	
	Mat4.prototype.translate = function( v ){
	    var te = this.elements,
		x = v.x, y = v.y, z = v.z;
	    
	    te[12] = te[0] * x + te[4] * y + te[8] * z + te[12];
	    te[13] = te[1] * x + te[5] * y + te[9] * z + te[13];
	    te[14] = te[2] * x + te[6] * y + te[10] * z + te[14];
	    te[15] = te[3] * x + te[7] * y + te[11] * z + te[15];
	    
	    return this;
	};
	
	
	Mat4.prototype.rotateAxis = function( v ){
	    var te = this.elements,
		vx = v.x, vy = v.y, vz = v.z;
		
	    v.x = vx * te[0] + vy * te[4] + vz * te[8];
	    v.y = vx * te[1] + vy * te[5] + vz * te[9];
	    v.z = vx * te[2] + vy * te[6] + vz * te[10];
	    
	    v.norm();
	    
	    return v;
	};
	
	
	Mat4.prototype.rotateX = function( angle ){
	    var te = this.elements,
                m12 = te[4],
                m22 = te[5],
                m32 = te[6],
                m42 = te[7],
                m13 = te[8],
                m23 = te[9],
                m33 = te[10],
                m43 = te[11],
                c = cos( angle ),
                s = sin( angle );
            
            te[4] = c * m12 + s * m13;
            te[5] = c * m22 + s * m23;
            te[6] = c * m32 + s * m33;
            te[7] = c * m42 + s * m43;
            
            te[8] = c * m13 - s * m12;
            te[9] = c * m23 - s * m22;
            te[10] = c * m33 - s * m32;
            te[11] = c * m43 - s * m42;
            
            return this;
	};
        
        
        Mat4.prototype.rotateY = function( angle ){
	    var te = this.elements,
		m11 = te[0],
		m21 = te[1],
		m31 = te[2],
		m41 = te[3],
		m13 = te[8],
		m23 = te[9],
		m33 = te[10],
		m43 = te[11],
                c = cos( angle ),
                s = sin( angle );
                
            te[0] = c * m11 - s * m13;
            te[1] = c * m21 - s * m23;
            te[2] = c * m31 - s * m33;
            te[3] = c * m41 - s * m43;
            
            te[8] = c * m13 + s * m11;
            te[9] = c * m23 + s * m21;
            te[10] = c * m33 + s * m31;
            te[11] = c * m43 + s * m41;
            
            return this;
	};
        
        
        Mat4.prototype.rotateZ = function( angle ){
	    var te = this.elements,
		m11 = te[0],
		m21 = te[1],
		m31 = te[2],
		m41 = te[3],
		m12 = te[4],
		m22 = te[5],
		m32 = te[6],
		m42 = te[7],
                c = cos( angle ),
                s = sin( angle );
                
            te[0] = c * m11 + s * m12;
            te[1] = c * m21 + s * m22;
            te[2] = c * m31 + s * m32;
            te[3] = c * m41 + s * m42;
            
            te[4] = c * m12 - s * m11;
            te[5] = c * m22 - s * m21;
            te[6] = c * m32 - s * m31;
            te[7] = c * m42 - s * m41;
            
            return this;
	};
	
	
	Mat4.prototype.scale = function( v ){
	    var te = this.elements,
		x = v.x, y = v.y, z = v.z;
	    
	    te[0] *= x; te[4] *= y; te[8] *= z;
	    te[1] *= x; te[5] *= y; te[9] *= z;
	    te[2] *= x; te[6] *= y; te[10] *= z;
	    te[3] *= x; te[7] *= y; te[11] *= z;
	    
	    return this;
        };
	
	
	Mat4.prototype.makeTranslation = function( x, y, z ){
	    
	    this.set(
		1, 0, 0, x,
		0, 1, 0, y,
		0, 0, 1, z,
                0, 0, 0, 1
	    );
	    
	    return this;
	};
        
        
        Mat4.prototype.makeRotationX = function( angle ){
	    var c = cos( angle ),
                s = sin( angle );
	    
	    this.set(
		1, 0, 0, 0,
                0, c, -s, 0,
                0, s, c, 0,
                0, 0, 0, 1
	    );
	    
	    return this;
	};
        
        
        Mat4.prototype.makeRotationY = function( angle ){
	    var c = cos( angle ),
                s = sin( angle );
	    
	    this.set(
		c, 0, s, 0,
                0, 1, 0, 0,
                -s, 0, c, 0,
                0, 0, 0, 1
	    );
	    
	    return this;
	};
	
	
	Mat4.prototype.makeRotationZ = function( angle ){
	    var c = cos( angle ),
                s = sin( angle );
	    
	    this.set(
		c, -s, 0, 0,
		s, c, 0, 0,
		0, 0, 1, 0,
                0, 0, 0, 1
	    );
	    
	    return this;
	};
	
	
	Mat4.prototype.makeRotationAxis = function( axis, angle ){
	    var c = cos( angle ),
		s = sin( angle ),
		t = 1 - c,
		x = axis.x, y = axis.y, z = axis.z,
		tx = t * x, ty = t * y;
	    
	    this.set(
		tx * x + c, tx * y - s * z, tx * z + s * y, 0,
		tx * y + s * z, ty * y + c, ty * z - s * x, 0,
		tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
		0, 0, 0, 1
	    );
	    
	    return this;
	};
	
	
	Mat4.prototype.makeScale = function( x, y, z ){
	    
	    this.set(
		x, 0, 0, 0,
		0, y, 0, 0,
		0, 0, z, 0,
                0, 0, 0, 1
	    );
	    
	    return this;
	};
        
        
        Mat4.prototype.makeFrustum = function( left, right, bottom, top, near, far ){
	    var te = this.elements,
		x = 2 * near / ( right - left ),
		y = 2 * near / ( top - bottom ),
		a = ( right + left ) / ( right - left ),
                b = ( top + bottom ) / ( top - bottom ),
                c = -( far + near ) / ( far - near ),
                d = - 2 * far * near / ( far - near );
	    
	    this.set(
		x, 0, a, 0,
		0, y, b, 0,
		0, 0, c, d,
                0, 0, -1, 0
            );
            
            return this;
        };
        
        
        Mat4.prototype.makePerspective = function( fov, aspect, near, far ){
	    var ymax = near * tan( fov * 0.008726646259971648 ),
		ymin = -ymax,
		xmin = ymin * aspect,
		xmax = ymax * aspect;
	    
	    return this.makeFrustum( xmin, xmax, ymin, ymax, near, far );
	};
	
	
	Mat4.prototype.makeOrthographic = function( left, right, top, bottom, near, far ){
	    var te = this.elements,
		w = 1 / ( right - left ),
		h = 1 / ( top - bottom ),
                p = 1 / ( far - near ),
		
		x = ( right + left ) * w,
		y = ( top + bottom ) * h,
                z = ( far + near ) * p;
	    
	    this.set(
		2 * w, 0, 0, -x,
		0, 2 * h, 0, -y,
		0, 0, -2 * p, -z,
                0, 0, 0, 1
	    );
            
            return this;
        };
	
	
	Mat4.prototype.toString = function(){
	    var te = this.elements;
	    
            return (
		"Mat4["+ te[0] +", "+ te[4] +", "+ te[8] +", "+ te[12] +"]\n" +
		"     ["+ te[1] +", "+ te[5] +", "+ te[9] +", "+ te[13] +"]\n" +
		"     ["+ te[2] +", "+ te[6] +", "+ te[10] +", "+ te[14] +"]\n" +
		"     ["+ te[3] +", "+ te[7] +", "+ te[11] +", "+ te[15] +"]"
	    );
	};
        
        
        Mat4.prototype.equals = function( other ){
            
            return Mat3.equals( this, other );
        };
	
        
	Mat4.equals = function( a, b ){
	    var ae = a.elements,
		be = b.elements;
	    
            return (
		equals( ae[0], be[0] ) &&
		equals( ae[1], be[1] ) &&
		equals( ae[2], be[2] ) &&
		equals( ae[3], be[3] ) &&
		equals( ae[4], be[4] ) &&
		equals( ae[5], be[5] ) &&
		equals( ae[6], be[6] ) &&
		equals( ae[7], be[7] ) &&
		equals( ae[8], be[8] ) &&
		equals( ae[9], be[9] ) &&
		equals( ae[10], be[10] ) &&
		equals( ae[11], be[11] ) &&
		equals( ae[12], be[12] ) &&
		equals( ae[13], be[13] ) &&
		equals( ae[14], be[14] ) &&
		equals( ae[15], be[15] )
	    );
        };
        
        
        return Mat4;
    }
);