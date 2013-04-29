if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"core/components/component",
        "math/color"
    ],
    function( Component, Color ){
        "use strict";
        
        
        function Light( opts ){
            opts = !!opts ? opts : {};
            
            Component.call( this );
            
            this.type = opts.type !== undefined ? opts.type : Light.point;
            
            this.color = opts.color instanceof Color ? opts.color : new Color( 1, 1, 1, 1 );
            this.energy = opts.energy !== undefined ? opts.energy : 1;
            
            this.constant = opts.constant !== undefined ? opts.constant : 0;
            this.linear = opts.linear !== undefined ? opts.linear : 1;
            this.quadratic = opts.quadratic !== undefined ? opts.quadratic : 0;
        }
        
        Light.prototype = Object.create( Component.prototype );
        Light.prototype.constructor = Light;
        
        
        Light.prototype.clone = function(){
            var clone = new Light();
            clone.copy( this );
            
            return clone;
        };
        
        
        Light.prototype.copy = function( other ){
            
            this.type = other.type;
            
            this.color.copy( other.color );
            this.energy = other.energy;
            
            this.constant = other.constant;
            this.linear = other.linear;
            this.quadratic = other.quadratic;
            
            return this;
        };
        
        
        Light.point = 0;
        Light.directional = 1;
        Light.spot = 3;
        Light.hemi = 2;
        
        
        return Light;
    }
);