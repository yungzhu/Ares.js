if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
        "core/geometry/geometry",
        "core/geometry/face",
	"math/mathf",
	"math/vec2",
	"math/vec3",
    ],
    function( Geometry, Face, Mathf, Vec2, Vec3 ){
        "use strict";
        
        var sin = Math.sin,
            cos = Math.cos,
            max = Math.max,
            floor = Math.floor;
        
        
        function Sphere( opts ){
	    opts || ( opts = {} );
            
            var radius = opts.radius !== undefined ? opts.radius : 0.5,
                segments = opts.segments !== undefined ? floor( max( opts.segments, 3 ) ) : 16,
                rings = opts.rings !== undefined ? floor( max( opts.rings, 3 ) ) : 8,
                
                PI = Mathf.PI,
                TWO_PI = Mathf.TWO_PI,
                HALF_PI = Mathf.HALF_PI,
                
                R = 1 / ( rings - 1 ),
                S = 1 / ( segments - 1 ),
                r, s,
                x, y, z,
                a, b, c, d,
                
                faceA, faceB, normals,
                vec = new Vec3(),
                
                geometry = new Geometry( opts );
            
            for( r = 0; r < rings; r++ ) for( s = 0; s < segments; s++ ){
                z = sin( -HALF_PI + PI * r * R );
                x = cos( TWO_PI * s * S ) * sin( PI * r * R );
                y = sin( TWO_PI * s * S ) * sin( PI * r * R );
                
                geometry.vertices.push( new Vec3( x, y, z ).smul( radius ) );
                geometry.normals.push( new Vec3( x, y, z ) );
                geometry.uv.push( new Vec2( s * S, r * R ) );
                geometry.colors.push( new Vec3( s * S, r * R, 0 ) );
            }
            
            normals = geometry.normals;
            
            for( r = 0; r < rings-1; r++ ) for( s = 0; s < segments-1; s++ ){
                a = r * segments + s;
                b = r * segments + ( s + 1 );
                c = ( r + 1 ) * segments + ( s + 1 );
                d = ( r + 1 ) * segments + s;
                
                faceA = new Face( a, b, c );
                faceB = new Face( a, c, d );
                
                vec.copy( normals[a] ).add( normals[b] ).add( normals[c] ).sdiv( 3 );
                faceA.normal.copy( vec );
                
                vec.copy( normals[a] ).add( normals[c] ).add( normals[d] ).sdiv( 3 );
                faceB.normal.copy( vec );
                
                geometry.faces.push( faceA, faceB );
            }
            
            geometry.calculateTangents();
            geometry.calculateBounds();
            
            return geometry;
        }
        
        
        return Sphere;
    }
);