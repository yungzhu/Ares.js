if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
	"base/time",
	"base/utils",
	"core/input/input",
	"core/assets",
	"core/scene",
	"core/renderer",
    ],
    function( Class, Time, Utils, Input, Assets, Scene, Renderer ){
	"use strict";
        
	var addEvent = Utils.addEvent,
	    floor = Math.floor;
	
        
        function Game( opts ){
            opts || ( opts = {} );
            
            Class.call( this );
	    
	    this.name = opts.name || ( this._class +"-"+ this._id );
	    
            this.scenes = [];
            this.scene = undefined;
            
            this.renderer = new Renderer( opts );
	    
	    Input.init( this.renderer.canvas.element );
	    
	    this.listenTo( Assets, "done", this.init, this );
	    Assets.loadAll( opts.sources );
	    
            this.addScene.apply( this, opts.scenes );
            
	    this.pause = false;
	    
            addEvent( window, "focus", this.handleFocus, this );
            addEvent( window, "blur", this.handleBlur, this );
        }
        
        Game.prototype = Object.create( Class.prototype );
        Game.prototype.constructor = Game;
        
        
        Game.prototype.init = function(){
	    
	    this.trigger("init");
	    this.animate();
        };
	
	
	Game.prototype.setScene = function( scene ){
            var index, newScene;
	    
            if( scene instanceof Scene ){
                index = this.scenes.indexOf( scene );
		
		if( index === -1 ){
		    console.warn("Game.setScene: scene not added to Game, adding it...");
		    this.addScene( scene );
		}
		
                newScene = scene;
            }
            else if( Utils.isString( scene ) ){
		
                newScene = this.getScene( scene );
            }
	    
	    if( newScene ){
		this.scene = newScene;
	    }
            else{
                console.warn("Game.setScene: could not find scene in game "+ scene );
            }
        };
        
        
        Game.prototype.getScene = function( name ){
            var scenes = this.scenes,
                scene, i, il;
                
            for( i = 0, il = scenes.length; i < il; i++ ){
                scene = scenes[i];
                
                if( scene.name === name ){
                    
                    return scene;
                }
            }
            
            return undefined;
        };
        
        
        Game.prototype.addScene = function(){
            var scenes = this.scenes,
                scene, index,
                i, il;
            
            for( i = 0, il = arguments.length; i < il; i++ ){
                scene = arguments[i];
                index = scenes.indexOf( scene );
                
                if( index === -1 && scene instanceof Scene ){
                    
                    scenes.push( scene );
		    scene.game = this;
                    
                    scene.trigger("addToGame");
                    this.trigger("addScene", scene );
		    
		    if( !this.scene ){
			this.setScene( scene );
		    };
                }
            }
        };
        
        
        Game.prototype.removeScene = function(){
            var scenes = this.scenes,
                scene, index,
                i, il;
            
            for( i = 0, il = arguments.length; i < il; i++ ){
                scene = arguments[i];
                index = scenes.indexOf( scene );
                
                if( index !== -1 ){
                    
                    scenes.splice( index, 1 );
		    scene.game = undefined;
                    
                    scene.trigger("removeFromGame");
                    this.trigger("removeScene", scene );
		    
		    if( this.scene === scene ) this.scene = undefined;
                }
            }
        };
        
        
        Game.prototype.update = function(){
            var scene = this.scene;
            
	    Input.update();
	    
	    if( !this.pause ){
		Time.start();
		
		this.trigger("update");
		
		if( scene ){
		    scene.update();
		}
		
		this.trigger("lateUpdate");
		Time.end();
	    }
        };
        
        
        Game.prototype.render = function(){
            var scene = this.scene;
            
            if( scene && scene.camera ){
		this.renderer.render( scene );
            }
        };
        
        
        Game.prototype.animate = function(){
	    var fpsDisplay = document.createElement("p"),
	    	fpsSpan = document.createElement("span");
	    
	    fpsDisplay.style.cssText = [
		"z-index: 1000;",
		"position: absolute;",
		"margin: 0px;",
		"padding: 0px;",
		"color: #ddd;",
		"text-shadow: 1px 1px #333"
	    ].join("\n");
	    
	    fpsDisplay.innerHTML = "FPS: ";
	    fpsDisplay.appendChild( fpsSpan );
	    
	    document.body.appendChild( fpsDisplay );
	    
	    return function(){
		fpsSpan.innerHTML = floor( Time.fps );
		
		this.update();
		this.render();
		
		Device.requestAnimFrame( this.animate.bind( this ) );
		
		Time.sinceStart = Utils.now() * 0.001;
	    };
	}();
        
        
        Game.prototype.handleFocus = function( e ){
	    
	    this.trigger("focus", e );
        };
        
        
        Game.prototype.handleBlur = function( e ){
	    
	    this.trigger("blur", e );
        };
	
        
        return Game;
    }
);