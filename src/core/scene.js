if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
	"base/utils"
    ],
    function( Class, Utils ){
        "use strict";
	
        
        function Scene( opts ){
	    opts || ( opts = {} );
            
            Class.call( this );
            
            this.name = opts.name || ( this._class +"-"+ this._id );
            
            this.children = [];
            
            this.add.apply( this, opts.children );
        }
        
        Scene.prototype = Object.create( Class.prototype );
        Scene.prototype.constructor = Scene;
        
        
        Scene.prototype.forEach = function( callback ){
            var children = this.children,
                i, il;
            
            for( i = 0, il = children.length; i < il; i++ ){
                callback( children[i] );
            }
        };
        
        
        Scene.prototype.add = function(){
            var children = this.children,
                child, index,
                i, il;
            
            for( i = 0, il = arguments.length; i < il; i++ ){
                child = arguments[i];
                index = children.indexOf( child );
		
                if( index === -1 ){
		    
                    if( child instanceof GameObject ){
			
			child.scene = this;
			
			children.push( child );
			
			if( child.children.length > 0 ){
			    this.add.apply( this, child.children );
			}
			
			child.trigger("addToScene");
			this.trigger("addGameObject", child );
			
			child.init();
		    }
		    else{
                        console.warn("Scene.add: Object is not an instance of GameObject");
		    }
                }
                else{
                    console.warn("Scene.add: "+ child.name +" is already added to scene");
                }
            }
        };
        
        
        Scene.prototype.remove = function(){
            var children = this.children,
                child, index,
                i, il;
            
            for( i = 0, il = arguments.length; i < il; i++ ){
                child = arguments[i];
                index = children.indexOf( child );
                
                if( index !== -1 ){
                    
                    child.scene = undefined;
                    
                    children.splice( index, 1 );
                    
                    if( child.children.length > 0 ){
                        this.remove.apply( this, child.children );
                    }
                    
		    child.trigger("removeFromScene");
		    this.trigger("removeGameObject", child );
                }
                else{
                    console.warn("Scene.remove: "+ child +" is not within this scene");
                }
            }
        };
        
        
        Scene.prototype.findByTag = function( tag, results ){
            results = results || [];
            
            var children = this.children,
                child, i, il;
                
            for( i = 0, il = children.length; i < il; i++ ){
                child = children[i];
                
                if( child.hasTag( tag ) ){
                    results.push( child );
                }
            }
            
            return results;
        };
        
        
        Scene.prototype.findByName = function( name ){
            var children = this.children,
                child, i, il;
                
            for( i = 0, il = children.length; i < il; i++ ){
                child = children[i];
                
                if( child.name === name ){
                    
                    return child;
                }
            }
            
            return undefined;
        };
        
        
        Scene.prototype.update = function(){
            var children = this.children,
                i, il;
                
            this.trigger("update");
            
            for( i = 0, il = children.length; i < il; i++ ){
                children[i].update();
            }
            
            this.trigger("update");
        };
        
        
        return Scene;
    }
);