require(
    {
	baseUrl: "../../src/"
    },
    [
	"ares"
    ],
    function( Ares ){
	
	Ares.globalize();
	
	game = new Game({
            sources: {
                geo_level: "../content/geometry/level.js",
                img_sprite: "../content/images/sprite.png",
            },
            debug: true,
            width: 960,
            height: 640
        });
	
	game.on("init", function(){
	    var vec3_1 = new Vec3,
		vec3_2 = new Vec3;
	    
	    scene = new Scene;
            
            this.addScene( scene );
            this.setScene( scene );
	    
	    camera = new GameObject({
                position: new Vec3( 0, -5, 1 ),
                components: [
                    new Camera
                ]
            });
	    camera.lookAt( vec3_2.set(0,0,0) );
	    
	    ball = new GameObject({
                position: new Vec3( 0, 0, 1 ),
                components: [
                    new Mesh({
			geometry: Assets.get("geo_level"),
			material: new Material
		    })
                ]
            });
	    
	    this.scene.add( ball, camera );
            this.scene.setCamera( camera );
	});
    }
);