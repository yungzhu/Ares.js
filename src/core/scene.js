if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
	"base/utils",
	"core/world"
    ],
    function( Class, Utils, World ){
        "use strict";
	
        
        function Scene( opts ){
	    opts || ( opts = {} );
            
            Class.call( this );
            
            this.name = opts.name || ( this._class +"-"+ this._id );
	    
            this.children = [];
	    
	    this._cameras = [];
	    this._meshes = [];
	    
	    this._pointLights = [];
	    this._directionalLights = [];
	    this._spotLights = [];
	    this._hemiLights = [];
	    
            this.camera = undefined;
	    
            this.world = opts.world instanceof World ? opts.world : new World;
            
            this.add.apply( this, opts.children );
        }
        
        Scene.prototype = Object.create( Class.prototype );
        Scene.prototype.constructor = Scene;
	
	
	Scene.prototype.setCamera = function( camera ){
            var component, index;
	    
	    if( camera instanceof Camera ){
		index = this.children.indexOf( camera.gameObject );
		
		if( index === -1 ){
		    console.warn("Scene.setCamera: camera not added to Scene, adding it...");
		    this.add( camera.gameObject );
		}
		
		component = camera;
	    }
            else if( camera instanceof GameObject ){
                index = this.children.indexOf( camera );
		
		if( index === -1 ){
		    console.warn("Scene.setCamera: camera's gameObject is not added to Scene, adding it...");
		    this.add( camera );
		}
		
                component = camera.getComponent("Camera");
            }
            else if( Utils.isString( camera ) ){
                component = this.findByName( camera ).getComponent("Camera");
            }
	    
            if( component ){
                this.camera = component;
            }
	    else{
		console.warn("Scene.setCamera: no camera found "+ camera );
	    }
        };
        
        
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
			
			this._add( child );
			
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
		    
		    this._remove( child );
                    
		    child.trigger("removeFromScene");
		    this.trigger("removeGameObject", child );
                }
                else{
                    console.warn("Scene.remove: "+ child +" is not within this scene");
                }
            }
        };
	
	
	Scene.prototype._add = function( gameObject ){
            var mesh = gameObject.getComponent("Mesh"),
		light = gameObject.getComponent("Light"),
		camera = gameObject.getComponent("Camera"),
		index;
	    
	    if( mesh ){
		this._meshes.push( mesh );
		this._meshes.sort( this.sortGeometries );
	    }
	    
	    if( light ){
		
		switch( light.type ){
		    case Light.point:
			this._pointLights.push( light );
			break;
			
		    case Light.directional:
			this._directionalLights.push( light );
			break;
			
		    case Light.spot:
			this._spotLights.push( light );
			break;
			
		    case Light.hemi:
			this._hemiLights.push( light );
			break;
		}
	    }
	    
	    if( camera ){
		if( !this.camera ) this.setCamera( camera );
		this._cameras.push( camera );
	    }
        };
        
        
        Scene.prototype._remove = function( gameObject ){
            var mesh = gameObject.getComponent("Mesh"),
		light = gameObject.getComponent("Light"),
		camera = gameObject.getComponent("Camera"),
		index, addedIndex;
	    
	    if( mesh ){
		index = this._meshes.indexOf( mesh );
		
		this._meshes.splice( index, 1 );
		this._meshes.sort( this.sortGeometries );
	    }
	    
	    if( light ){
		
		switch( light.type ){
		    case Light.point:
			index = this._pointLights.indexOf( light );
			this._pointLights.splice( index, 1 );
			break;
			
		    case Light.directional:
			index = this._directionalLights.indexOf( light );
			this._directionalLights.splice( index, 1 );
			break;
			
		    case Light.spot:
			index = this._spotLights.indexOf( light );
			this._spotLights.splice( index, 1 );
			break;
			
		    case Light.hemi:
			index = this._hemiLights.indexOf( light );
			this._hemiLights.splice( index, 1 );
			break;
		}
	    }
	    
	    if( camera ){
		index = this._cameras.indexOf( camera );
		this._cameras.splice( index, 1 );
	    }
        };
        
        
        Scene.prototype.sortGeometries = function( a, b ){
	    
	    if( a.geometry === b.geometry ){
		return 1
	    }
	    
	    return -1;
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