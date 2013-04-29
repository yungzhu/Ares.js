require(
    {
	baseUrl: "../../src/"
    },
    [
	"ares"
    ],
    function( Ares ){
	
	Ares.globalize();
	
	game = new Game();
	
	game.on("init", function(){
	    var vec2_1 = new Vec3;
	    
	    scene = new Scene();
            
            this.addScene( scene );
            this.setScene( scene );
	    
	    camera = new GameObject({
                position: new Vec3( 0, -5, 1 ),
                components: [
                    new Camera
                ]
            });
	    camera.lookAt( vec2_1.set( 0, 0, 0 ) );
	    
	    this.scene.add( camera );
            this.scene.setCamera( camera );
	});
	
	
	game.init();
    }
);