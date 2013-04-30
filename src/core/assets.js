if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
	"base/utils",
	"core/geometry/geometry"
    ],
    function( Class, Utils, Geometry ){
	"use strict";
	
	
	var init = false;
	
	
	function Assets(){
	    
	    Class.call( this );
	    
	    this.resources = {};
	    
	    this.loaded = 0;
	    this.total = 0;
	}
        
        Assets.prototype = Object.create( Class.prototype );
        Assets.prototype.constructor = Assets;
	
	
        Assets.prototype.loadAll = function( sources ){
	    var key, source, name;
	    
	    if( sources ){
		if( Utils.isArray( sources ) ){
		    for( key in sources ){
			source = sources[ key ];
			this.load( source );
		    }
		}
		else{
		    for( key in sources ){
			source = sources[ key ];
			this.load( source, key );
		    }
		}
	    }
	    else{
		this.trigger("done");
	    }
	    
	    return this;
        }
	
	
        Assets.prototype.get = function( name ){
            
	    return this.resources[ name ];
        };
	
	
	Assets.prototype.load = function( url, name, force ){
	    var file = url.toLowerCase().split("/").pop(),
		ext = file.split(".").pop();
	    
	    force = force ? true : false;
	    name = name || file.substr( 0, file.lastIndexOf(".") );
	    
	    if( !force && this.resources[ name ] ){
		console.warn("Assets.load: "+name+" is already used");
		return this;
	    }
	    
	    switch( ext ){
		case "png":
		case "jpg":
		case "jpeg":
		    
		    this._loadImage( name, url );
		    break;
		
		case "json":
		case "js":
		    
		    this._loadGeometry( name, url );
		    break;
		
		default:
		    console.warn("Assets.init: error loading asset "+ name +": file type ."+ ext +" is not supported");
		    break;
	    }
	    
	    return this;
	};
	
	
        Assets.prototype._loadImage = function( name, url ){
            var img = new Image(),
                self = this;
            
	    this.total++;
	    
            img.addEventListener("load", function( e ){
                
                self.resources[ name ] = img;
                self.loaded++;
                self.trigger("imageLoad", url, name );
		
		self._checkProgress();
            }, false );
            
            img.addEventListener("error", function(){
                
                console.warn("Assets.load: image "+ name +": 404 ( Not Found )");
                self.loaded--;
                self.total--;
                self.trigger("imageLoadError", url, name );
		
		self._checkProgress();
            }, false );
            
            img.src = url;
	    
	    return this;
        };
        
        
        Assets.prototype._loadGeometry = function( name, url ){
            var geometry = new Geometry,
                self = this, i, j, item, vertex;
            
            this._loadJSON( url, function( data ){
                
                if( data.vertices && data.vertices.length ){
                    for( i = 0; i < data.vertices.length; i+=3 ){
                        item = data.vertices;
                        geometry.vertices.push( new Vec3( item[i], item[i+1], item[i+2] ) );
                    }
                }
                
                if( data.uv && data.uv.length ){
                    for( i = 0; i < data.uv.length; i+=2 ){
                        item = data.uv;
                        geometry.uv.push( new Vec2( item[i], item[i+1] ) );
                    }
                }
                
                if( data.colors && data.colors.length ){
                    for( i = 0; i < data.colors.length; i+=3  ){
                        item = data.colors;
                        geometry.colors.push( new Vec3( item[i], item[i+1], item[i+2] ) );
                    }
                }
                
                if( data.faces && data.faces.length ){
                    for( i = 0; i < data.faces.length; i+=3 ){
                        item = data.faces;
                        geometry.faces.push( new Face( item[i], item[i+1], item[i+2] ) );
                    }
                }
                
                if( data.normals && data.normals.length ){
                    for( i = 0; i < data.normals.length; i+=3 ){
                        item = data.normals;
                        geometry.normals.push( new Vec3( item[i], item[i+1], item[i+2] ) );
                    }
                }
                else{
		    geometry.calculateNormals();
		}
		
                self.resources[ name ] = geometry;
                self._checkProgress();
            });
	    
	    return this;
        };
	
	
        Assets.prototype._checkProgress = function(){
	    
	    if( this.loaded >= this.total && !init ){
		this.trigger("done");
		init = true;
	    }
	    
	    return this;
        };
        
        
        Assets.prototype._loadJSON = function( url, callback ){
            var request = new XMLHttpRequest();
            
            request.onreadystatechange = function(){
                
                if( request.readyState === 1 ){
                    request.send();
                }
                
                if( request.readyState === 4 ){
                    if( request.status === 404 ){
                        console.warn("file does not exist");
                    }
                    else{
                        callback( JSON.parse( request.responseText ) );
                    }
                }
            }
            
            request.open( "GET", url, true );
	    
	    return this;
        };
	
	
	return new Assets;
    }
);