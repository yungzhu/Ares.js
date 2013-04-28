// requires r.js and node.js
// r.js -o build.js

({
    baseUrl: "src",
  
    include: [
        "ares",
    ],

    out: "build/ares.js",
    
    optimize: "uglify",
    
    preserveLicenseComments: false,
    
    uglify: {
        no_mangle: true
    }
})