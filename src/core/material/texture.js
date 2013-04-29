if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
        "math/mathf"
    ],
    function( Class, Mathf ){
        "use strict";
        
        
        function Texture( opts ){
	    opts || ( opts = {} );
            
            Class.call( this );
            
            this.image = opts.image instanceof Image ? opts.image : new Image();
            
            if( Mathf.isPowerOfTwo( this.image.width ) && Mathf.isPowerOfTwo( this.image.height ) ){
                this.mipMap = true;
            }
            else{
                this.mipMap = false;
            }
            
            this.format = opts.format !== undefined ? opts.format : Texture.rgb;
            
            this.anisotropy = opts.anisotropy !== undefined ? opts.anisotropy : 1;
            
            this.wrap = opts.wrap !== undefined ? opts.wrap : Texture.repeat;
            
            this.flipY = opts.flipY !== undefined ? opts.flipY : true;
            
            this.data = undefined;
            
            this.needsUpdate = true;
        }
        
        Texture.prototype = Object.create( Class.prototype );
        Texture.prototype.constructor = Texture;
        
        
        Texture.repeat = 0;
        Texture.clamp = 1;
        
        Texture.rgb = 2;
        Texture.rgba = 3;
        
        
        return Texture;
    }
);