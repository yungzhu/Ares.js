if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
        "math/color",
        "core/material/texture"
    ],
    function( Class, Color, Texture ){
        "use strict";
        
        
        function Material( opts ){
	    opts || ( opts = {} );
            
            Class.call( this );
            
            this.visible = opts.visible !== undefined ? opts.visible : true;
            
            this.diffuse = opts.diffuse instanceof Color ? opts.diffuse : new Color( 0.8, 0.8, 0.8, 1 );
            
            this.specular = opts.specular instanceof Color ? opts.specular : new Color( 1, 1, 1, 1 );
            
            this.hardness = opts.hardness !== undefined ? opts.hardness : 32;
            this.emissive = opts.emissive !== undefined ? opts.emissive : 0;
            
            this.shading = opts.shading !== undefined ? opts.shading : true;
            this.ambient = opts.ambient !== undefined ? opts.ambient : 1;
            this.translucency = opts.translucency !== undefined ? opts.translucency : 0;
            
            this.alpha = opts.alpha !== undefined ? opts.alpha : 1;
            
            this.wireframe = opts.wireframe !== undefined ? opts.wireframe : false;
            this.vertexColors = opts.vertexColors !== undefined ? opts.vertexColors : false;
            
            this.diffuseMap = opts.diffuseMap instanceof Texture ? opts.diffuseMap : undefined;
            this.useDiffuseMapAlpha = !!opts.useDiffuseMapAlpha ? true : false;
            
            this.emitMap = opts.emitMap instanceof Texture ? opts.emitMap : undefined;
            this.alphaMap = opts.alphaMap instanceof Texture ? opts.alphaMap : undefined;
            this.specularMap = opts.specularMap instanceof Texture ? opts.specularMap : undefined;
            this.normalMap = opts.normalMap instanceof Texture ? opts.normalMap : undefined;
            
            this.blending = opts.blending !== undefined ? opts.blending : Material.normal;
            
            this.depthTest = opts.depthTest !== undefined ? opts.depthTest : true;
            this.depthWrite = opts.depthWrite !== undefined ? opts.depthWrite : true;
            
	    this.shader = {
                opts: {},
                used: 0,
                uniforms: {},
                attributes: {},
                vertex: undefined,
                fragment: undefined,
                src: undefined,
                program: undefined
            };
            
            this.needsUpdate = true;
        }
        
        Material.prototype = Object.create( Class.prototype );
        Material.prototype.constructor = Material;
        
        
        Material.none = 0;
        Material.normal = 1;
        Material.additive = 2;
        Material.subtractive = 3;
        Material.multiply = 4;
        
        
        return Material;
    }
);