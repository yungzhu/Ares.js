define(
    function( require ){
        "use strict";
        
        
        var fragmentTextureUniforms = function( opts ){
            return [
                opts.diffuseMap ? "uniform sampler2D uDiffuseMap;" : "",
                opts.alphaMap ? "uniform sampler2D uAlphaMap;" : "",
                
                opts.shading && opts.specularMap ? "uniform sampler2D uSpecularMap;" : "",
                opts.shading && opts.emitMap ? "uniform sampler2D uEmitMap;" : "",
                
                opts.shading && opts.normalMap ? "uniform sampler2D uNormalMap;" : "",
            ].join("\n");
        },
        
        fragmentShadingUniforms = function( opts ){
            return [
                "uniform mat4 uMatrixView;",
                
                !opts.specularMap ? "uniform vec3 uSpecular;" : "",
                "uniform vec3 uAmbient;",
                "uniform float uHardness;",
                "uniform float uEmissive;",
                
                opts.pointLights > 0 ? "uniform vec3 uPointLight_position["+ opts.pointLights +"];" : "",
                opts.pointLights > 0 ? "uniform vec3 uPointLight_color["+ opts.pointLights +"];" : "",
                opts.pointLights > 0 ? "uniform vec3 uPointLight_attenuation["+ opts.pointLights +"];" : "",
                
                opts.dirLights > 0 ? "uniform vec3 uDirLight_direction["+ opts.dirLights +"];" : "",
                opts.dirLights > 0 ? "uniform vec3 uDirLight_color["+ opts.dirLights +"];" : "",
                
                opts.spotLights > 0 ? "uniform vec3 uSpotLight_direction["+ opts.spotLights +"];" : "",
                opts.spotLights > 0 ? "uniform vec3 uSpotLight_position["+ opts.spotLights +"];" : "",
                opts.spotLights > 0 ? "uniform vec3 uSpotLight_color["+ opts.spotLights +"];" : "",
                
                opts.hemiLights > 0 ? "uniform vec3 uHemiLight_direction["+ opts.hemiLights +"];" : "",
                opts.hemiLights > 0 ? "uniform vec3 uHemiLight_color["+ opts.hemiLights +"];" : "",
            ].join("\n");
        },
        
        fragmentLighting = function( opts ){
            return [
                
                "vec3 lightPos, normal, distance, lightDir, eyeDir, reflectDir, difLight, specLight;",
                "float d, att;",
                
                opts.normalMap ? "normal = normalize( texture2D( uNormalMap, vVertexUv ).xyz * 2.0 - 1.0 );" : "",
                
                opts.normalMap && opts.tangents ? "mat3 tsb = mat3( normalize( vVertexTangent ), normalize( vVertexBinormal ), normalize( vVertexNormal ) );" : "",
                opts.normalMap && opts.tangents ? "normal = tsb * normal;" : "",
                
                !opts.normalMap ? "normal = normalize( vVertexNormal );" : "",
                
                "eyeDir = normalize( -vVertexPosition );",
                
                opts.pointLights > 0 ? fragmentPointLights( opts ) : "",
                
                opts.dirLights > 0 ? fragmentDirLights( opts ) : "",
                
                opts.hemiLights > 0 ? fragmentHemiLights( opts ) : "",
                
                "finalLight += uAmbient + uEmissive;",
                
            ].join("\n");
        },
        
        fragmentPointLights = function( opts ){
            return [
                "for( int i = 0; i < "+ opts.pointLights +"; i++ ){",
                    "lightPos = vec3( uMatrixView * vec4( uPointLight_position[i], 1.0 ) );",
                    
                    "distance = lightPos - vVertexPosition;",
                    
                    "lightDir = normalize( distance );",
                    
                    "d = length( distance );",
                    "att = 1.0 / ( uPointLight_attenuation[i].x + ( uPointLight_attenuation[i].y * d ) + ( uPointLight_attenuation[i].z * d * d ) );",
                    
                    "reflectDir = reflect( -lightDir, normal );",
                    
                    "diffuseLight += att * uPointLight_color[i] * max( dot( lightDir, normal ), 0.0 );",
                    "specularLight += att * uPointLight_color[i] * pow( max( dot( reflectDir, eyeDir ), 0.0 ), uHardness );",
                "}",
            ].join("\n");
        },
        
        fragmentDirLights = function( opts ){
            return [
                "for( int i = 0; i < "+ opts.dirLights +"; i++ ){",
                    "lightDir = normalize( vec3( uMatrixView * vec4( uDirLight_direction[i], 0.0 ) ) );",
                    
                    "reflectDir = reflect( -lightDir, normal );",
                    
                    "diffuseLight += uDirLight_color[i] * max( dot( lightDir, normal ), 0.0 );",
                    "specularLight += uDirLight_color[i] * pow( max( dot( reflectDir, eyeDir ), 0.0 ), uHardness );",
                "}",
            ].join("\n");
        },
        
        fragmentHemiLights = function( opts ){
            return [
                "for( int i = 0; i < "+ opts.hemiLights +"; i++ ){",
                    "lightDir = normalize( vec3( uMatrixView * vec4( uHemiLight_direction[i], 0.0 ) ) );",
                    "reflectDir = reflect( -lightDir, normal );",
                    
                    "diffuseLight += uHemiLight_color[i] * max( 0.5 * dot( lightDir, normal ) + 0.5, 0.0 );",
                    "specularLight += uHemiLight_color[i] * pow( max( 0.5 * dot( reflectDir, eyeDir ) + 0.5, 0.0 ), uHardness );",
                "}",
            ].join("\n");
        },
        
        FragmentShader = function( opts ){
            
            return [
                opts.standard_derivatives && ( opts.bumpMap || opts.normalMap ) ? "#extension GL_OES_standard_derivatives : enable" : "",
                "precision "+ opts.precision +" float;",
                
                opts.shading ? "varying vec3 vVertexPosition;" : "",
                opts.textures ? "varying vec2 vVertexUv;" : "",
                !opts.textures && opts.vertexColors ? "varying vec3 vVertexColor;" : "",
                opts.shading ? "varying vec3 vVertexNormal;" : "",
                
                opts.shading && opts.tangents ? "varying vec3 vVertexTangent;" : "",
                opts.shading && opts.tangents ? "varying vec3 vVertexBinormal;" : "",
                
                "uniform float uAlpha;",
                
                !opts.vertexColors && !opts.diffuseMap ? "uniform vec3 uDiffuse;" : "",
                
                !opts.vertexColors && opts.textures ? fragmentTextureUniforms( opts ) : "",
                
                opts.shading ? fragmentShadingUniforms( opts ) : "",
                
                "void main(){",
                    
                    !opts.vertexColors && !opts.diffuseMap ? "vec3 finalColor = uDiffuse;" : "",
                    opts.vertexColors && !opts.diffuseMap ? "vec3 finalColor = vVertexColor;" : "",
                    
                    opts.diffuseMap ? "vec3 finalColor = texture2D( uDiffuseMap, vVertexUv ).xyz;" : "",
                    
                    opts.diffuseMapAlpha && !opts.alphaMap ? "float finalAlpha = texture2D( uDiffuseMap, vVertexUv ).w;" : "",
                    !opts.diffuseMapAlpha && opts.alphaMap ? "float finalAlpha = length( texture2D( uAlphaMap, vVertexUv ).xyz );" : "",
                    !opts.diffuseMapAlpha && !opts.alphaMap ? "float finalAlpha = uAlpha;" : "",
                    
                    opts.shading ? "vec3 finalLight, diffuseLight, specularLight;" : "",
                    
                    opts.shading && opts.specularMap ? "vec3 specMap = texture2D( uSpecularMap, vVertexUv ).xyz;" : "",
                    opts.shading && opts.emitMap ? "vec3 emitMap = texture2D( uEmitMap, vVertexUv ).xyz;" : "",
                    
                    opts.shading ? fragmentLighting( opts ) : "",
                    
                    opts.shading && opts.specularMap ? "specularLight *= specMap;" : "",
                    opts.shading && !opts.specularMap ? "specularLight *= uSpecular;" : "",
                    opts.shading && opts.emitMap ? "diffuseLight += emitMap;" : "",
                    
                    opts.shading ? "finalLight += diffuseLight + specularLight;" : "",
                    
                    opts.shading ? "gl_FragColor = vec4( finalColor * finalLight, finalAlpha );" : "gl_FragColor = vec4( finalColor, finalAlpha );",
                    
                "}"
            ].join("\n");
        };
        
        
        return FragmentShader;
    }
);