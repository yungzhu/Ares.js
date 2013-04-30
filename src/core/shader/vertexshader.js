define(
    function( require ){
        "use strict";
        
        
        var VertexShader = function( opts ){
            
            return [
                "precision "+ opts.precision +" float;",
                
                "uniform mat4 uMatrixProjection;",
                !opts.shading ? "uniform mat4 uMatrixModelView;" : "",
                opts.shading ? "uniform mat4 uMatrixView;" : "",
                opts.shading ? "uniform mat4 uMatrixModel;" : "",
                opts.shading ? "uniform mat3 uMatrixNormal;" : "",
                
                "attribute vec3 aVertexPosition;",
                opts.textures ? "attribute vec2 aVertexUv;" : "",
                opts.vertexColors ? "attribute vec3 aVertexColor;" : "",
                opts.shading ? "attribute vec3 aVertexNormal;" : "",
                opts.shading && opts.tangents ? "attribute vec4 aVertexTangent;" : "",
                
                opts.shading ? "varying vec3 vVertexPosition;" : "",
                opts.textures ? "varying vec2 vVertexUv;" : "",
                !opts.textures && opts.vertexColors ? "varying vec3 vVertexColor;" : "",
                opts.shading ? "varying vec3 vVertexNormal;" : "",
                
                opts.shading && opts.tangents ? "varying vec3 vVertexTangent;" : "",
                opts.shading && opts.tangents ? "varying vec3 vVertexBinormal;" : "",
                
                "void main(){",
                    
                    opts.vertexColors ? "vVertexColor = aVertexColor;" : "",
                    opts.shading ? "vVertexNormal = uMatrixNormal * aVertexNormal;" : "",
                    
                    opts.shading && opts.tangents ? "vVertexTangent = normalize( uMatrixNormal * aVertexTangent.xyz );" : "",
                    opts.shading && opts.tangents ? "vVertexBinormal = normalize( cross( vVertexNormal, vVertexTangent ) * aVertexTangent.w );" : "",
                    
                    opts.textures ? "vVertexUv = aVertexUv.st;" : "",
                    
                    opts.shading ? "vVertexPosition = vec3( uMatrixView * uMatrixModel * vec4( aVertexPosition, 1.0 ) );" : "",
                    
                    opts.shading ? "gl_Position = uMatrixProjection * vec4( vVertexPosition, 1.0 );" : "",
                    !opts.shading ? "gl_Position = uMatrixProjection * uMatrixModelView * vec4( aVertexPosition, 1.0 );" : "",
                    
                "}"
            ].join("\n");
        };
        
        
        return VertexShader;
    }
);