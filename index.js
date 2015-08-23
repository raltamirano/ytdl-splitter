var fs = require('fs');
var program = require('commander');
var Splitter = require('ytdl-splitter-core');

program
    .usage('[options] <video_url>')
    .option('-c, --cue-file [file]', 'Use the specified .CUE file as the tracklist')
    .option('-d, --tracklist-data [file]', 'Use the specified text file as the source for tracklist extraction')
    .option('-t, --album-name [album name]', 'Album name')
    .option('-a, --artist-name [artist name]', 'Album artist(s)')
    .option('-y, --album-year [album year]', 'Album year')
    .parse(process.argv);

if (program.args.length != 1)
	throw 'You must specify the URL of the video to download/split only!';

var url = program.args[0];
var options = {};

var splitter = new Splitter();
splitter.on('ready', function() {
    console.log('Ready to download and split videos!');
});

splitter.on('start', function(info) {
    console.log(info.url, ' is about to be downloaded then splitted!');
});

splitter.on('end', function(info) {
    console.log(info.url, 'was downloaded then splitted to files at:', info.outputPath);
});

splitter.on('message', function(message) {
    console.log(message);
});

splitter.on('error', function(error) {
    console.log('While processing', error.url, 'we had the following problems:', JSON.stringify(error));
});


if (program.cueFile && program.tracklistData)
	throw 'You should use either "--cue-file [file]" or "--tracklist-data" options but not both!';

if (program.cueFile)
    splitter.addCUETracklistExtractor(program.cueFile);

if (program.tracklistData)
	options.tracklistData = fs.readFileSync(program.tracklistData, 'utf8');
if (program.albumName)
    options.albumName = program.albumName;
if (program.artistName)
    options.artistName = program.artistName;
if (program.albumYear)
    options.albumYear = program.albumYear;

splitter.split(url, options);
