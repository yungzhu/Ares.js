if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
	"base/utils",
	"math/vec3",
	"math/quat",
	"math/mat3",
	"math/mat4",
    ],
    function( Class, Utils, Vec3, Quat, Mat3, Mat4 ){
        "use strict";
        
	
        function Transform3D( opts ){
	    opts || ( opts = {} );
	    
            Class.call( this );
            
            this.parent = undefined;
	    
            this.root = this;
            
            this.children = [];
            
            this.matrix = new Mat4;
            this.matrixWorld = new Mat4;
            this.matrixModelView = new Mat4;
            this.matrixNormal = new Mat3;
            
	    this.position = opts.position instanceof Vec3 ? opts.position : new Vec3;
	    this.rotation = opts.rotation instanceof Quat ? opts.rotation : new Quat;
	    this.scale = opts.scale instanceof Vec3 ? opts.scale : new Vec3( 1, 1, 1 );
	    
	    this.updateMatrices();
        }
        
        Transform3D.prototype = Object.create( Class.prototype );
        Transform3D.prototype.constructor = Transform3D;
        
        
        Transform3D.prototype.clone = function(){
            var clone = new Transform3D();
	    clone.copy( this );
	    
            return clone;
        };
        
        
        Transform3D.prototype.copy = function( other ){
	    var children = other.children,
		child, i, il;
	    
            this.children.length = 0;
            
	    for( i = 0, il = other.children.length; i < il; i++ ){
		child = children[i];
		
		if( !!child ){
		    this.add( child.clone() );
		}
	    }
	    
            this.root = other.root;
            
            this.position.copy( other.position );
            this.scale.copy( other.scale );
            this.rotation.copy( other.rotation );
            
            this.updateMatrices();
            
            return this;
        };
        
        
        Transform3D.prototype.add = function(){
            var children = this.children,
                child, index, root,
                i, il;
            
            for( i = 0, il = arguments.length; i < il; i++ ){
                child = arguments[i];
                index = children.indexOf( child );
                
                if( index === -1 && child instanceof Transform3D ){
                    
                    if( child.parent ){
                        child.parent.remove( child );
                    }
                    child.parent = this;
                    
                    children.push( child );
                
                    root = this;
                    
                    while( !!root.parent ){
                        root = root.parent;
                    }
                    child.root = root;
                    
		    child.trigger("add");
                    this.trigger( "addChild", child );
                }
            }
        };
        
        
        Transform3D.prototype.remove = function(){
            var children = this.children,
                child, index,
                i, il;
            
            for( i = 0, il = arguments.length; i < il; i++ ){
                child = arguments[i];
                index = children.indexOf( child );
                
                if( index !== -1 ){
                    
                    children.splice( index, 1 );
                    
		    if( child.parent ){
                        child.parent.remove( child );
                    }
                    child.parent = undefined;
                
                    root = this;
                    
                    while( !!root.parent ){
                        root = root.parent;
                    }
                    child.root = root;
                    
		    
		    child.trigger("remove");
                    this.trigger( "removeChild", child );
                }
            }
        };
	
	
        Transform3D.prototype.localToWorld = function( v ){
	    
	    return v.applyMat4( this.matrixWorld );
	};
        
	
        Transform3D.prototype.worldToLocal = function(){
	    var mat = new Mat4;
	    
	    return function( v ){
		
		return v.applyMat4( mat.getInverse( this.matrixWorld ) );
	    };
	}();
        
        
        Transform3D.prototype.applyMat4 = function(){
	    var mat = new Mat4;
	    
	    return function( matrix ){
		
		this.matrix.mmul( matrix, this.matrix );
		
		this.scale.getScaleMat4( this.matrix );
		
		mat.identity().extractRotation( this.matrix );
		this.rotation.getRotationMat4( mat );
		
		this.position.getPositionMat4( this.matrix );
	    };
        }();
        
	
        Transform3D.prototype.translate = function(){
	    var vec = new Vec3,
		quat = new Quat;
	    
	    return function( translation, relativeTo ){
		vec.copy( translation );
		
		if( relativeTo instanceof Transform3D ){
		    vec.applyQuat( relativeTo.rotation );
		}
		else if( relativeTo instanceof Quat ){
		    vec.applyQuat( relativeTo );
		}
		
		this.position.add( vec );
	    };
        }();
        
        
        Transform3D.prototype.rotate = function(){
	    var vec = new Vec3,
		quat = new Quat;
	    
	    return function( rotation, relativeTo ){
		vec.copy( rotation );
		
		if( relativeTo instanceof Transform3D ){
		    vec.applyQuat( relativeTo.rotation );
		}
		else if( relativeTo instanceof Quat ){
		    vec.applyQuat( relativeTo );
		}
		
		this.rotation.rotate( vec.x, vec.y, vec.z );
	    };
        }();
        
        
        Transform3D.prototype.rotateAround = function(){
	    var point = new Vec3,
		quat = new Quat;
		
	    return function( point, axis, angle ){
		
		point.copy( point ).sub( this.position );
		quat.axisAngle( axis, angle );
		
		this.translate( point );
		this.rotation.mul( quat );
		this.translate( point.inverse(), quat );
	    };
        }();
	
        
        Transform3D.prototype.lookAt = function(){
	    var vec = new Vec3,
		mat = new Mat4,
		quat = new Quat;
	    
	    return function( target, up ){
		up = up instanceof Vec3 ? up : undefined;
		
		if( target instanceof Transform3D ){
		    vec.copy( target.position );
		}
		else if( target instanceof Vec3 ){
		    vec.copy( target );
		}
		
		mat.lookAt( this.position, vec, up );
		
		this.rotation.getRotationMat4( mat );
	    };
        }();
	
	
	Transform3D.prototype.follow = function(){
	    var vec = new Vec3;
	    
	    return function( target, damping, relativeTo ){
		damping = damping > 0 ? damping : 1;
		
		if( target instanceof Transform3D ){
		    vec.sub( target.position, this.position );
		}
		else if( target instanceof Vec3 ){
		    vec.sub( target, this.position );
		}
		
		if( vec.lenSq() > 0.1 ){
		    this.translate( vec.smul( 1 / damping ), relativeTo );
		}
	    };
	}();
        
        
        Transform3D.prototype.updateMatrices = function(){
            var scale = this.scale,
		matrix = this.matrix,
		matrixWorld = this.matrixWorld;
	    
            matrix.setRotationQuat( this.rotation );
	    
	    if( scale.x !== 1 || scale.y !== 1 || scale.z !== 1 ){
                matrix.scale( scale );
            }
	    
            matrix.setPositionVec3( this.position );
            
            if( this.root === this ){
                matrixWorld.copy( matrix );
            }
            else{
                matrixWorld.mmul( this.parent.matrixWorld, matrix );
            }
        };
        
        
	return Transform3D;
    }
);