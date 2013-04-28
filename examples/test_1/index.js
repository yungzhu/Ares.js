require(
    {
	baseUrl: "../../src/"
    },
    [
	"ares"
    ],
    function( Ares ){
	
	Ares.globalize();
	
	speedTest("test name", 1000, function(){
	    
	});
	
	(function animate(){
	    Time.start();
	    Device.requestAnimFrame.call( window, animate );
	    Time.end();
	}());
    }
);