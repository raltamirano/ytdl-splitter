//Handler for work with mp3Files.
var handlerFile = {

    extractTracklist: function(videoDescription) {
        var tracklist = [];
        // TODO: extract tracklist from video's description.
        // I'm thinking on some kind of 'chain-of-responsibility' for handlers that could 
        // actually extract songs's title and start/stop markers. 
        tracklist.push({
            "title": "1st song",
            "start": 0,
            "end": 192
        });
        tracklist.push({
            "title": "2nd song",
            "start": 195,
            "end": 402
        });
        tracklist.push({
            "title": "3rd song",
            "start": 404,
            "end": 721
        });

        return tracklist;
    },

    splitMP3FileByTracklist: function(file, tracklist) {
        console.log('TODO: splitMP3FileByTracklist: \nFile: \n' + file + "\n\nTracklist: \n" + JSON.stringify(tracklist));
    }
};

module.exports = handlerFile;