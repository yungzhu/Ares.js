if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"math/vec2"
    ],
    function( Vec2 ){
        "use strict";
        
	var vec2Equals = Vec2.equals;
	
        
        function Bound2( center, size ){
            
            this.center = center instanceof Vec2 ? center : new Vec2();
            this.size = size instanceof Vec2 ? size : new Vec2();
            
            this.extents = new Vec2().copy( this.size ).smul( 0.5 );
            
            this.min = new Vec2().vsub( this.center, this.extents );
            this.max = new Vec2().vadd( this.center, this.extents );
	}
        
        
        Bound2.prototype.clone = function(){
            var clone = new Bound2();
            clone.copy( this );
            
            return clone;
	};
        
        
        Bound2.prototype.copy = function( other ){
            
            this.center.copy( other.center );
            this.size.copy( other.size );
            
            this.extents.copy( other.extents );
            
            this.min.copy( other.min );
            this.max.copy( other.max );
            
            return this;
	};
        
        
        Bound2.prototype.set = function( center, size ){
            
            this.center.copy( center instanceof Vec2 ? center : this.center );
            this.size.copy( size instanceof Vec2 ? size : this.size );
            
            this.extents.copy( this.size ).smul( 0.5 );
            
            this.min.vsub( this.center, this.extents );
            this.max.vadd( this.center, this.extents );
            
            return this;
        };
        
        
        Bound2.prototype.setMinMax = function( min, max ){
            
            this.min.copy( min instanceof Vec2 ? min : this.min );
            this.max.copy( max instanceof Vec2 ? max : this.max );
            
            this.center.vadd( this.max, this.min ).smul( 0.5 );
            this.size.vsub( this.max, this.min );
            
            this.extents.copy( this.size ).smul( 0.5 );
            
            return this;
        };
        
        
        Bound2.prototype.setFromPoints = function( points ){
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
                }
                
                this.setMinMax( this.min, this.max );
            }
            else{
                this.clear();
            }
            
            return this;
        };
        
        
        Bound2.prototype.clear = function(){
            
            this.center.set( 0, 0, 0 );
            this.size.set( 0, 0, 0 );
            
            this.extents.set( 0, 0, 0 );
            
            this.min.set( 0, 0, 0 );
            this.max.set( 0, 0, 0 );
            
            return this;
        };
        
        
        Bound2.prototype.expand = function( v ){
            
            this.min.sub( v );
            this.max.add( v );
            
            this.setMinMax( this.min, this.max );
            
            return this;
        };
        
        
        Bound2.prototype.contains = function( point ){
            if( point.x < this.min.x || point.x > this.max.x ||
                point.y < this.min.y || point.y > this.max.y
            ){
                return false;
            }
            return true;
	};
        
        
        Bound2.prototype.equals = function( other ){
            
            return Bound2.equals( this, other );
	};
        
        
        Bound2.equals = function( a, b ){
            
            return (
                vec2Equals( a.min, b.min ) &&
                vec2Equals( a.max, b.max )
            );
	};
        
        return Bound2;
    }
);