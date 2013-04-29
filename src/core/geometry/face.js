if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"math/vec3",
    ],
    function( Vec3 ){
        "use strict";
        
        
        function Face( a, b, c ){
	    
	    this.a = a;
	    this.b = b;
	    this.c = c;
            
            this.normal = new Vec3();
        }
        
        
        Face.prototype.clone = function(){
            var clone = new Face();
            clone.copy( this );
            
            return clone;
        };
        
        
        Face.prototype.copy = function( f ){
            
	    this.a = f.a;
	    this.b = f.b;
	    this.c = f.c;
	    
	    this.normal.copy( f.normal );
            
            return this;
        };
        
        
        return Face;
    }
);