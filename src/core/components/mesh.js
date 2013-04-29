if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"core/components/component",
	"core/geometry/geometry",
	"core/material/material",
    ],
    function( Component, Geometry, Material ){
        "use strict";
        
        
        function Mesh( opts ){
	    opts || ( opts = {} );
            
            Component.call( this );
            
            this.geometry = opts.geometry instanceof Geometry ? opts.geometry : new Geometry();
            this.material = opts.material instanceof Material ? opts.material : new Material();
	    
	    this._data = {
                opts: {},
                used: 0,
                uniforms: {},
                attributes: {},
                vertex: undefined,
                fragment: undefined,
                src: undefined,
                program: undefined
            };
        }
        
        Mesh.prototype = Object.create( Component.prototype );
        Mesh.prototype.constructor = Mesh;
        
        
        Mesh.prototype.clone = function(){
            var clone = new Mesh();
            clone.copy( this );
            
            return clone;
        };
        
        
        Mesh.prototype.copy = function( other ){
            
            this.geometry = other.geometry;
            this.material = other.material;
            
            return this;
        };
        
        
        return Mesh;
    }
);