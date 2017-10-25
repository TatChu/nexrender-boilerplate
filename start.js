'use strict';

/**
 * Parameters for rendering
 */
let mixfile = 'nby.mp3';
let background = 'cutegirl.jpg';
let datascript = '2016-aug-deep.js';
let duration = 6000; // set max duration for 1 minute (equal to audio length)

let aepxfile = 'template.aepx';
let audio = 'mp3';

/**
 * Settings for renderer
 * DONT FORGET TO CHANGE aebinary ACCORDING TO YOUR SYSTEM
 * On Windows might look like: 'C:\\Program Files\\Adobe\\After Effects CC\\aerender.exe'
 */
const aebinary = '/Applications/Adobe After Effects CC 2015/aerender';
const port = 23234;

/**
 * Dependencies
 */
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const Project = require('nexrender').Project;
const renderer = require('nexrender').renderer;

/**
 * HTTP server
 */
let server = http.createServer((req, res) => {

    let uri = url.parse(req.url).pathname;
    let filename = path.join(process.cwd(), uri);

    fs.exists(filename, (exists) => {
        if (!exists) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.write("404 Not Found\n");

            return res.end();
        }

        fs.readFile(filename, "binary", function (err, file) {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.write(err + "\n");
                return res.end();
            }

            // send 200
            res.writeHead(200);
            res.write(file, "binary");
            return res.end();
        });
    });
});

/**
 * Renderer
 */
server.listen(port, () => {

    console.log('Started local static server at port:', port);

    // addtional info about configuring project can be found at:
    // https://github.com/Inlife/nexrender/wiki/Project-model
    let project = new Project({
        "template": "project.aepx",
        "composition": "main",
        "type": "default",
        "settings": {
            // dont forget to setup the right output module; info:
            // https://helpx.adobe.com/after-effects/using/basics-rendering-exporting.html#output_modules_and_output_module_settings
            // "outputModule": "h264",
            "startFrame": 0,
            "endFrame": duration,
            "outputExt": "mov"
        },
        "assets": [
            { "type": "project", "name": "project.aepx", "src": `http://localhost:${port}/assets/${aepxfile}` },
            { "type": "image", "name": "background.jpg", "src": `http://localhost:${port}/assets/${background}`, "filters": [{ "name": "cover", "params": [1280, 720] }] },
            { "type": "image", "name": "logo_production.png", "src": `http://localhost:${port}/assets/bizzon.png` },
            { "type": "image", "name": "nm.png", "src": `http://localhost:${port}/assets/nm.png` },
            { "type": "audio", "name": `audio.${audio}`, "src": `http://localhost:${port}/assets/${mixfile}` },
            { "type": "script", "name": "data.js", "src": `http://localhost:${port}/assets/${datascript}` }
        ]
    });
    
    // console.log(project);
    console.time("render time: ");
    // start rendering
    renderer.render(aebinary, project).then(() => {
        // success
        console.time("render time: ");
        server.close();
    }).catch((err) => {
        // error
        console.error(err);
        server.close();
    });

});
