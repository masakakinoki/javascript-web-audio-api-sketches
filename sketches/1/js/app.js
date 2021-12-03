"use strict";

// for cross browser
const AudioContext = window.AudioContext || window.webkitaudioCtx;
const audioCtx = new AudioContext();

let futureTickTime = audioCtx.currentTime;
let counter = 1;
let cycleCounter = 1; //cycleCounter for a whole loop
let tempo = 60;
let secondsPerBeat = 60 / tempo;
let counterTimeValue = (secondsPerBeat / 4); // 16th note
let osc = audioCtx.createOscillator();
let topSineVolume = audioCtx.createGain();
topSineVolume.gain.value = 0.05; //TopSine volume before send to FX

let noiseReverbParams = {
  fadeInTime: 0.1,
  decayTime: 0.5,
  sampleRate: 48000,
  lpFreqStart: 15000,
  lpFreqEnd: 1000,
  numChannels: 2
};

// Noise Envelope setup
const noiseEnv = audioCtx.createGain();
noiseEnv.gain.setValueAtTime(0, audioCtx.currentTime); // start from silence!

// Noise volume
let noisePreGain = audioCtx.createGain();
noisePreGain.gain.value = 0.5; //Noise volume before send to FX

// Noise parameters
let initialNoiseDuration = 0.1
let noiseDuration = initialNoiseDuration; //Duration of Noise
let lowpassHz = 2000;
let lowpassQ = 1; // Default value: 1
let bandHz = 100;
let bandQ = 1; // Default value: 1

// Biquad filter setup
const filter = audioCtx.createBiquadFilter();
filter.type = 'lowpass'; // 'lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'
filter.frequency.value = lowpassHz;
filter.Q.value = lowpassQ;

// Distortion setup
let distortion = audioCtx.createWaveShaper();

// Distortion parameters
distortion.curve = makeDistortionCurve(null);
distortion.oversample = '4x';

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
  for (; i < n_samples; ++i) {
    x = i * 2 / n_samples - 1;
    curve[i] = (3 + k) * Math.atan(Math.sinh(x * 0.25) * 5) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

// Create attack and release functions.
const attack = (attackTime, decayTime, sustainValue) => {
  noiseEnv.gain.setValueAtTime(0, audioCtx.currentTime);
  noiseEnv.gain.linearRampToValueAtTime(1,
    audioCtx.currentTime + attackTime);
  noiseEnv.gain.linearRampToValueAtTime(sustainValue,
    audioCtx.currentTime + attackTime + decayTime);
};

// const release = (tempReleaseTime) => {
//   noiseEnv.gain.linearRampToValueAtTime(0,
//     audioCtx.currentTime + tempReleaseTime);
//   console.log("tempReleaseTime: " + tempReleaseTime);
// };

// Attack and release functions setup.
let attackTime = 0.0;
let decayTime = 0.0;
let sustainValue = 1.0;
// let releaseTime = 1.0;

let reverbIR;
let reverbFilename;
let masterGain;
let convolver;
let noiseConvolver;
let dryGain;
let wetGain;
let noiseWetGain;
let noiseDryGain;

masterGain = audioCtx.createGain();
masterGain.gain.value = 0.5;
convolver = audioCtx.createConvolver();
noiseConvolver = audioCtx.createConvolver();
dryGain = audioCtx.createGain();
wetGain = audioCtx.createGain();
noiseDryGain = audioCtx.createGain();
noiseWetGain = audioCtx.createGain();

// Coneecting
masterGain.connect(dryGain);
masterGain.connect(convolver);
convolver.connect(wetGain);
noiseConvolver.connect(noiseWetGain);
dryGain.connect(audioCtx.destination);
wetGain.connect(audioCtx.destination);
noiseDryGain.connect(audioCtx.destination);
noiseWetGain.connect(audioCtx.destination);

// FX wetGain
dryGain.gain.value = 1.0;
wetGain.gain.value = 0.5;
noiseDryGain.gain.calue = 1.0; //The amount of gain to apply. This parameter is a-rate and it's nominal range is (-∞,+∞). The default is 1.
noiseWetGain.gain.calue = -2.0; //The amount of gain to apply. This parameter is a-rate and it's nominal range is (-∞,+∞). The default is 1.

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
  });
}

function noiseDoGenerateReverb() {
  // noiseReverbParams = {
  //   fadeInTime: 0.1,
  //   decayTime: 0.5,
  //   sampleRate: 48000,
  //   lpFreqStart: 15000,
  //   lpFreqEnd: 1000,
  //   numChannels: 2
  // };
  reverbFilename = ('reverb' + noiseReverbParams.fadeInTime + '-' + noiseReverbParams.decayTime + '-' +
  noiseReverbParams.lpFreqStart + '-' + noiseReverbParams.lpFreqEnd).replace(/\./g, '_') + '.wav';
  reverbGen.generateReverb(noiseReverbParams, function (result) {
    reverbIR = result;
    try {
      noiseConvolver.buffer = reverbIR;
    } catch (e) {
      alert("There was an error creating the convolver, probably because you chose " +
        "a sample rate that doesn't match your browser's playback (" + audioCtx.sampleRate +
        "). Playing the demo sounds through your impulse response may not work, " +
        "but you should be able to play and/or save the impulse response. Error message: " + e);
      noiseConvolver.buffer = audioCtx.createBuffer(noiseReverbParams.numChannels, 1, audioCtx.sampleRate);
    }
  });
}

//Trigger doGenerateReverb function
function triggerDoGenerateReverb(time, playing) {
  if (playing) {
    if (counter === 1) {
      doGenerateReverb();
      noiseDoGenerateReverb();
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
    if (cycleCounter === 49) {
      noiseReverbParams.decayTime = 1.5;
      noiseEnv.gain.setValueAtTime(0, audioCtx.currentTime);
      noiseEnv.gain.linearRampToValueAtTime(3,
        audioCtx.currentTime + 3.0);
    } else if (counter === 1) {
      attack(attackTime, decayTime, sustainValue);
    }
  }
}

// function noiseReleaseTrigger(time, playing) {
//   if (playing) {
//     if (counter === 1) {
//       release(releaseTime);
//     }
//   }
// }

function noiseTransformer() {
  console.log("noiseTransformer counter: " + counter);
  console.log("noiseTransformer cycleCounter: " + cycleCounter);
  // Reset noiseDuration if the counter is reset
  if (cycleCounter === 1) {
    noiseDuration = initialNoiseDuration;
  }

  if (counter === 1) {
    noiseDuration += 0.05;
  }

  if (cycleCounter >= 48) {
    noiseDuration += 1.
  }

  if (cycleCounter >= 64) {
    noiseDuration = initialNoiseDuration;
  }
}

function playNoise(time, playing) {
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
  noise.connect(noisePreGain);
  noisePreGain.connect(distortion).connect(noiseEnv);
  noiseEnv.connect(filter).connect(noiseConvolver);
  noiseEnv.connect(filter).connect(noiseDryGain);

  if (playing) {
    if (counter === 1) {
      noise.start(time);
      // attack(attackTime, decayTime, sustainValue);
      // release(releaseTime);
      // console.log("releaseTime: " + releaseTime);
      // noise.stop(time + noiseDuration);
    }
  }
}

const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

function playTick() {
  console.log("This 16th note is: " + counter);
  console.log("This cycle is: " + cycleCounter);
  console.log("16th is: " + counterTimeValue);
  console.log("futureTickTime: " + futureTickTime);
  console.log("Web Audio Time: " + audioCtx.currentTime);
  counter += 1;
  cycleCounter += 1;
  futureTickTime += counterTimeValue;
  console.log("futureTickTime: " + futureTickTime);

  if (counter > 16) {
    counter = 1;
  }

  console.log("This cycle is now: " + cycleCounter);

  if (cycleCounter > 64) {
    cycleCounter = 1;
    audioCtx.suspend();
  }
}

function scheduler() {
  // console.log("scheduler now!");
  while (futureTickTime < audioCtx.currentTime + scheduleAheadTime) {
    playTopSine(futureTickTime, true);
    playNoise(futureTickTime, true);
    noiseAttackTrigger(futureTickTime, true);
    // noiseReleaseTrigger(futureTickTime + attackTime + decayTime, true);
    triggerDoGenerateReverb(futureTickTime, true);
    noiseTransformer();
    playTick();
  }
  window.setTimeout(scheduler, lookahead);
}

document.getElementById("play-button").addEventListener("click", function () {

  if (audioCtx.state !== "running") {
    console.log("it's not running well");
    audioCtx.resume();
    scheduler();
  } else {
    console.log("it's running");
    audioCtx.suspend();
    console.log(audioCtx.state);
    counter = 1;
    cycleCounter = 1;
  }
});

window.onload = (event) => {
  console.log('page is fully loaded');
  audioCtx.suspend();
  // init();
};