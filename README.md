# ytdl-splitter
Utility to download youtube videos (using youtube-dl) as separate audio files,
using the tracklist provided on the description of the video or CUE files.

## Usage

Extract audio files using the tracklist provided in the description for the video:

    nodejs index.js <video_url>

Extract audio files using a CUE file as the tracklist:

    nodejs index.js --cue-file tracklist.cue  <video_url>

You can also set values for some metadata fields (overwritting values read from any tracklist source, if any):

    nodejs index.js -t "The Album" -a "The Artist" -y "2015" <video_url>

## Notes

As this package depends on 'youtube-dl' and 'avconv', check for their requirements also. Currently, they are: the 'youtube-dl' and 'avconv' executables in your PATH, ready to be executed. Python (2.6, 2.7, or 3.2+) maybe needed in order to properly run 'youtube-dl'.
