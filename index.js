var fs = require('fs');
var os = require('os');
var path = require('path');
var youtubedl = require('youtube-dl');
var core = require('./handlerMP3File/handler-file.js');
var program = require('commander');
var cueParser  = require('cue-parser');

program
  .option('-c, --cue-file [file]', 'Use the specified .CUE file as the tracklist')
  .parse(process.argv);

if (program.args.length != 1)
	throw 'At least, you must specify the URL of the video to download/split!';

if (program.cueFile)
    core.addCUETracklistExtractor(program.cueFile);

var url = program.args[0];
console.log('Video URL: ' + url);

var options = [];
youtubedl.getInfo(url, options, function(err, info) {
	if (err) throw err;

	// Let's somehow extract a tracklist from the video information we got,
	// then extract each song as a separate audio file.
    var videoContext = {
        "description": info.description,
        "duration": info.duration,
        "durationInSecs": core.momentToSeconds(info.duration)
    };

    if (program.cueFile)
        videoContext.cueFile = program.cueFile;

	core.extractTracklist(videoContext, function(tracklist) {
		if (!tracklist || !tracklist.tracks || tracklist.tracks.length <= 0)
				throw 'No tracklist could be inferred/read!';

		var video = new youtubedl(url);
		var inputFileRoot = path.join(os.tmpdir(), info._filename);
		fs.mkdirSync(inputFileRoot);
		var inputFile = path.join(inputFileRoot, info._filename);

		video.pipe(fs.createWriteStream(inputFile));

		video.on('end', function() {
			core.splitFileByTracklist(inputFile, tracklist, function(returnCode) {
				console.log('Finished!');
				process.exit(returnCode);
			});
		});
	});

});
