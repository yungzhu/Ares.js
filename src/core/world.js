if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
	"base/utils",
	"base/time",
	"math/mathf",
	"math/color",
	"math/vec3",
    ],
    function( Class, Utils, Time, Mathf, Color, Vec3 ){
        "use strict";
        
        
        function World( opts ){
	    opts || ( opts = {} );
            
            Class.call( this );
            
            this.name = opts.name || ( this._class +"-"+ this._id );
	    
            this.background = opts.background instanceof Color ? opts.background : new Color( 0.5, 0.5, 0.5, 1 );
            this.ambient = opts.ambient instanceof Color ? opts.ambient : new Color( 0.1, 0.1, 0.1, 1 );
            
            this.steps = opts.steps !== undefined ? opts.steps : 10;
	    this.allowSleep = opts.allowSleep !== undefined ? opts.allowSleep : true;
            this.gravity = opts.gravity instanceof Vec3 ? opts.gravity : new Vec3( 0, 0, -9.801 );
        }
        
        World.prototype = Object.create( Class.prototype );
        World.prototype.constructor = World;
        
        
        World.prototype.add = function( rigidbody ){
	    
        };
        
        
        World.prototype.remove = function( rigidbody ){
	    
        };
        
        
        World.prototype.update = function(){
	    
	};
        
        
        return World;
    }
);