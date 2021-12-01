"use strict";

// for cross browser
const AudioContext = window.AudioContext || window.webkitaudioCtx;
const audioCtx = new AudioContext();

let futureTickTime = audioCtx.currentTime;
let counter = 1;
let tempo = 120;
let secondsPerBeat = 60 / tempo;
let counterTimeValue = (secondsPerBeat / 4); // 16th note
let osc = audioCtx.createOscillator();
let topSineVolume = audioCtx.createGain();
topSineVolume.gain.value = 0.1;

//freeverb copy and paste from index.js
import CompositeAudioNode from './freeverb/composite-audio-node.js';
import mergeParams from './freeverb/merge-params.js';
import LowpassCombFilter from './freeverb/low-pass-comb-filter.js';

// Freeverb params defined by Mr. Shroeder
const SAMPLE_RATE = 44100;
const COMB_FILTER_TUNINGS = [1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116];
const ALLPASS_FREQUENCES = [225, 556, 441, 341];

const getAllPass = (audioCtx, freq) => {
  const allPass = audioCtx.createBiquadFilter();
  allPass.type = 'allpass';
  allPass.frequency.value = freq;
  return allPass;
};

class Freeverb extends CompositeAudioNode {

  get wetGain () {
    return this._wet.gain;
  }

  get dryGain () {
    return this._dry.gain;
  }

  get roomSize() {
    return mergeParams(this._combFilters.map(comb => comb.resonance));
  }

  get dampening() {
    return mergeParams(this._combFilters.map(comb => comb.dampening));
  }

  constructor (audioCtx, options) {
    super(audioCtx, options);
    const {roomSize: resonance, dampening, wetGain, dryGain} = options;

    this._wet = audioCtx.createGain();
    this._wet.gain.setValueAtTime(wetGain, audioCtx.currentTime);
    this._dry = audioCtx.createGain();
    this._dry.gain.setValueAtTime(dryGain, audioCtx.currentTime);
    this._combFilters = COMB_FILTER_TUNINGS
    .map(delayPerSecond => delayPerSecond / SAMPLE_RATE)
    .map(delayTime => new LowpassCombFilter(audioCtx, {dampening, resonance, delayTime}));

    const merger = audioCtx.createChannelMerger(2);
    const splitter = audioCtx.createChannelSplitter(2);
    const combLeft = this._combFilters.slice(0, 4);
    const combRight = this._combFilters.slice(4);
    const allPassFilters = ALLPASS_FREQUENCES.map(freq => getAllPass(audioCtx, freq));

    //connect all nodes
    this._input.connect(this._wet).connect(splitter);
    this._input.connect(this._dry).connect(this._output);
    combLeft.forEach(comb => {
      splitter.connect(comb, 0).connect(merger, 0, 0);
    });
    combRight.forEach(comb => {
      splitter.connect(comb, 1).connect(merger, 0, 1);
    });
    merger
    .connect(allPassFilters[0])
    .connect(allPassFilters[1])
    .connect(allPassFilters[2])
    .connect(allPassFilters[3])
    .connect(this._output);
  }
}


//create an instance
// const Freeverb = require('Freeverb')
// import Freeverb from　'./freeverb';
const opts = { dampening: 3000, roomSize: 0.7, dryGain: 0.1, wetGain: 1.0 }
const freeverb = new Freeverb(audioCtx, opts)

function playTopSine(time, playing) {
  if (playing) {
    osc = audioCtx.createOscillator();
    osc.connect(topSineVolume);
    topSineVolume.connect(freeverb).connect(audioCtx.destination)
    osc.type = "sine";
    osc.frequency.value = 4000;
    // if (counter === 1) {
    //     osc.frequency.value = 500;
    // } else {
    //     osc.frequency.value = 300;
    // }
    if (counter === 1) {
      osc.start(time);
      osc.stop(time + 0.1);
    }
  }
}

let noiseDuration = 0.1;
let bandHz = 500;

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
    noise.connect(bandpass).connect(audioCtx.destination);
    if (counter === 1) {
      noise.start(time);
      noise.stop(time + 0.1);
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
  // console.log("scheduler now!");
  while (futureTickTime < audioCtx.currentTime + scheduleAheadTime) {
    playTopSine(futureTickTime, true);
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