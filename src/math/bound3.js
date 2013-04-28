if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"math/vec3"
    ],
    function( Vec3 ){
        "use strict";
	
	var vec3Equals = Vec3.equals;
        
        
        function Bound3( center, size ){
            
            this.center = center instanceof Vec3 ? center : new Vec3();
            this.size = size instanceof Vec3 ? size : new Vec3();
            
            this.extents = new Vec3().copy( this.size ).smul( 0.5 );
            
            this.min = new Vec3().vsub( this.center, this.extents );
            this.max = new Vec3().vadd( this.center, this.extents );
	}
        
        
        Bound3.prototype.clone = function(){
            var clone = new Bound3();
            clone.copy( this );
            
            return clone;
	};
        
        
        Bound3.prototype.copy = function( other ){
            
            this.center.copy( other.center );
            this.size.copy( other.size );
            
            this.extents.copy( other.extents );
            
            this.min.copy( other.min );
            this.max.copy( other.max );
            
            return this;
	};
        
        
        Bound3.prototype.set = function( center, size ){
            
            this.center.copy( center instanceof Vec3 ? center : this.center );
            this.size.copy( size instanceof Vec3 ? size : this.size );
            
            this.extents.copy( this.size ).smul( 0.5 );
            
            this.min.vsub( this.center, this.extents );
            this.max.vadd( this.center, this.extents );
            
            return this;
        };
        
        
        Bound3.prototype.setMinMax = function( min, max ){
            
            this.min.copy( min instanceof Vec3 ? min : this.min );
            this.max.copy( max instanceof Vec3 ? max : this.max );
            
            this.center.vadd( this.max, this.min ).smul( 0.5 );
            this.size.vsub( this.max, this.min );
            
            this.extents.copy( this.size ).smul( 0.5 );
            
            return this;
        };
        
        
        Bound3.prototype.setFromPoints = function( points ){
            var point, i = 1, il = points.length;
            
            if ( il > 0 ){
                point = points[0];
                
                this.min.copy( point );
                this.max.copy( point );
                
                for( i; i < il; i++ ){
                    
                    point = points[i];
                    
                    if( point.x < this.min.x ){
                        this.min.x = point.x;
                    }
                    else if ( point.x > this.max.x ){
                        this.max.x = point.x;
                    }
                    
                    if( point.y < this.min.y ){
                        this.min.y = point.y;
                    }
                    else if( point.y > this.max.y ){
                        this.max.y = point.y;
                    }
                    
                    if ( point.z < this.min.z ){
                        this.min.z = point.z;
                    }
                    else if( point.z > this.max.z ){
                        this.max.z = point.z;
                    }
                }
                
                this.setMinMax( this.min, this.max );
            }
            else{
                this.clear();
            }
            
            return this;
        };
        
        
        Bound3.prototype.clear = function(){
            
            this.center.set( 0, 0, 0 );
            this.size.set( 0, 0, 0 );
            
            this.extents.set( 0, 0, 0 );
            
            this.min.set( 0, 0, 0 );
            this.max.set( 0, 0, 0 );
            
            return this;
        };
        
        
        Bound3.prototype.expand = function( v ){
            
            this.min.sub( v );
            this.max.add( v );
            
            this.setMinMax( this.min, this.max );
            
            return this;
        };
        
        
        Bound3.prototype.contains = function( point ){
            if( point.x < this.min.x || point.x > this.max.x ||
                point.y < this.min.y || point.y > this.max.y ||
                point.z < this.min.z || point.z > this.max.z
            ){
                return false;
            }
            return true;
	};
        
        
        Bound3.prototype.equals = function( other ){
            
            return Bound3.equals( this, other );
	};
        
        
        Bound3.equals = function( a, b ){
            
            return (
                vec3Equals( a.min, b.min ) &&
                vec3Equals( a.max, b.max )
            );
	};
        
        return Bound3;
    }
);