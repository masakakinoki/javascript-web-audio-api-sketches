"use strict";

// for cross browser
const AudioContext = window.AudioContext || window.webkitaudioCtx;
const audioCtx = new AudioContext();

let futureTickTime = audioCtx.currentTime;
let counter = 1;
let tempo = 60;
let secondsPerBeat = 60 / tempo;
let counterTimeValue = (secondsPerBeat / 4); // 16th note
let osc = audioCtx.createOscillator();
let topSineVolume = audioCtx.createGain();
topSineVolume.gain.value = 0.05; //TopSine volume before send to FX

// Noise Envelope setup
const noiseEnv = audioCtx.createGain();
noiseEnv.gain.setValueAtTime(0, audioCtx.currentTime); // start from silence!

// Noise volume
let noiseVolume = audioCtx.createGain();
noiseVolume.gain.value = 0.01; //Noise volume before send to FX

// Noise parameters
let noiseDuration = 5.0; //Duration of Noise
let bandHz = 4000;
let bandQ = 10;

// Biquad filter setup
const bandpass = audioCtx.createBiquadFilter();
bandpass.type = 'bandpass';
bandpass.frequency.value = bandHz;
bandpass.Q.value = bandQ;

// Distortion setup
let distortion = audioCtx.createWaveShaper();

// Distortion function

// Distortion Type A

// function makeDistortionCurve(amount) {
//   let k = typeof amount === 'number' ? amount : 50,
//     n_samples = 44100,
//     curve = new Float32Array(n_samples),
//     deg = Math.PI / 180,
//     i = 0,
//     x;
//   for ( ; i < n_samples; ++i ) {
//     x = i * 2 / n_samples - 1;
//     curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
//   }
//   return curve;
// };

// Distortion Type B

function makeDistortionCurve(amount) {
  var k = amount,
      n_samples = typeof sampleRate === 'number' ? sampleRate : 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
  for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      curve[i] = (3 + k)*Math.atan(Math.sinh(x*0.25)*5) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

// Distortion parameters
distortion.curve = makeDistortionCurve(400);
distortion.oversample = '4x';

// Create attack and release functions.
const attack = (attackTime, decayTime, sustainValue) => {
  noiseEnv.gain.setValueAtTime(0, audioCtx.currentTime);
  noiseEnv.gain.linearRampToValueAtTime(1,
    audioCtx.currentTime + attackTime);
  noiseEnv.gain.linearRampToValueAtTime(sustainValue,
    audioCtx.currentTime + attackTime + decayTime);
};

const release = (tempReleaseTime) => {
  noiseEnv.gain.linearRampToValueAtTime(0,
    audioCtx.currentTime + tempReleaseTime);
  console.log("tempReleaseTime: " + tempReleaseTime);
};

// Attack and release functions setup.
let attackTime = 0.5;
let decayTime = 0.5;
let sustainValue = 0.5;
let releaseTime = 3.5;

let reverbIR;
let reverbFilename;
let masterGain;
let convolver;
let dryGain;
let wetGain;

masterGain = audioCtx.createGain();
masterGain.gain.value = 0.5;
convolver = audioCtx.createConvolver();
dryGain = audioCtx.createGain();
wetGain = audioCtx.createGain();
masterGain.connect(dryGain);
masterGain.connect(convolver);
convolver.connect(wetGain);
dryGain.connect(audioCtx.destination);
wetGain.connect(audioCtx.destination);

//Reverb source https://github.com/adelespinasse/reverbGen
//Check this application to adjust the params https://aldel.com/reverbgen/
function doGenerateReverb() {
  var params = {
    fadeInTime: 0.1,
    decayTime: 1.5,
    sampleRate: 48000,
    lpFreqStart: 15000,
    lpFreqEnd: 1000,
    numChannels: 2
  };
  reverbFilename = ('reverb' + params.fadeInTime + '-' + params.decayTime + '-' +
    params.lpFreqStart + '-' + params.lpFreqEnd).replace(/\./g, '_') + '.wav';
  reverbGen.generateReverb(params, function (result) {
    reverbIR = result;
    try {
      convolver.buffer = reverbIR;
    } catch (e) {
      alert("There was an error creating the convolver, probably because you chose " +
        "a sample rate that doesn't match your browser's playback (" + audioCtx.sampleRate +
        "). Playing the demo sounds through your impulse response may not work, " +
        "but you should be able to play and/or save the impulse response. Error message: " + e);
      convolver.buffer = audioCtx.createBuffer(params.numChannels, 1, audioCtx.sampleRate);
    }

    // if (lpFreqStart) {
    //   feedbackDiv.appendChild(document.createElement('br'));
    //   feedbackDiv.appendChild(document.createTextNode('Lowpass response at end: '));

    //   var freqBins = sampleRate / 100;
    //   var frequencyHz = new Float32Array(freqBins);
    //   for (var i = 0; i < freqBins; i++) {
    //     frequencyHz[i] = (i+1) * 50;
    //   }
    //   var magResponse = new Float32Array(freqBins);
    //   var phaseResponse = new Float32Array(freqBins);
    //   window.filterNode.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
    //   var graph = reverbGen.generateGraph(magResponse, freqBins, 200, 0, 1.1);
    //   feedbackDiv.appendChild(graph);
    // }
  });
}

//Trigger doGenerateReverb function
function triggerDoGenerateReverb(time, playing) {
  if (playing) {
    if (counter === 1) {
      doGenerateReverb();
    }
  }
}

function playTopSine(time, playing) {
  if (playing) {
    osc = audioCtx.createOscillator();
    osc.connect(topSineVolume);
    topSineVolume.connect(convolver);
    topSineVolume.connect(dryGain);
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

function noiseAttackTrigger(time, playing) {
  if (playing) {
    if (counter === 1) {
      attack(attackTime, decayTime, sustainValue);
    }
  }
}

function noiseReleaseTrigger(time, playing) {
  if (playing) {
    if (counter === 1) {
      release(releaseTime);
    }
  }
}

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

    // connect our graph
    noise.connect(noiseVolume);
    noiseVolume.connect(distortion).connect(noiseEnv);
    // Without Bandpass Filter
    // noiseEnv.connect(audioCtx.destination);
    // With Bandpass Filter
    noiseEnv.connect(bandpass).connect(audioCtx.destination);
    if (counter === 1) {
      noise.start(time);
      // attack(attackTime, decayTime, sustainValue);
      // release(releaseTime);
      console.log("releaseTime: " + releaseTime);
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
  // console.log("scheduler now!");
  while (futureTickTime < audioCtx.currentTime + scheduleAheadTime) {
    playTopSine(futureTickTime, true);
    playNoise(futureTickTime, true);
    noiseAttackTrigger(futureTickTime, true);
    noiseReleaseTrigger(futureTickTime + attackTime + decayTime, true);
    triggerDoGenerateReverb(futureTickTime, true);
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