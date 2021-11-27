"use strict";
// for cross browser
const ctx = new (window.AudioContext || window.webkitAudioContext)();

console.log(ctx);

// const osc = ctx.createOscillator();

// const gain = ctx.createGain();

// console.log(gain);

// osc.type = "sine";
// osc.type = "square";
// osc.type = "triangle";
// osc.type = "sawtooth";

// osc.connect(ctx.destination);

// osc.start();

// setTimeout(() => {
// osc.stop();
// }, 500);
// osc.stop(1);

// const frequencyRange = document.querySelector("input");

frequencyRange.addEventListener("input", (event) => {
  console.log(event);
  console.log(event.target);
  console.log("event.target.value:" + event.target.value);
  osc.frequency.value = event.target.value;
}
)

document.getElementById("play-button").addEventListener("click", function () {
  
  if (ctx.state !== "running") {
    // console.log("it's not running well");
    // oscState = true;
    ctx.resume();
    // audioCtx.onstatechange = () => console.log(audioCtx.state);
  } else {
    // console.log("it's running");
    // oscState = false;
    ctx.suspend();
    // console.log(audioCtx.state);
    // audioCtx.onstatechange = () => console.log(audioCtx.state);
  }
});
