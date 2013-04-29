if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
	"base/utils",
	"math/vec2",
	"math/mat3"
    ],
    function( Class, Utils, Vec2, Mat3 ){
        "use strict";
        
	
        function Transform2D( opts ){
            opts || ( opts = {} );
	    
            Class.call( this );
            
            this.root = this;
            
            this.children = [];
            
	    this.matrix = new Mat3;
            this.matrixWorld = new Mat3;
            this.matrixModelView = new Mat3;
            
	    this.position = opts.position instanceof Vec2 ? opts.position : new Vec2;
	    this.rotation = !!opts.rotation ? opts.rotation : 0;
	    this.scale = opts.scale instanceof Vec2 ? opts.scale : new Vec2( 1, 1 );
	    
	    this.updateMatrices();
        }
        
        Transform2D.prototype = Object.create( Class.prototype );
        Transform2D.prototype.constructor = Transform2D;
        
        
        Transform2D.prototype.clone = function(){
            var clone = new Transform2D;
	    clone.copy( this );
	    
            return clone;
        };
        
        
        Transform2D.prototype.copy = function( other ){
	    var children = other.children,
		child, c = 0, cl = other.children.length;
	    
            this.children.length = 0;
            
	    for( c; c < cl; c++ ){
		child = children[c];
		
		if( !!child ){
		    this.add( child.clone() );
		}
	    }
            
            this.root = other.root;
            
            this.position.copy( other.position );
            this.scale.copy( other.scale );
            this.rotation = other.rotation;
            
            this.updateMatrices();
            
            return this;
        };
        
        
        Transform2D.prototype.add = function(){
            var children = this.children,
                child, index, root,
                i, il;
            
            for( i = 0, il = arguments.length; i < il; i++ ){
                child = arguments[i];
                index = children.indexOf( child );
                
                if( index === -1 && child instanceof Transform2D ){
                    
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
                    this.trigger("addChild", child );
                }
            }
            
            return this;
        };
        
        
        Transform2D.prototype.remove = function(){
            var children = this.children,
                child, index,
                i, il;
            
            for( i = 0, il = arguments.length; i < il; i++ ){
                child = arguments[i];
                index = children.indexOf( child );
                
                if( index !== -1 ){
                    
                    children.splice( index, 1 );
                    
                    child.parent = undefined;
                
                    root = this;
                    
                    while( !!root.parent ){
                        root = root.parent;
                    }
                    child.root = root;
                    
                    child.trigger("remove" );
                    this.trigger("removeChild", child );
                }
            }
            
            return this;
        };
	
	
        Transform2D.prototype.localToWorld = function( v ){
	    
	    return v.applyMat3( this.matrixWorld );
	};
        
	
        Transform2D.prototype.worldToLocal = function(){
	    var mat = new Mat3;
	    
	    return function( v ){
		
		return v.applyMat3( mat.getInverse( this.matrixWorld ) );
	    };
	}();
	
	
	Transform2D.prototype.applyMat3 = function(){
	    var mat = new Mat3;
	    
	    return function( matrix ){
		
		this.matrix.mmul( matrix, this.matrix );
		
		this.scale.getScaleMat3( this.matrix );
		
		mat.identity().extractRotation( this.matrix );
		this.local.rotation = mat.getRotation();
		
		this.position.getPositionMat3( this.matrix );
	    };
        }();
        
	
        Transform2D.prototype.translate = function(){
	    var vec = new Vec2,
		mat = new Mat3;
	    
	    return function( translation, relativeTo ){
		vec.copy( translation );
		
		if( relativeTo instanceof Transform2D ){
		    mat.setRotationAngle( relativeTo.rotation );
		}
		else if( Utils.isNumber( relativeTo ) ){
		    mat.setRotationAngle( relativeTo );
		}
		
		if( !!relativeTo ){
		    vec.applyMat3( mat );
		}
		
		this.position.add( vec );
	    };
        }();
        
        
        Transform2D.prototype.rotate = function( angle ){
	    
	    this.rotation += angle;
        };
        
        
        Transform2D.prototype.scale = function(){
	    var vec = new Vec2(),
		mat = new Mat3();
	    
	    return function( scale, relativeTo ){
		vec.copy( scale );
		
		if( relativeTo instanceof Transform2D ){
		    mat.setRotationAngle( relativeTo.rotation );
		}
		else if( Utils.isNumber( relativeTo ) ){
		    mat.setRotationAngle( relativeTo );
		}
		
		if( !!relativeTo ){
		    vec.applyMat3( mat );
		}
		
		this.scale.add( vec );
	    }
        }();
        
        
        Transform2D.prototype.rotateAround = function(){
	    var point = new Vec2;
		
	    return function( point, angle ){
		
		point.copy( point ).sub( this.position );
		
		this.translate( point );
		this.rotate( angle );
		this.translate( point.inverse(), angle );
	    };
        }();
	
        
        Transform2D.prototype.lookAt = function(){
	    var vec = new Vec2,
		mat = new Mat3;
	    
	    return function( target ){
		
		if( target instanceof Transform2D ){
		    vec.copy( target.position );
		}
		else{
		    vec.copy( target );
		}
		
		mat.lookAt( this.position, vec );
		
		this.rotation = mat.getRotation();
	    };
        }();
	
	
	Transform2D.prototype.follow = function(){
	    var vec = new Vec2;
	    
	    return function( target, damping, relativeTo ){
		damping = damping > 0 ? damping : 1;
		
		if( target instanceof Transform3D ){
		    vec.sub( target.position, this.position );
		}
		else if( target instanceof Vec2 ){
		    vec.sub( target, this.position );
		}
		
		if( vec.lenSq() > 0.1 ){
		    this.translate( vec.smul( 1 / damping ), relativeTo );
		}
	    };
	}();
        
        
        Transform2D.prototype.updateMatrices = function(){
            var scale = this.scale,
		matrix = this.matrix,
		matrixWorld = this.matrixWorld;
	    
            matrix.setRotationAngle( this.rotation );
	    
	    if( scale.x !== 1 || scale.y !== 1 ){
                matrix.scale( scale );
            }
	    
            matrix.setPositionVec2( this.position );
            
            if( this.root === this ){
                matrixWorld.copy( matrix );
            }
            else{
                matrixWorld.mmul( this.parent.matrixWorld, matrix );
            }
        };
        
        
	return Transform2D;
    }
);