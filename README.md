# ytdl-splitter
Standalone utility to download youtube videos (using youtube-dl) as separate
audio files, using the tracklist provided on the description of the video or
CUE files.

## Usage

Extract audio files using the tracklist provided in the description for the video:

    node index.js <video_url>

Or use some text file insted of the description for the video:

    node index.js --tracklist-data tracklist-data.txt <video_url>

Extract audio files using a CUE file as the tracklist:

    node index.js --cue-file tracklist.cue  <video_url>

You can also set values for some metadata fields (overwritting values read from
any tracklist source, if any):

    node index.js -t "The Album" -a "The Artist" -y "2015" <video_url>

## Notes

As this package depends on 'ytdl-splitter-core', which in turns depends on modules
'youtube-dl' and 'avconv', check for their requirements also. Currently, they are:
the 'youtube-dl' and 'avconv' executables in your PATH, ready to be executed.
Python (2.6, 2.7, or 3.2+) maybe needed in order to properly run 'youtube-dl'.
