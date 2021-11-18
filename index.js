const express = require("express");
const app = express();
const fs = require("fs"); //file system streams file to client
 
app.get("/", function (req,res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/video", function (req,res) {
// Ensure there is a range given to the video
const range = req.headers.range;
if (!range) {
    res.status(400).send("requires range header")
}

// constructing the header to be set to client
// every 'const' in this scope is a 'header element'

const videoPath = "bigbuck.mp4";
const videoSize = fs.statSync("bigbuck.mp4").size;

// Parse Range
// Example: "bytes=32324-"
const CHUNK_SIZE = 10 ** 6; // 1MB

// parse starting byte from 'range header' string
// replace all non-numbers with empty string
// transform to 'Number' type
const start = Number(range.replace(/\D/g, ""))

// calculate ending byte being sent to the client
// at end of playback 'end' > video size
// thus, 'videoSize - 1' refers to last streaming block
const end = Math.min(start + CHUNK_SIZE, videoSize - 1)


const contentLength = end - start + 1

// 'headers' object:
// this object tells the progress bar where
// along the video we are navigating
const headers = {
    "content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4"
}

// HTTP Status 206 for Partial Content
res.writeHead(206, headers);

// create video read stream for this particular chunk
const videoStream = fs.createReadStream(videoPath, { start, end });
// {start,end} options object

// Stream the video chunk to the client
// piping through response object
videoStream.pipe(res);

});

app.listen(8000, function () {
    console.log("Listening on port 8000!")
})