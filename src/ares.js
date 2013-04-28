if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define(
    function( require ){
	"use strict";
	
	
	var Ares = {};
	
	Ares.globalize = function(){
	    
	    for( var key in this ){
		window[ key ] = this[ key ];
	    }
	    window.Ares = this;
	};
	
	Ares.speedTest = function(){
	    var now = Date.now,
		start, i;
	    
	    return function( name, times, fn ){
		start = now();
		
		for( i = 0; i < times; i++ ){
		    fn();
		}
		
		console.log( name +": "+ ( now() - start ) +"ms");
	    };
	}();
	
	
	Ares.Bound2 = require("math/bound2");
	Ares.Bound3 = require("math/bound3");
	Ares.Color = require("math/color");
	Ares.Mat3 = require("math/mat3");
	Ares.Mat4 = require("math/mat4");
	Ares.Mathf = require("math/mathf");
	Ares.Quat = require("math/quat");
	Ares.Vec2 = require("math/vec2");
	Ares.Vec3 = require("math/vec3");
	Ares.Vec4 = require("math/vec4");
	
	Ares.Class = require("base/class");
	Ares.Device = require("base/device");
	Ares.Time = require("base/time");
	Ares.Utils = require("base/utils");
	
	Ares.Component = require("core/components/component");
	
	Ares.Transform2D = require("core/objects/transform2d");
	Ares.Transform3D = require("core/objects/transform3d");
	
	Ares.Canvas = require("core/canvas");
	Ares.GameObject = require("core/gameobject");
	Ares.Scene = require("core/scene");
	Ares.World = require("core/world");
	
	return Ares;
    }
);