var youtubedl = require('youtube-dl');

if (process.argv.length < 3)
	throw 'At least, you must specify the URL of the video to download/split!';

var url = process.argv[2];
console.log('Video URL: ' + url);




// ----------------------------------------------------------- TEST ----------------------------------------------------------------
// Test video URL: https://www.youtube.com/watch?v=GRxofEmo3HA
var testDescription = "From Rayle47:\n" + 
	"For those who want to listen to specific movements\n" +
	"Spring 0:00\n" +
	"Summer 10:31\n" +
	"Autumn 20:59\n" +
	"Winter 32:48\n" +
	"I guess my 60th video is bigger than I thought it would. I plan to post more classical music in the ...";

var testMP3File = '/home/rodrigo/all/temp/Four Seasons ~ Vivaldi-GRxofEmo3HA.mp3';




// Let's analyze the video's description trying to extract a tracklist from it.
var tracklist = extractTracklist(testDescription);
if (tracklist == 'undefined' || tracklist.length <= 0)
	throw 'No tracklist could be inferred/read!';
splitMP3FileByTracklist(testMP3File, tracklist);

process.exit(1);
// ----------------------------------------------------------- TEST ----------------------------------------------------------------




// Optional arguments passed to youtube-dl. 
// var options = ['--username=user', '--password=hunter2'];
var options = [];
youtubedl.getInfo(url, options, function(err, info) {
  if (err) throw err;
 
  //console.log('id:', info.id);
  //console.log('title:', info.title);
  //console.log('url:', info.url);
  //console.log('thumbnail:', info.thumbnail);
  //console.log('description:', info.description);
  //console.log('filename:', info._filename);
  //console.log('format id:', info.format_id);

  // TODO:
  //    1. Extract tracklist from video's description
  //    2. If not tracks were found, abort.
  //    3. Start download video as an MP3 file with youtube-dl
  //    4. When the MP3 file is ready, analyze then split it with the tracklist we got.

});


function extractTracklist(videoDescription) {
	var tracklist = [];

	// TODO: extract tracklist from video's description.
	// I'm thinking on some kind of 'chain-of-responsibility' for handlers that could 
	// actually extract songs's title and start/stop markers. 
	tracklist.push({ "title": "1st song", "start": 0, "end": 192 });
	tracklist.push({ "title": "2nd song", "start": 195, "end": 402 });
	tracklist.push({ "title": "3rd song", "start": 404, "end": 721 });

	return tracklist;
}

function splitMP3FileByTracklist(file, tracklist) {
	console.log('TODO: splitMP3FileByTracklist: \nFile: \n' + file + "\n\nTracklist: \n" + JSON.stringify(tracklist));
}

