if( typeof define !== "function" ){
    var define = require("amdefine")( module );
}
define([
	"base/class",
	"base/utils",
	"base/device",
	"core/canvas",
	"math/color",
	"math/vec3",
	"math/mat4",
	"core/components/light",
	"core/material/material",
	"core/shader/fragmentshader",
	"core/shader/vertexshader"
    ],
    function( Class, Utils, Device, Canvas, Color, Vec3, Mat4, Light, Material, FragmentShader, VertexShader ){
	"use strict";
	
	
        function Renderer( opts ){
            opts || ( opts = {} );
            
            Class.call( this );
            
            this.canvas = opts.canvas instanceof Canvas ? opts.canvas : new Canvas( opts.width, opts.height );
            
            this.autoClear = opts.autoClear !== undefined ? opts.autoClear : true;
	    
            this.context = Device.getWebGLContext( this.canvas.element, opts.attributes );
	    
	    this.stats = {
		vertices: 0,
		faces: 0,
		calls: 0
	    };
	    
	    this.ext = {
		texture_filter_anisotropic: undefined,
		texture_float: undefined,
		standard_derivatives: undefined,
		compressed_texture_s3tc: undefined
	    };
	    
	    this.gpu = {
		precision: "highp",
		maxAnisotropy: 16,
		maxTextures: 16,
		maxTextureSize: 16384,
		maxCubeTextureSize: 16384,
		maxRenderBufferSize: 16384
	    };
	    
	    this.getExtensions();
	    this.getGPUCapabilities();
	    
            this.setDefault();
        }
        
        Renderer.prototype = Object.create( Class.prototype );
        Renderer.prototype.constructor = Renderer;
        
        
        Renderer.prototype.getExtensions = function(){
	    var gl = this.context,
		ext = this.ext,
		
		texture_filter_anisotropic = gl.getExtension( "EXT_texture_filter_anisotropic" ) ||
		    gl.getExtension( "MOZ_EXT_texture_filter_anisotropic" ) ||
		    gl.getExtension( "WEBKIT_EXT_texture_filter_anisotropic" ),
		    
		compressed_texture_s3tc = gl.getExtension( "WEBGL_compressed_texture_s3tc" ) ||
		    gl.getExtension( "MOZ_WEBGL_compressed_texture_s3tc" ) ||
		    gl.getExtension( "WEBKIT_WEBGL_compressed_texture_s3tc" ),
		    
		standard_derivatives = gl.getExtension("OES_standard_derivatives"),
		
		texture_float = gl.getExtension("OES_texture_float");
		
	    ext.texture_filter_anisotropic = texture_filter_anisotropic;
	    ext.standard_derivatives = standard_derivatives;
	    ext.texture_float = texture_float;
	    ext.compressed_texture_s3tc = compressed_texture_s3tc;
        };
        
        
        Renderer.prototype.getGPUCapabilities = function(){
	    var gl = this.context,
		gpu = this.gpu, ext = this.ext,
	    
		VERTEX_SHADER = gl.VERTEX_SHADER,
		FRAGMENT_SHADER = gl.FRAGMENT_SHADER,
		HIGH_FLOAT = gl.HIGH_FLOAT,
		MEDIUM_FLOAT = gl.MEDIUM_FLOAT,
		LOW_FLOAT = gl.LOW_FLOAT,
		
		maxAnisotropy = ext.texture_filter_anisotropic ? gl.getParameter( ext.texture_filter_anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT ) : 1,
		
		maxTextures = gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS ),
		
		maxTextureSize = gl.getParameter( gl.MAX_TEXTURE_SIZE ),
		
		maxCubeTextureSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE ),
		
		maxRenderBufferSize = gl.getParameter( gl.MAX_RENDERBUFFER_SIZE ),
		
		vsHighpFloat = gl.getShaderPrecisionFormat( VERTEX_SHADER, HIGH_FLOAT ),
		vsMediumpFloat = gl.getShaderPrecisionFormat( VERTEX_SHADER, MEDIUM_FLOAT ),
		vsLowpFloat = gl.getShaderPrecisionFormat( VERTEX_SHADER, LOW_FLOAT ),
		
		fsHighpFloat = gl.getShaderPrecisionFormat( FRAGMENT_SHADER, HIGH_FLOAT ),
		fsMediumpFloat = gl.getShaderPrecisionFormat( FRAGMENT_SHADER, MEDIUM_FLOAT ),
		fsLowpFloat = gl.getShaderPrecisionFormat( FRAGMENT_SHADER, LOW_FLOAT ),
		
		highpAvailable = vsHighpFloat.precision > 0 && fsHighpFloat.precision > 0,
		mediumpAvailable = vsMediumpFloat.precision > 0 && fsMediumpFloat.precision > 0,
		
		precision = "highp";
	    
	    if( !highpAvailable || Device.isMobile ){
		if( mediumpAvailable ){
		    precision = "mediump";
		}
		else{
		    precision = "lowp";
		}
	    }
	    
	    gpu.precision = precision;
	    gpu.maxAnisotropy = maxAnisotropy;
	    gpu.maxTextures = maxTextures;
	    gpu.maxTextureSize = maxTextureSize;
	    gpu.maxCubeTextureSize = maxCubeTextureSize;
	    gpu.maxRenderBufferSize = maxRenderBufferSize;
        };
        
        
        Renderer.prototype.setDefault = function(){
	    var gl = this.context;
	    
	    gl.clearColor( 0, 0, 0, 1 );
	    gl.clearDepth( 1 );
	    gl.clearStencil( 0 );
	    
	    gl.enable( gl.DEPTH_TEST );
	    gl.depthFunc( gl.LEQUAL );
	    
	    gl.frontFace( gl.CCW );
	    gl.cullFace( gl.BACK );
	    gl.enable( gl.CULL_FACE );
	    
	    gl.enable( gl.BLEND );
	    gl.blendEquation( gl.FUNC_ADD );
	    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
	};
        
        
        Renderer.prototype.setClearColor = function( color ){
            var gl = this.context;
            
            if( color ){
                gl.clearColor( color.r, color.g, color.b, color.a );
            }
            else{
                gl.clearColor( 0, 0, 0, 1 );
            }
	};
	
        
        Renderer.prototype.clear = function(){
            var gl = this.context;
	    
            gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );
	};
        
        
        Renderer.prototype.setBlending = function(){
	    var lastBlending, gl;
	    
	    return function( blending ){
		gl = this.context;
		
		if( blending !== lastBlending ){
		    
		    switch( blending ){
			case Material.none:
			    gl.disable( gl.BLEND );
			    break;
			
			case Material.additive:
			    gl.enable( gl.BLEND );
			    gl.blendEquation( gl.FUNC_ADD );
			    gl.blendFunc( gl.SRC_ALPHA, gl.ONE );
			    break;
			
			case Material.subtractive:
			    gl.enable( gl.BLEND );
			    gl.blendEquation( gl.FUNC_ADD );
			    gl.blendFunc( gl.ZERO, gl.ONE_MINUS_SRC_COLOR );
			    break;
			
			case Material.multiply:
			    gl.enable( gl.BLEND );
			    gl.blendEquation( gl.FUNC_ADD );
			    gl.blendFunc( gl.ZERO, gl.SRC_COLOR );
			    break;
			
			default:
			    gl.enable( gl.BLEND );
			    gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
			    gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );
			    break;
		    }
		    
		    lastBlending = blending;
		}
	    };
	}();
        
        
        Renderer.prototype.setDepthTest = function(){
	    var lastDepthTest, gl;
	    
	    return function( depthTest ){
		gl = this.context;
		
		if( depthTest !== lastDepthTest ){
		    
		    if( depthTest ){
			gl.enable( gl.DEPTH_TEST );
		    }
		    else{
			gl.disable( gl.DEPTH_TEST );
		    }
		    
		    lastDepthTest = depthTest;
		}
	    };
	}();
        
        
        Renderer.prototype.setDepthWrite = function(){
	    var lastDepthWrite, gl;
	    
	    return function( depthWrite ){
		gl = this.context;
		
		if( depthWrite !== lastDepthWrite ){
		    
		    gl.depthMask( depthWrite );
		    lastDepthWrite = depthWrite;
		}
	    };
	}();
        
        
        Renderer.prototype.setLineWidth = function(){
	    var lastLineWidth, gl;
	    
	    return function( width ){
		gl = this.context;
		
		if( width !== lastLineWidth ){
		    
		    gl.lineWidth( width );
		    lastLineWidth = width;
		}
	    };
	}();
	
        
        Renderer.prototype.clearStats = function(){
            var stats = this.stats;
	    
	    stats.vertices = 0;
	    stats.faces = 0;
	    stats.calls = 0;
	};
        
        
        Renderer.prototype.render = function(){
	    var lastScene, lastCamera;
	    
	    return function( scene ){
		var gl = this.context,
		    camera = scene.camera,
		    stats = this.stats,
		    meshes = scene._meshes,
		    mesh, gameObject, i, il;
		
		this.clearStats();
		
		if( lastScene !== scene ){
		    
		    this.setClearColor( scene.world.background );
		    
		    lastScene = scene;
		}
		if( lastCamera !== camera ){
		    
		    camera.setSize( this.canvas.width, this.canvas.height );
		    gl.viewport( 0, 0, this.canvas.width, this.canvas.height );
		    
		    if( this.canvas.fullScreen ){
			this.canvas.on("resize", function(){
			    camera.setSize( this.width, this.height );
			    gl.viewport( 0, 0, this.width, this.height );
			});
		    }
		    
		    lastCamera = camera;
		}
		
		if( this.autoClear ){
		    this.clear();
		}
		
		for( i = 0, il = meshes.length; i < il; i++ ){
		    mesh = meshes[i];
		    
		    if( mesh && mesh.material.visible ){
			gameObject = mesh.gameObject;
			
			this.setupMatrices( gameObject, camera );
			this.renderMesh( mesh, camera, scene );
		    }
		}
	    };
        }();
        
	
	var lastProgram;
	
        Renderer.prototype.renderParticleEmitter = function(){
	    var lastTexture,
		vec3 = new Vec3();
	    
	    return function( particleEmitter, camera ){
		var gl = this.context,
		    stats = this.stats,
		    gameObject = particleEmitter.gameObject,
		    particles = particleEmitter.particles,
		    defaults = this.defaults,
		    vertexBuffer = defaults.particleBuffers.vertexBuffer,
		    uvBuffer = defaults.particleBuffers.uvBuffer,
		    shader = defaults.particleShader,
		    attributes = shader.attributes,
		    uniforms = shader.uniforms,
		    program = shader.program,
		    texture = particleEmitter.texture,
		    particle, position, color, i, j, il;
		
		
		if( lastProgram !== program ){
		    
		    gl.useProgram( program );
		    lastProgram = program;
		}
		if( lastTexture !== texture ){
		    
		    this.initTexture( texture );
		    
		    gl.activeTexture( gl.TEXTURE0 );
		    gl.bindTexture( gl.TEXTURE_2D, texture.data );
		    gl.uniform1i( uniforms.uDiffuse, 0 );
		    
		    lastTexture = texture;
		}
		
		gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
		gl.enableVertexAttribArray( attributes.aVertexPosition );
		gl.vertexAttribPointer( attributes.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer );
		gl.enableVertexAttribArray( attributes.aVertexUv );
		gl.vertexAttribPointer( attributes.aVertexUv, 2, gl.FLOAT, false, 0, 0 );
		
		gl.uniformMatrix4fv( uniforms.uMatrixProjection, false, camera.matrixProjection.elements );
		gl.uniformMatrix4fv( uniforms.uMatrixModelView, false, particleEmitter.matrix.elements );
		
		for( i = 0, il = particles.length; i < il; i++ ){
		    particle = particles[i];
		    position = particle.position;
		    color = particle.color;
		    
		    gl.uniform4f( uniforms.uColor, color.r, color.g, color.b, particle.alpha );
		    gl.uniform3f( uniforms.uPosition, position.x, position.y, position.z );
		    gl.uniform1f( uniforms.uSize, particle.size );
		    
		    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
		    
		    stats.calls++;
		}
	    };
	}();
        
	
        Renderer.prototype.renderMesh = function(){
	    var lastMaterial, lastGeometry;
	    
	    return function( mesh, camera, scene ){
		var gl = this.context,
		    stats = this.stats,
		    gameObject = mesh.gameObject,
		    geometry = mesh.geometry,
		    material = mesh.material,
		    shader = material.shader,
		    program = shader.program;
		
		geometry.initBuffers( gl );
		this.initMeshShader( mesh, scene );
		
		if( lastProgram !== program ){
		    
		    gl.useProgram( program );
		    lastProgram = program;
		}
		
		if( lastGeometry !== geometry ){
		    
		    this.bindGeometryBuffers( shader, geometry );
		    lastGeometry = geometry;
		}
		
		if( lastMaterial !== material ){
		    
		    this.setupMeshMaterial( shader, material, scene.world );
		    lastMaterial = material;
		}
		
		this.setupMeshMatrices( shader, gameObject, camera );
		this.setupMeshLightUniforms( shader, scene );
		
		gl.drawElements( gl.TRIANGLES, geometry.faces.length * 3, gl.UNSIGNED_SHORT, 0 );
		
		stats.vertices += geometry.vertices.length;
		stats.faces += geometry.faces.length;
		stats.calls++;
	    };
        }();
        
        
        Renderer.prototype.setupMatrices = function(){
	    var vec3 = new Vec3();
	    
	    return function( gameObject, camera ){
		
		if( gameObject.needsUpdate ){
		    
		    vec3.getPositionMat4( gameObject.matrixWorld );
		    vec3.applyProjection( camera.matrixProjectionScreen );
		    
		    gameObject.z = vec3.z;
		    
		    gameObject.matrixModelView.mmul( camera.matrixWorldInverse, gameObject.matrixWorld );
		    gameObject.matrixNormal.getInverseMat4( gameObject.matrixModelView ).transpose();
		    
		    gameObject.needsUpdate = false;
		}
	    };
	}();
	
        
        Renderer.prototype.bindGeometryBuffers = function( shader, geometry ){
	    var gl = this.context,
		opts = shader.opts,
		attributes = shader.attributes,
                buffers = geometry.buffers,
		name, buffers,
                ARRAY_BUFFER = gl.ARRAY_BUFFER,
		ELEMENT_ARRAY_BUFFER = gl.ELEMENT_ARRAY_BUFFER,
		FLOAT = gl.FLOAT;
		
            gl.bindBuffer( ARRAY_BUFFER, buffers.vertices );
            gl.enableVertexAttribArray( attributes.aVertexPosition );
            gl.vertexAttribPointer( attributes.aVertexPosition, 3, FLOAT, false, 0, 0 );
	    
            if( opts.shading && !!buffers.normals ){
                gl.bindBuffer( ARRAY_BUFFER, buffers.normals );
                gl.enableVertexAttribArray( attributes.aVertexNormal );
                gl.vertexAttribPointer( attributes.aVertexNormal, 3, FLOAT, false, 0, 0 );
            }
	    
            if( opts.shading && opts.normalMap && opts.tangents && !!buffers.tangents ){
                gl.bindBuffer( ARRAY_BUFFER, buffers.tangents );
                gl.enableVertexAttribArray( attributes.aVertexTangent );
                gl.vertexAttribPointer( attributes.aVertexTangent, 4, FLOAT, false, 0, 0 );
            }
            
            if( !opts.vertexMap && opts.vertexColors && !!buffers.colors ){
                gl.bindBuffer( ARRAY_BUFFER, buffers.colors );
                gl.enableVertexAttribArray( attributes.aVertexColor );
                gl.vertexAttribPointer( attributes.aVertexColor, 3, FLOAT, false, 0, 0 );
            }
            
            if( opts.textures && !!buffers.uv ){
                gl.bindBuffer( ARRAY_BUFFER, buffers.uv );
                gl.enableVertexAttribArray( attributes.aVertexUv );
                gl.vertexAttribPointer( attributes.aVertexUv, 2, FLOAT, false, 0, 0 );
            }
            
            gl.bindBuffer( ELEMENT_ARRAY_BUFFER, buffers.indices );
        };
	
	
	Renderer.prototype.setupMeshMatrices = function( shader, gameObject, camera ){
            var gl = this.context,
		opts = shader.opts,
                uniforms = shader.uniforms;
	    
            gl.uniformMatrix4fv( uniforms.uMatrixProjection, false, camera.matrixProjection.elements );
            
	    if( opts.shading ){
		
		gl.uniformMatrix4fv( uniforms.uMatrixView, false, camera.matrixWorldInverse.elements );
		
		gl.uniformMatrix4fv( uniforms.uMatrixModel, false, gameObject.matrixWorld.elements );
		
		gl.uniformMatrix3fv( uniforms.uMatrixNormal, false, gameObject.matrixNormal.elements );
	    }
	    else{
		gl.uniformMatrix4fv( uniforms.uMatrixModelView, false, gameObject.matrixModelView.elements );
	    }
        };
        
        
        Renderer.prototype.setupMeshMaterial = function(){
	    var difColor = new Color(),
		specColor = new Color(),
		ambientColor = new Color(),
		gl;
		
	    function bindTexture( renderer, texture, uniform, index ){
		gl = renderer.context;
		renderer.initTexture( texture );
		
		gl.activeTexture( gl.TEXTURE0 + index );
		gl.bindTexture( gl.TEXTURE_2D, texture.data );
		gl.uniform1i( uniform, index );
	    }
	    
	    return function( shader, material, world ){
		var gl = this.context,
		    opts = shader.opts,
		    uniforms = shader.uniforms, name, uniform,
		    textureIndex = 0;
		
		this.setBlending( material.blending );
		this.setDepthTest( material.depthTest );
		this.setDepthWrite( material.depthWrite );
		
		for( name in uniforms ){
		    uniform = uniforms[ name ];
		    
		    switch( name ){
			case "uAlpha":
			    gl.uniform1f( uniform, material.alpha );
			    break;
			
			case "uDiffuse":
			    difColor.copy( material.diffuse );
			    gl.uniform3f( uniform, difColor.r, difColor.g, difColor.b );
			    break;
			
			case "uAmbient":
			    ambientColor.copy( world.ambient ).smul( material.ambient );
			    gl.uniform3f( uniform, ambientColor.r, ambientColor.g, ambientColor.b );
			    break;
			
			case "uSpecular":
			    specColor.copy( material.specular );
			    gl.uniform3f( uniform, specColor.r, specColor.g, specColor.b );
			    break;
			
			case "uEmissive":
			    gl.uniform1f( uniform, material.emissive );
			    break;
			
			case "uHardness":
			    gl.uniform1f( uniform, material.hardness );
			    break;
			
			case "uDiffuseMap":
			    bindTexture( this, material.diffuseMap, uniform, textureIndex );
			    textureIndex++;
			    break;
			
			case "uAlphaMap":
			    bindTexture( this, material.alphaMap, uniform, textureIndex );
			    textureIndex++;
			    break;
			
			case "uSpecularMap":
			    bindTexture( this, material.specularMap, uniform, textureIndex );
			    textureIndex++;
			    break;
			
			case "uEmitMap":
			    bindTexture( this, material.emitMap, uniform, textureIndex );
			    textureIndex++;
			    break;
			
			case "uNormalMap":
			    bindTexture( this, material.normalMap, uniform, textureIndex );
			    textureIndex++;
			    break;
		    }
		}
	    };
        }();
	

        Renderer.prototype.setupMeshLightUniforms = function(){
	    var matrix = new Mat4(),
		lightPos = new Vec3(),
		lightDir = new Vec3(),
		lightCol = new Color();
	    
	    return function( shader ){
		var gl = this.context,
		    opts = shader.opts,
		    uniforms = shader.uniforms,
		    i, il, light;
		
		if( opts.shading ){
		    
		    for( i = 0, il = scene._pointLights.length; i < il; i++ ){
			light = scene._pointLights[i];
			
			if( !!light ){
			    lightPos.getPositionMat4( light.gameObject.matrixWorld );
			    lightCol.copy( light.color ).smul( light.energy );
			    
			    gl.uniform3f( uniforms.uPointLight_position[i], lightPos.x, lightPos.y, lightPos.z );
			    gl.uniform3f( uniforms.uPointLight_attenuation[i], light.constant, light.linear, light.quadratic );
			    gl.uniform3f( uniforms.uPointLight_color[i], lightCol.r, lightCol.g, lightCol.b );
			}
		    }
		    
		    for( i = 0, il = scene._directionalLights.length; i < il; i++ ){
			light = scene._directionalLights[i];
			
			if( !!light ){
			    lightDir.set( 0, 0, 1 );
			    lightDir.applyMat4( matrix.extractRotation( light.gameObject.matrixWorld ) );
			    lightCol.copy( light.color ).smul( light.energy );
			    
			    gl.uniform3f( uniforms.uDirLight_direction[i], lightDir.x, lightDir.y, lightDir.z );
			    gl.uniform3f( uniforms.uDirLight_color[i], lightCol.r, lightCol.g, lightCol.b );
			}
		    }
		    
		    for( i = 0, il = scene._hemiLights.length; i < il; i++ ){
			light = scene._hemiLights[i];
			
			if( !!light ){
			    lightDir.set( 0, 0, 1 );
			    lightDir.applyMat4( matrix.extractRotation( light.gameObject.matrixWorld ) );
			    lightCol.copy( light.color ).smul( light.energy );
			    
			    gl.uniform3f( uniforms.uHemiLight_direction[i], lightDir.x, lightDir.y, lightDir.z );
			    gl.uniform3f( uniforms.uHemiLight_color[i], lightCol.r, lightCol.g, lightCol.b );
			}
		    }
		}
	    };
        }();
	
	
	Renderer.prototype.initEnvironment = function( texture ){
	    
	    if( texture.needsUpdate ){
		var gl = this.context;
		
		
	    }
        };
	
	
	Renderer.prototype.initTexture = function( texture ){
	    
	    if( texture.needsUpdate ){
		var gl = this.context,
		    ext = this.ext,
		    gpu = this.gpu,
		    
		    wrap, format,
		    
		    magFilter = gl.LINEAR,
		    minFilter = texture.mipMap ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR,
		    
		    anisotropy = Math.min( gpu.maxAnisotropy, texture.anisotropy );
                
                switch( texture.wrap ){
                    case Texture.repeat:
                        wrap = gl.REPEAT;
                    
                    case Texture.clamp:
                        wrap = gl.CLAMP_TO_EDGE;
                }
                
                switch( texture.format ){
                    case Texture.rgb:
                        format = gl.RGB;
                    
                    case Texture.rgba:
                        format = gl.RGBA;
                }
		
		texture.data = texture.data || gl.createTexture();
		
		gl.bindTexture( gl.TEXTURE_2D, texture.data );
		
		if( texture.flipY ){
		    gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
		}
		
		gl.texImage2D( gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, texture.image );
		
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter );
		
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap );
		
		if( !!ext.texture_filter_anisotropic ){
		    gl.texParameterf( gl.TEXTURE_2D, ext.texture_filter_anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy );
		}
		
		if( texture.mipMap ){
		    gl.generateMipmap( gl.TEXTURE_2D );
		}
		
		gl.bindTexture( gl.TEXTURE_2D, null );
		
		texture.needsUpdate = false;
	    }
        };
        
        
        Renderer.prototype.initMeshShader = function(){
	    var shaders = [];
	    
	    return function( mesh, scene ){
		var material = mesh.material;
		    
		if( material.needsUpdate ){
		    var gl = this.context,
			geometry = mesh.geometry,
			shader = material.shader,
			opts = shader.opts,
			
			used = false,
			other, i, il;
		    
		    this.getShaderOpts( material, geometry, scene );
		    
		    shader.vertex = VertexShader( opts );
		    shader.fragment = FragmentShader( opts );
		    
		    shader.src = shader.vertex +"\n"+ shader.fragment;
		    
		    for( i = 0, il = shaders.length; i < il; i++ ){
			other = shaders[i];
			
			if( shader.src === other.src ){
			    other.used++;
			    shader.program = other.program;
			    used = true;
			}
			else{
			    used = false;
			}
		    }
		    
		    if( !used ){
			shader.program = Device.createProgram( gl, shader.vertex, shader.fragment );
			
			shader.used++;
			shaders.push( shader );
		    }
		    
		    this.parseUniformsAttributes( shader );
		    
		    material.needsUpdate = false;
		}
	    };
	}();
	
	
	Renderer.prototype.parseUniformsAttributes = function(){
            var rAttribute = /attribute\s+([a-z]+\s+)?([A-Za-z0-9]+)\s+([a-zA-Z_0-9]+)\s*(\[\s*(.+)\s*\])?/,
                rUniform = /uniform\s+([a-z]+\s+)?([A-Za-z0-9]+)\s+([a-zA-Z_0-9]+)\s*(\[\s*(.+)\s*\])?/;
            
            return function( shader ){
                var gl = this.context,
		    src = shader.src,
		    lines = src.split("\n"),
                    line, i, il, j, jl, matchAttributes, matchUniforms, name, length;
                
                for( i = 0, il = lines.length; i < il; i++ ) {
                    line = lines[i];
                    matchAttributes = line.match( rAttribute );
                    matchUniforms = line.match( rUniform );
                    
                    if( !!matchAttributes ){
                        name = matchAttributes[3];
                        
                        shader.attributes[ name ] = gl.getAttribLocation( shader.program, name );
                    }
                    if( !!matchUniforms ){
                        name = matchUniforms[3];
                        length = parseInt( matchUniforms[5] );
                        
                        if( !!length ){
                            shader.uniforms[ name ] = [];
                            
                            for( j = 0, jl = length; j < jl; j++ ){
                                shader.uniforms[ name ][j] = gl.getUniformLocation( shader.program, name +"["+ j +"]" );
                            }
                        }
                        else{
                            shader.uniforms[ name ] = gl.getUniformLocation( shader.program, name );
                        }
                    }
                }
            };
        }();
	
	
	Renderer.prototype.getShaderOpts = function( material, geometry, scene ){
            var gl = this.context,
		opts = material.shader.opts;
                
            opts.precision = this.gpu.precision;
            opts.standard_derivatives = !!this.ext.standard_derivatives;
            
            opts.vertexColors = material.vertexColors;
	    
            opts.textures = !!material.diffuseMap || !!material.alphaMap || !!material.specularMap || !!material.emitMap || !!material.environment;
            
            opts.diffuseMap = !!material.diffuseMap;
            opts.diffuseMapAlpha = material.useDiffuseMapAlpha;
	    
            opts.alphaMap = !!material.alphaMap;
            opts.specularMap = !!material.specularMap;
            opts.emitMap = !!material.emitMap;
            opts.normalMap = !!material.normalMap && !Device.isMobile;
            
            opts.environmentMap = !!material.environment;
            
            opts.pointLights = scene._pointLights.length;
            opts.dirLights = scene._directionalLights.length;
            opts.spotLights = scene._spotLights.length;
            opts.hemiLights = scene._hemiLights.length;
            
            opts.shading = material.shading && !Device.isMobile;
            opts.tangents = !!geometry.tangents.length && !Device.isMobile;
            
            opts.vertexColor = !!geometry.colors.length && material.vertexColors;
        };
	
        
        return Renderer;
    }
);