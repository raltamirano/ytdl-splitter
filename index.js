var fs = require('fs');
var os = require('os');
var path = require('path');
var youtubedl = require('youtube-dl');
var handlerFile = require('./handlerMP3File/handler-file.js');

if (process.argv.length < 3)
	throw 'At least, you must specify the URL of the video to download/split!';

var url = process.argv[2];
console.log('Video URL: ' + url);

var options = [];
youtubedl.getInfo(url, options, function(err, info) {
	if (err) throw err;

	// Let's analyze the video's description trying to extract a tracklist from it,
	// then extract each song as a separate audio file.
	handlerFile.extractTracklist(info.description, info.duration, function(tracklist) {
		if (!tracklist || !tracklist.tracks || tracklist.tracks.length <= 0)
				throw 'No tracklist could be inferred/read!';

		var video = new youtubedl(url);
		var inputFile = path.join(os.tmpdir(), info._filename);

		video.pipe(fs.createWriteStream(inputFile));

		video.on('end', function() {
			handlerFile.splitFileByTracklist(inputFile, tracklist, function(returnCode) {
				console.log('Finished!');
				process.exit(returnCode);
			});
		});
	});
});

