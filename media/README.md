# media/

`pseye-demo.mp4` is the recording that plays on the PSEye page
(`live-project.tsx` in the explorer). 22.5s, 1280x720, H.264, no audio,
6.7 MB.

It plays silently on a loop with no controls, so it reads as a moving
screenshot rather than as a video anyone has to press play on. app.js
starts it only while it is actually on screen, which means nobody
downloads it for a page they never open.

## How it was made

The upload was `pseye-demo.mkv` (47.6s). MKV does not play in any
browser, but the streams inside were already H.264 + AAC, so getting to
MP4 was a container change with no re-encode and no quality loss. The
same pass trimmed it and dropped the audio, which nothing can reach now
that the controls are gone:

    vlc -I dummy --no-repeat --no-loop --no-sout-audio \
      media/pseye-demo.mkv --start-time=0 --stop-time=22.5 \
      --sout "#standard{access=file,mux=mp4,dst=media/pseye-demo.mp4}" vlc://quit

The cut lands at 22.5s because the recording reaches the daily recap at
21.3s and then hits a page-loading flash at 22.6s. Ending on the recap
means the loop restarts cleanly on the market map.

The `.mkv` is gitignored, so the repo does not carry the same recording
twice. Keep it locally if you want to re-cut.

## Replacing it

Drop a new `pseye-demo.mp4` here. If the file is missing or unplayable
the player hides itself and the page falls back to the screenshots below
it, so nothing looks broken either way.

The poster is `images/pseye/demo-poster.jpg`, a frame pulled from about
4.5s in. Re-record and it will no longer match, so pull a new one.
