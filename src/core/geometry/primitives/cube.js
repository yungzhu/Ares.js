if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
        "core/geometry/geometry",
	"math/vec3",
    ],
    function( Geometry, Vec3 ){
        "use strict";
        
        
        function Cube( opts ){
            opts = !!opts ? opts : {};
            
            var w = ( opts.width !== undefined ? opts.width : 1 ) * 0.5,
                h = ( opts.height !== undefined ? opts.height : 1 ) * 0.5,
                d = ( opts.depth !== undefined ? opts.depth : 1 ) * 0.5,
                
                geometry = new Geometry( opts );
                
            
            geometry.addQuad(
                new Vec3( -w, h, -d ),
                new Vec3( w, h, -d ),
                new Vec3( w, -h, -d ),
                new Vec3( -w, -h, -d )
            );
            
            geometry.addQuad(
                new Vec3( w, h, d ),
                new Vec3( -w, h, d ),
                new Vec3( -w, -h, d ),
                new Vec3( w, -h, d )
            );
            
            geometry.addQuad(
                new Vec3( w, h, -d ),
                new Vec3( w, h, d ),
                new Vec3( w, -h, d ),
                new Vec3( w, -h, -d )
            );
            
            geometry.addQuad(
                new Vec3( -w, h, d ),
                new Vec3( -w, h, -d ),
                new Vec3( -w, -h, -d ),
                new Vec3( -w, -h, d )
            );
            
            geometry.addQuad(
                new Vec3( w, -h, d ),
                new Vec3( -w, -h, d ),
                new Vec3( -w, -h, -d ),
                new Vec3( w, -h, -d )
            );
            
            geometry.addQuad(
                new Vec3( w, h, d ),
                new Vec3( w, h, -d ),
                new Vec3( -w, h, -d ),
                new Vec3( -w, h, d )
            );
            
            geometry.calculateTangents();
            geometry.calculateBounds();
            
            return geometry;
        }
        
        
        return Cube;
    }
);