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
	
	Ares.Camera = require("core/components/camera");
	Ares.Component = require("core/components/component");
	Ares.Light = require("core/components/light");
	Ares.Mesh = require("core/components/mesh");
	
	Ares.Geometry = require("core/geometry/geometry");
	Ares.Face = require("core/geometry/face");
	
	Ares.Geometry.Cube = require("core/geometry/primitives/cube");
	Ares.Geometry.Sphere = require("core/geometry/primitives/sphere");
	
	Ares.Accelerometer = require("core/input/accelerometer");
	Ares.Input = require("core/input/input");
	Ares.Keyboard = require("core/input/keyboard");
	Ares.Mouse = require("core/input/mouse");
	Ares.Orientation = require("core/input/orientation");
	Ares.Touches = require("core/input/touches");
	
	Ares.Material = require("core/material/material");
	Ares.Texture = require("core/material/texture");
	
	Ares.GameObject = require("core/objects/gameobject");
	Ares.Transform2D = require("core/objects/transform2d");
	Ares.Transform3D = require("core/objects/transform3d");
	
	Ares.Canvas = require("core/canvas");
	Ares.Game = require("core/game");
	Ares.Renderer = require("core/renderer");
	Ares.Scene = require("core/scene");
	Ares.World = require("core/world");
	
	return Ares;
    }
);