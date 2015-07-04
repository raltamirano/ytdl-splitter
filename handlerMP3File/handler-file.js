var fs = require('fs');
var avconv = require('avconv');
var path = require('path');
var ChainOfResponsibility = require('chaining-tool');

exports.tracklistExtractors = new ChainOfResponsibility();

// Add built-in tracklist extractors.
exports.tracklistExtractors.add(function(context, next) {
	var EXTRACTOR_NAME = 'EXTRACTOR-1';
	var TIME_MODE_START = 's';
	var TIME_MODE_DURATION = 'd';
	var regex = /(.*?)((\d{1,2}:\d{1,2})(.{0,5}(\d{1,2}:\d{1,2}))?)(.*)/gi;

	console.log('Extractor "', EXTRACTOR_NAME, '" starting...');

	var match, title, time, timeMode, index = 0;
	while (match = regex.exec(context.videoContext.description)) {
		title = (match[1] + match[6]).trim().replace(/^[\-\s\:]*/, '');
		time = momentToSeconds(match[3].trim());

		if (index == 0)
			timeMode = (time == 0) ? TIME_MODE_START : TIME_MODE_DURATION;

		if (timeMode == TIME_MODE_START) {
			start = time
			end = null;
			if (index > 0)
				context.tracklist.tracks[index-1].end = start;
		} else {
			start = (index == 0) ? 0 : context.tracklist.tracks[index-1].end;
			end = (index == 0) ? time : context.tracklist.tracks[index-1].end + time;
		}

		context.tracklist.tracks.push({
			"title": title,
			"start": start,
			"end": end
        });

		index++;
	}


	if (index > 0) {  // Tracks were found!
		// In TIME_MODE_START, complete the 'end' of the last song is the duration for the video.
		if (timeMode == TIME_MODE_START)
			context.tracklist.tracks[context.tracklist.tracks.length-1].end = context.videoContext.durationInSecs;

		context.tracklist.extractor = EXTRACTOR_NAME;
		next(false); // Finish the analysis
	} else {
		next(); // Try with next extractor
	}
});

exports.addCUETracklistExtractor = function(cueFile) {
	exports.tracklistExtractors.add(function(context, next) {
		var EXTRACTOR_NAME = 'CUE-EXTRACTOR-' + path.basename(cueFile);
		console.log('Extractor "' + EXTRACTOR_NAME + '" starting...');

		var cueSheet = cueParser.parse(cueFile);

		var start = 0;
		for(var index = 0; index < cueSheet.files[0].tracks.length; index++) {
			start = ((parseInt(cueSheet.files[0].tracks[index].indexes[0].time.min) * 60) +
				parseInt(cueSheet.files[0].tracks[index].indexes[0].time.sec));

			context.tracklist.tracks.push({
				"title": cueSheet.files[0].tracks[index].title,
				"start": start,
				"end": 0
			});

			if (index > 0)
				context.tracklist.tracks[index-1].end = start;
		}
		context.tracklist.tracks[context.tracklist.tracks.length-1].end = context.videoContext.durationInSecs;

		// This is a 'terminal' extractor.
		next(false);
	});
}

exports.extractTracklist = function(videoContext, callback) {
    var tracklist = new Tracklist();
	var context = { "videoContext": videoContext, "tracklist": tracklist };

	exports.tracklistExtractors.start(context, function(context) {
		if (callback)
			callback(context.tracklist);
	}, function(context) {
		if (callback)
			callback(context.tracklist);
	});
};

exports.splitFileByTracklist = function(file, tracklist, callback) {
    console.log("Splitting file '" + file + "' using tracklist: \n" + JSON.stringify(tracklist, null, 2));

    if (path.extname(file).toLowerCase() != '.mp3')
		convertToMP3(file, function(conversionReturnCode, outputFile) {
			fs.unlink(file);

			if (conversionReturnCode != 0)
				process.exit(conversionReturnCode);
			else
				splitMP3FileByTracklist(outputFile, tracklist, callback);
		});
	else
		splitMP3FileByTracklist(file, tracklist, callback);
};

var Tracklist = function() {
	this.extractor = '';
	this.tracks = [];
};

Tracklist.prototype.allTracksAreNumbered = function() {
	for(var index=0; index<this.tracks.length; index++)
		if (!(/^[0-9]/.test(this.tracks[index].title)))
			return false;
	return true;
};

exports.Tracklist = Tracklist;

function momentToSeconds(input) {
	var parts = input.split(':');
	return ((parseInt(parts[0]) * 60) + parseInt(parts[1]));
}

exports.momentToSeconds = momentToSeconds;

function convertToMP3(file, callback) {
	console.log('Converting "', file, '" to MP3 format.');

	var params = [];
	var outputFile = file + '.mp3';
    params.push('-i');
    params.push(file.replace(/ /g, "\ "));
	params.push('-vn');
	params.push('-qscale');
	params.push('1');
	params.push(outputFile.replace(/ /g, "\ "));

	var stream = avconv(params);

    stream.on('message', function(data) {
		console.log('MP3 conversion -> ' + data);
	});

	stream.once('exit', function(exitCode, signal, metadata) {
         if (callback)
             callback(exitCode, outputFile);
    });
}

function splitMP3FileByTracklist(file, tracklist, callback) {
    var params = [];
    params.push('-i');
    params.push(file.replace(/ /g, "\ "));

    var prevStart = 0;
    var allTracksAreNumbered = tracklist.allTracksAreNumbered();
    for(var index=0; index < tracklist.tracks.length; index++) {
        filename = (allTracksAreNumbered ? "" :
			("00" + (index+1)).slice(-2) + '.') + tracklist.tracks[index].title.replace(/[^a-z0-9\.]/gi, '_') + '.mp3';

		params.push('-acodec');
	    params.push('copy');

        params.push('-ss');
        params.push(tracklist.tracks[index].start.toString());
        params.push('-t');
        params.push((tracklist.tracks[index].end - prevStart).toString());
        params.push(path.join(path.dirname(file), filename));

        prevStart = tracklist.tracks[index].end;
    }
    var stream = avconv(params);

    stream.on('message', function(data) {
        console.log('Split by tracklist -> ' + data);
    });

    stream.once('exit', function(exitCode, signal, metadata) {
		fs.unlink(file);

        if (callback)
            callback(exitCode);
    });
}
