"use strict";
// for cross browser
// const ctx = new(window.AudioContext || window.webkitAudioContext)();

// const osc = ctx.createOscillator();

// osc.connect(ctx.destination);

// console.log(ctx.state);
// console.log(ctx);

const btn = document.querySelector("button");

btn.addEventListener("click", () => {
  const ctx = new(window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  osc.connect(ctx.destination);
  osc.start(0);
  osc.stop(1);
  osc.onended = () => {
    console.log(ctx.state);
  }
})


// const osc = ctx.createOscillator();

// osc.connect(ctx.destination);

// osc.frequency.value = 200;

// osc.start(0);
// osc.stop(1);

// const frequencyRange = document.querySelector("input");

// frequencyRange.addEventListener("input", (event) => {
//   console.log(event);
//   console.log(event.target);
//   console.log("event.target.value:" + event.target.value);
//   osc.frequency.value = event.target.value;
// }
// )

/* document.getElementById("play-button").addEventListener("click", function () {

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
}); */