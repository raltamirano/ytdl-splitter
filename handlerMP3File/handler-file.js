var sox = require('sox');
var ChainOfResponsibility = require('chaining-tool');

exports.extractTracklistAnalyzers = new ChainOfResponsibility();

// Add built-in tracklist analyzers.
exports.extractTracklistAnalyzers.add(function(context, next) {
	// For songs expressed as something like: 'song-name XX:YY', where 'XX:YY' are
	// the starting minutes:seconds of 'song-name'.
	var ANALYZER_NAME = 'ANALYZER-1';
	var TIME_MODE_START = 's';
	var TIME_MODE_DURATION = 'd';
 	var regex = /(.+)\s(\d{1,2}:\d{2})\s*/gi; 

	var match, title, time, timeMode, index = 0;
	while (match = regex.exec(context.description)) {
		title = match[1];
		time = momentToMillis(match[2]);

		if (index == 0)
			timeMode = match[2].match(/0+:0+/) ? TIME_MODE_START : TIME_MODE_DURATION;

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
			context.tracklist.tracks[context.tracklist.tracks.length-1].end = context.duration;

		context.tracklist.analyzer = ANALYZER_NAME;		
		next(false); // Finish the analysis
	} else {
		next(); // Try with next analyzer
	}		
});
 
exports.extractTracklistAnalyzers.add(function(context, next) {
    next(false); 
});
 

// Method to extract a tracklist given the description of the video to split.
exports.extractTracklist = function(description, duration) {
	var durationInMillis = momentToMillis(duration); 
    var tracklist = { "analyzer": null, "tracks": [] };
	var context = { "description": description, "duration": durationInMillis, "tracklist": tracklist };

	exports.extractTracklistAnalyzers.start(context, function(context) {
		return context.tracklist;
	}, function(context) {
		return context.tracklist;
	});

    return tracklist;
};

exports.splitMP3FileByTracklist = function(file, tracklist) {
    console.log("Splitting file '" + file + "' using tracklist: \n" + JSON.stringify(tracklist, null, 2));
};

function momentToMillis(input) {
	var parts = input.split(':');
	return ((parseInt(parts[0]) * 60) + parseInt(parts[1])) * 1000;
}
