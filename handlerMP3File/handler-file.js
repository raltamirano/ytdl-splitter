var ChainOfResponsibility = require('chaining-tool');

exports.extractTracklistAnalyzers = new ChainOfResponsibility();

// Add built-in tracklist analyzers
exports.extractTracklistAnalyzers.add(function(context, next) {
 	var regex = /(.+)\s(\d{1,2}:\d{2})/gi;
	var patternsFound = context.videoDescription.match(regex);
	if (patternsFound && patternsFound.length > 0) {
		for(var index=0; index<patternsFound.length; index++)
			context.tracklist.push({
				"title": patternsFound[index]
			});

		next(false); // Finish the analysis

		next(false); // Finish the analysis
	} else {
		next(); // Try with next analyzer
	}		
});
 
exports.extractTracklistAnalyzers.add(function(context, next) {
    next(false); 
});
 


exports.extractTracklist = function(videoDescription) {
        var tracklist = [];
	var context = { "videoDescription": videoDescription, "tracklist": tracklist };

	exports.extractTracklistAnalyzers.start(context, function(context) {
		return context.tracklist;
	}, function(context) {
		return context.tracklist;
	});

        return tracklist;
};

exports.splitMP3FileByTracklist = function(file, tracklist) {
        console.log('TODO: splitMP3FileByTracklist: \nFile: \n' + file + "\n\nTracklist: \n" + JSON.stringify(tracklist));
};

