if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
	"math/vec2",
	"math/vec3",
	"math/vec4",
	"math/mat3",
	"core/geometry/face",
    ],
    function( Class, Vec2, Vec3, Vec4, Mat3, Face ){
        "use strict";
        
        
        function Geometry( opts ){
	    opts || ( opts = {} );
	    
            Class.call( this );
            
            this.vertices = [];
	    
	    this.normals = [];
            
            this.tangents = [];
	    
            this.faces = [];
            
            this.colors = [];
            
            this.uv = [];
            
            this.dynamic = opts.dynamic !== undefined ? opts.dynamic : false;
	    
	    this.verticesNeedsUpdate = true;
	    this.normalsNeedsUpdate = true;
	    this.tangentsNeedsUpdate = true;
	    this.facesNeedsUpdate = true;
	    this.colorsNeedsUpdate = true;
	    this.uvNeedsUpdate = true;
	    
	    this.buffers = {
		vertices: undefined,
		normals: undefined,
		tangents: undefined,
		colors: undefined,
		uv: undefined,
		indices: undefined
	    };
        }
        
        Geometry.prototype = Object.create( Class.prototype );
        Geometry.prototype.constructor = Geometry;
        
        
        Geometry.prototype.clone = function(){
            var clone = new Geometry();
            clone.copy( this );
            
            return clone;
        };
        
        
        Geometry.prototype.copy = function( other ){
	    var i, il;
	    
	    this.clear();
	    
	    for( i = 0, il = other.vertices.length; i < il; i++ ){
		this.vertices[i] = other.vertices[i].clone();
	    }
	    
	    for( i = 0, il = other.normals.length; i < il; i++ ){
		this.normals[i] = other.normals[i].clone();
	    }
	    
	    for( i = 0, il = other.tangents.length; i < il; i++ ){
		this.tangents[i] = other.tangents[i].clone();
	    }
	    
	    for( i = 0, il = other.colors.length; i < il; i++ ){
		this.colors[i] = other.colors[i].clone();
	    }
	    
	    for( i = 0, il = other.uv.length; i < il; i++ ){
		this.uv[i] = other.uv[i].clone();
	    }
	    
	    for( i = 0, il = other.faces.length; i < il; i++ ){
		this.faces[i] = other.faces[i].clone();
	    }
            
	    this.verticesNeedsUpdate = true;
	    this.normalsNeedsUpdate = true;
	    this.tangentsNeedsUpdate = true;
	    this.facesNeedsUpdate = true;
	    this.colorsNeedsUpdate = true;
	    this.uvNeedsUpdate = true;
	    
            return this;
        };
        
        
        Geometry.prototype.clear = function(){
	    
	    this.vertices.length = 0;
	    this.normals.length = 0;
            this.tangents.length = 0;
            this.faces.length = 0;
            this.colors.length = 0;
            this.uv.length = 0;
	    
	    this.verticesNeedsUpdate = true;
	    this.normalsNeedsUpdate = true;
	    this.tangentsNeedsUpdate = true;
	    this.facesNeedsUpdate = true;
	    this.colorsNeedsUpdate = true;
	    this.uvNeedsUpdate = true;
	    
	    return this;
        };
	
	
	Geometry.prototype.applyMat4 = function(){
	    var normalMatrix = new Mat3(),
		i, il, vertex, face, normal, tangent;
	    
	    return function( matrix ){
		normalMatrix.getInverseMat4( matrix ).transpose();
		
		for( i = 0, il = this.vertices.length; i < il; i++ ){
		    vertex = this.vertices[i];
		    vertex.applyMat4( matrix );
		}
		for( i = 0, il = this.normals.length; i < il; i++ ){
		    normal = this.normals[i];
		    normal.applyMat3( normalMatrix ).norm();
		}
		for( i = 0, il = this.tangents.length; i < il; i++ ){
		    tangent = this.tangents[i];
		    tangent.applyMat3( normalMatrix ).norm();
		}
		for( i = 0, il = this.faces.length; i < il; i++ ){
		    face = this.faces[i];
		    face.normal.applyMat3( normalMatrix ).norm();
		}
		
		this.calculateBounds();
		
		this.verticesNeedsUpdate = true;
		this.normalsNeedsUpdate = true;
		this.tangentsNeedsUpdate = true;
		this.facesNeedsUpdate = true;
		this.colorsNeedsUpdate = true;
		this.uvNeedsUpdate = true;
	    };
	}();
        
	
        Geometry.prototype.calculateNormals = function(){
	    var u = new Vec3(),
		v = new Vec3(),
		uv = new Vec3();
	    
	    return function(){
		var i, il,
		    vertices = this.vertices, vertex,
		    normals = this.normals, normal,
		    faces = this.faces, face,
		    va, vb, vc;
		    
		normals.length = vertices.length;
		
		for( i = 0, il = vertices.length; i < il; i++ ){
		    normal = normals[i];
		    
		    if( normal ){
			normal.set( 0, 0, 0 );
		    }
		    else{
			normals[i] = new Vec3();
		    }
		}
		
		for( i = 0, il = faces.length; i < il; i++ ){
		    face = faces[i];
		    
		    va = vertices[ face.a ];
		    vb = vertices[ face.b ];
		    vc = vertices[ face.c ];
		    
		    u.vsub( vc, vb );
		    v.vsub( va, vb );
		    
		    uv.vcross( u, v );
		    
		    face.normal.copy( uv ).norm();
		    
		    normals[ face.a ].add( face.normal );
		    normals[ face.b ].add( face.normal );
		    normals[ face.c ].add( face.normal );
		}
		
		for( i = 0, il = faces.length; i < il; i++ ){
		    face = faces[i];
		    
		    normals[ face.a ].norm();
		    normals[ face.b ].norm();
		    normals[ face.c ].norm();
		}
		
		this.normalsNeedsUpdate = true;
		
		this.calculateTangents();
	    };
        }();
	
	
        Geometry.prototype.calculateTangents = function(){
	    var tan1 = [], tan2 = [],
		sdir = new Vec3(), tdir = new Vec3(),
		n = new Vec3(), t = new Vec3(),
		tmp1 = new Vec3(), tmp2 = new Vec3();
	    
	    return function(){
		tan1.length = 0; tan2.length = 0;
		
		var face, faces = this.faces,
		    vertex, vertices = this.vertices,
		    normals = this.normals,
		    tangents = this.tangents,
		    uv, uvs = this.uv,
		    
		    v1, v2, v3,
		    w1, w2, w3,
		    
		    x1, x2, y1, y2, z1, z2,
		    s1, s2, t1, t2,
		    a, b, c,
		    
		    r, w, i, il;
		
		this.tangents.length = vertices.length;
		
		for( i = 0, il = vertices.length; i < il; i++ ){
		    tan1[i] = new Vec3();
		    tan2[i] = new Vec3();
		}
		
		for( i = 0, il = vertices.length; i < il; i++ ){
		    uv = uvs[i];
		    
		    if( !uv ){
			uvs[i] = new Vec2();
		    }
		}
		
		for( i = 0, il = faces.length; i < il; i++ ){
		    face = faces[i];
		    
		    a = face.a;
		    b = face.b;
		    c = face.c;
		    
		    v1 = vertices[a];
		    v2 = vertices[b];
		    v3 = vertices[c];
		    
		    w1 = uvs[a];
		    w2 = uvs[b];
		    w3 = uvs[c];
		    
		    x1 = v2.x - v1.x;
		    x2 = v3.x - v1.x;
		    y1 = v2.y - v1.y;
		    y2 = v3.y - v1.y;
		    z1 = v2.z - v1.z;
		    z2 = v3.z - v1.z;
		    
		    s1 = w2.x - w1.x;
		    s2 = w3.x - w1.x;
		    t1 = w2.y - w1.y;
		    t2 = w3.y - w1.y;
		    
		    r = 1 / ( s1 * t2 - s2 * t1 );
		    
		    sdir.set(
			( t2 * x1 - t1 * x2 ) * r,
			( t2 * y1 - t1 * y2 ) * r,
			( t2 * z1 - t1 * z2 ) * r
		    );
		    
		    tdir.set(
			( s1 * x2 - s2 * x1 ) * r,
			( s1 * y2 - s2 * y1 ) * r,
			( s1 * z2 - s2 * z1 ) * r
		    );
		    
		    tan1[a].add( sdir );
		    tan1[b].add( sdir );
		    tan1[c].add( sdir );
		    
		    tan2[a].add( tdir );
		    tan2[b].add( tdir );
		    tan2[c].add( tdir );
		}
		
		for( i = 0, il = vertices.length; i < il; i++ ){
		    vertex = vertices[i];
		    
		    t.copy( tan1[i] );
		    
		    n.copy( normals[i] );
		    tmp1.copy( t );
		    tmp1.sub( n.smul( n.dot( t ) ) ).norm();
		    
		    n.copy( normals[i] );
		    tmp2.vcross( n, t );
		    
		    w = ( tmp2.dot( tan2[i] ) < 0 ) ? -1 : 1;
		    
		    tangents[i] = new Vec4( tmp1.x, tmp1.y, tmp1.z, w );
		}
		
		this.tangentsNeedsUpdate = true;
	    };
        }();
	
	
	Geometry.prototype.mergeVertices = function(){
	    var round = Math.round, dif,
		vertices = this.vertices, vertex,
		colors = this.colors, color,
		uvs = this.uv, uv,
                faces = this.faces, face,
                i, il, vertexMap = {}, key,
		uniqueVertex = [], uniqueUv = [], uniqueColors = [], changes = [];
            
            for( i = 0, il = vertices.length; i < il; i++ ){
                vertex = vertices[i];
		color = colors[i];
                uv = uvs[i];
                key = [ round( vertex.x * 1000 ), round( vertex.y * 1000 ), round( vertex.z * 1000 ) ].join("_");
                
                if( vertexMap[ key ] === undefined ){
		    
                    vertexMap[ key ] = i;
                    uniqueVertex.push( vertex );
		    if( !!color ) uniqueColors.push( color );
		    if( !!uv ) uniqueUv.push( uv );
		    changes[ i ] = uniqueVertex.length - 1;
                }
                else{
		    changes[ i ] = changes[ vertexMap[ key ] ];
                }
            }
	    
	    for( i = 0, il = faces.length; i < il; i++ ){
		face = faces[i];
		
		face.a = changes[ face.a ];
		face.b = changes[ face.b ];
		face.c = changes[ face.c ];
	    }
	    
	    dif = uniqueVertex.length - vertices.length;
	    
	    this.vertices.length = this.colors.length = this.uv.length = 0;
	    
            this.vertices.push.apply( this.vertices, uniqueVertex );
            this.colors.push.apply( this.colors, uniqueColors );
            this.uv.push.apply( this.uv, uniqueUv );
	    
            this.calculateNormals();
	    
	    this.verticesNeedsUpdate = true;
	    this.facesNeedsUpdate = true;
	    this.colorsNeedsUpdate = true;
	    this.uvNeedsUpdate = true;
	    
	    return dif;
        };
	
        
        Geometry.prototype.addQuad = function( a, b, c, d, uvs ){
	    var index = this.vertices.length,
		va = a.clone(), vb = b.clone(), vc = c.clone(), vd = d.clone(),
		
		faceA = new Face( index, index+1, index+2 ),
		faceB = new Face( index, index+2, index+3 );
	    
	    if( !uvs || !uvs.length || uvs.length != 4 ){
		uvs = [ 0, 1, 0, 1 ];
	    }
	    
	    this.uv.push(
		new Vec2( uvs[1], uvs[2] ),
		new Vec2( uvs[0], uvs[2] ),
		new Vec2( uvs[0], uvs[3] ),
		new Vec2( uvs[1], uvs[3] )
	    );
	    
	    this.colors.push(
		new Vec3( uvs[1], uvs[2], 0 ),
		new Vec3( uvs[0], uvs[2], 0 ),
		new Vec3( uvs[0], uvs[3], 0 ),
		new Vec3( uvs[1], uvs[3], 0 )
	    );
	    
	    this.vertices.push( va, vb, vc, vd );
	    
	    this.faces.push( faceA, faceB );
	    
	    this.calculateNormals();
	    
	    this.verticesNeedsUpdate = true;
	    this.facesNeedsUpdate = true;
	    this.colorsNeedsUpdate = true;
	    this.uvNeedsUpdate = true;
	};
	
    
        return Geometry;
    }
);