if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"core/components/component",
	"math/mat4"
    ],
    function( Component, Mat4 ){
        "use strict";
        
        
        function Camera( opts ){
	    opts || ( opts = {} );
            
            Component.call( this );
            
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            
            this.aspect = this.width / this.height;
            
            this.fov = opts.fov !== undefined ? opts.fov : 35;
            this.near = opts.near !== undefined ? opts.near : 0.1;
            this.far = opts.far !== undefined ? opts.far : 512;
            
            this.orthographic = opts.orthographic !== undefined ? opts.orthographic : false;
            this.orthographicSize = opts.orthographicSize !== undefined ? opts.orthographicSize : 6;
            
            this.matrixProjection = new Mat4;
            this.matrixProjectionInverse = new Mat4;
            this.matrixProjectionScreen = new Mat4;
            
            this.matrixWorldInverse = new Mat4;
            
            this.needsUpdate = true;
        }
        
        Camera.prototype = Object.create( Component.prototype );
        Camera.prototype.constructor = Camera;
        
        
        Camera.prototype.clone = function(){
            var clone = new Camera();
            clone.copy( this );
            
            return clone;
        };
        
        
        Camera.prototype.copy = function( other ){
            
            this.width = other.width;
            this.height = other.height;
            
            this.aspect = other.aspect;
            
            this.fov = other.fov;
            this.near = other.near;
            this.far = other.far;
            
            this.orthographic = other.orthographic;
            this.orthographicSize = other.orthographicSize;
            
            this.matrixProjection = other.matrixProjection.clone();
            this.matrixProjectionInverse = other.matrixProjectionInverse.clone();
            this.matrixProjectionScreen = other.matrixProjectionScreen.clone();
            
            this.matrixWorldInverse = other.matrixWorldInverse.clone();
            
            this.needsUpdate = other.needsUpdate;
            
            return this;
        };
        
        
        Camera.prototype.setSize = function( width, height ){
            
            this.width = width !== undefined ? width : this.width;
            this.height = height !== undefined ? height : this.height;
            
            this.aspect = this.width / this.height
            
            this.needsUpdate = true;
        };
        
        
        Camera.prototype.setFov = function( fov ){
            
            this.fov = fov !== undefined ? fov : 35;
            this.needsUpdate = true;
        };
        
        
        Camera.prototype.setLens = function( focalLength, frameHeight ){
            focalLength = focalLength !== undefined ? focalLength : 35;
            frameHeight = frameHeight !== undefined ? frameHeight : 24;
            
            this.fov = 2 * Mathf.toDegs( Math.atan( frameHeight / ( focalLength * 2 ) ) );
            this.needsUpdate = true;
        };
        
        
        Camera.prototype.setOrthographic = function( bool ){
            
            this.orthographic = !!bool;
            
            this.needsUpdate = true;
        };
        
        
        Camera.prototype.setOrthographicSize = function( size ){
            
            this.orthographicSize = size !== undefined ? size : this.orthographicSize;
            
            this.needsUpdate = true;
        };
        
        
        Camera.prototype.updateMatrixProjection = function(){
            
            if( !this.orthographic ){
                this.matrixProjection.makePerspective( this.fov, this.aspect, this.near, this.far );
            }
            else{
                var orthographicSize = this.orthographicSize / 512,
                    right = ( this.width * 0.5 ) * orthographicSize,
                    left = -right,
                    top = ( this.height * 0.5 ) * orthographicSize,
                    bottom = -top;
                    
                this.matrixProjection.makeOrthographic( left, right, top, bottom, this.near, this.far );
            }
            
            this.matrixProjectionInverse.getInverse( this.matrixProjection );
            
            this.needsUpdate = false;
        };
        
        
        Camera.prototype.update = function(){
            
            if( this.needsUpdate ){
                this.updateMatrixProjection();
            }
            
            this.matrixWorldInverse.getInverse( this.gameObject.matrixWorld );
            this.matrixProjectionScreen.mmul( this.matrixProjection, this.matrixWorldInverse );
        };
        
        
        return Camera;
    }
);