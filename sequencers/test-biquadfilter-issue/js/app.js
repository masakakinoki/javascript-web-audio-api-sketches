"use strict";

// for cross browser
const AudioContext = window.AudioContext || window.webkitaudioCtx;
const audioCtx = new AudioContext();

let futureTickTime = audioCtx.currentTime;
let counter = 1;
let tempo = 120;
let secondsPerBeat = 60 / tempo;
let counterTimeValue = (secondsPerBeat / 4); // 16th note

// Noise volume
let noiseVolume = audioCtx.createGain();
noiseVolume.gain.value = 0.001; //Noise volume before send to FX

// Noise parameters
let noiseDuration = 1.; //Duration of Noise
let bandHz = 100;

function playNoise(time, playing) {
  if (playing) {
    const bufferSize = audioCtx.sampleRate * noiseDuration; // set the time of the note
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate); // create an empty buffer
    const data = buffer.getChannelData(0); // get data

    // fill the buffer with noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    // create a buffer source for our created data
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = bandHz;

    // connect our graph
    noise.connect(noiseVolume);
    // 1. without a bandpass filter
    // noiseVolume.connect(audioCtx.destination);
    // 2. with a bandpass filter
    noiseVolume.connect(bandpass).connect(audioCtx.destination);
    if (counter === 1) {
      noise.start(time);
      // noise.stop(time + noiseDuration);
    }
  }
}

const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

function playTick() {
  console.log("This 16th note is: " + counter);
  console.log("16th is: " + counterTimeValue);
  console.log("futureTickTime: " + futureTickTime);
  console.log("Web Audio Time: " + audioCtx.currentTime);
  counter += 1;
  futureTickTime += counterTimeValue;
  console.log("futureTickTime: " + futureTickTime);

  if (counter > 16) {
    counter = 1;
  }
}

function scheduler() {
  if (futureTickTime < audioCtx.currentTime + scheduleAheadTime) {
    playNoise(futureTickTime, true);
    playTick();
  }
  window.setTimeout(scheduler, lookahead);
}

scheduler();

document.getElementById("play-button").addEventListener("click", function () {

  if (audioCtx.state !== "running") {
    console.log("it's not running well");
    audioCtx.resume();
  } else {
    console.log("it's running");
    audioCtx.suspend();
    console.log(audioCtx.state);
  }
});