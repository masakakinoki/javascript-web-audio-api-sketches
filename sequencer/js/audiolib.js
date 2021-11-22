"use strict";

// for cross browser
const AudioContext = window.AudioContext || window.webkitaudioCtx;
const audioCtx = new AudioContext();

function audioFileLoader(fileDirectory, callback) {
    let soundObj = {};
    let playSound = undefined;
    let getSound = new XMLHttpRequest();
    soundObj.fileDirectory = fileDirectory;
    getSound.open("GET", soundObj.fileDirectory, true);
    getSound.responseType = "arraybuffer";
    getSound.onload = function () {
        audioCtx.decodeAudioData(getSound.response, function (buffer) {
            soundObj.soundToPlay = buffer;

        });
    };

    getSound.send();

    soundObj.play = function (time, setStart, setDuration) {
        playSound = audioCtx.createBufferSource();
        playSound.buffer = soundObj.soundToPlay;
        playSound.start(audioCtx.currentTime + time || audioCtx.currentTime, setStart || 0, setDuration || soundObj.soundToPlay.duration);
        // playSound.connect(audioCtx.destination);
        // console.log(playSound.buffer);
        // console.log(playSound.buffer.duration);

        // callback(playSound);
        if (typeof callback === "function") {
            return callback(playSound);
        } else {
            return playSound.connect(audioCtx.destination);
        }
    };

    soundObj.stop = function (time) {
        playSound.stop(audioCtx.currentTime + time || audioCtx.currentTime);
    };
    return soundObj;
}


function audioBatchLoader(obj) {
    let callback = undefined;
    let prop = undefined;

    for (prop in obj) {
        if (typeof obj[prop] === "function") {
            callback = obj[prop];
            delete obj[prop];
        }
    }
    for (prop in obj) {
        obj[prop] = audioFileLoader(obj[prop], callback);
    }

    return obj;

}