var requirejs = require("requirejs");

requirejs(
    {
	baseUrl: __dirname +"/../../src",
	nodeRequire: require
    },
    [
	"ares"
    ],
    function( Ares ){
	
    }
);