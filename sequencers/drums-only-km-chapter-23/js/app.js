"use strict";

let futureTickTime = audioCtx.currentTime;
let counter = 1;

function scheduler() {
    // console.log("scheduler now!");

    if (futureTickTime < audioCtx.currentTime + 0.1) {
        console.log("This is beat: " + counter);
        console.log("futureTickTime: " + futureTickTime);
        console.log("Web Audio Time: " + audioCtx.currentTime);
        futureTickTime += 0.5; //can be any time value. 0.5 happens to be a quarter note at 120bpm
        
        counter += 1;
        if (counter > 4) {
            counter = 1;
        }
    }
    window.setTimeout(scheduler, 0);
}
scheduler();


var kick = audioFileLoader("sounds/kick.mp3");
var snare = audioFileLoader("sounds/snare.mp3");
var hihat = audioFileLoader("sounds/hihat.mp3");



var tempo = 120; //_____BPM (beats per minute)
var eighthNoteTime = (60 / tempo) / 2;

function playDrums() {
    // Play 4 bars of the following:
    for (var bar = 0; bar < 4; bar++) {
        var time = bar * 8 * eighthNoteTime;
        // Play the bass (kick) drum on beats 1, 5
        kick.play(time);
        kick.play(time + 4 * eighthNoteTime);


        // Play the snare drum on beats 3, 7
        snare.play(time + 2 * eighthNoteTime);
        snare.play(time + 6 * eighthNoteTime);
        // Play the hi-hat every eighth note.
        for (var i = 0; i < 8; ++i) {
            hihat.play(time + i * eighthNoteTime);
        }
    }
}

window.addEventListener("mousedown", function () {
    playDrums();
    // console.log(sound);
    // sound.kick.play();
    // sound.snare.play(0.1, 0.1, 3.0);
    // sound.hihat.play(0.3);
    // sound.shaker.play(0.4)
});

// window.addEventListener("mouseup", function () {
// console.log(sound);
// sound.kick.stop();
// sound.snare.stop();
// sound.hihat.play(0.3);
// sound.shaker.play(0.4)
// }); 


/* window.setTimeout(function() {
    playDrums();
}, 1500); */

/* 
console.log(audioCtx.currentTime);

const sound = audioBatchLoader({

    kick: "sounds/kick.mp3",
    snare: "sounds/snare.mp3",
    hihat: "sounds/hihat.mp3",
    shaker: "sounds/shaker.mp3",
    nodes: function (sound) {
        let gain = audioCtx.createGain();
        sound.connect(gain);
        gain.gain.value = 0.5;
        gain.connect(audioCtx.destination);
    }
});
*/