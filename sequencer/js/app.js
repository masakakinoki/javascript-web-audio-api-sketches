"use strict";

$(function () {

    let futureTickTime = audioCtx.currentTime;
    let counter = 1;
    let tempo = 120;
    let secondsPerBeat = 60 / tempo;
    let counterTimeValue = (secondsPerBeat / 4); // 16th note
    let osc = audioCtx.createOscillator();
    let metronomeVolume = audioCtx.createGain();
    let timerID = undefined;
    let isPlaying = false;

    //BEING load sound samples

    let kick = audioFileLoader("sounds/kick.mp3");
    let snare = audioFileLoader("sounds/snare.mp3");
    let hihat = audioFileLoader("sounds/hihat.mp3");
    let shaker = audioFileLoader("sounds/shaker.mp3");

    //END load sound smaple

    //BEGIN Array Tracks

    let kickTrack = [],
        snareTrack = [],
        hiHatTrack = [],
        shakerTrack = [];

    //END Array Tracks

    function scheduleSound(trackArray, sound, count, time) {

        for (let i = 0; i < trackArray.length; i += 1) {
            if (count === trackArray[i]) {
                sound.play(time);
            }
        }
    }

    //BEGIN metronome function playMetronome (time, playing)

    function playMetronome(time, playing) {

        if (playing) {
            osc = audioCtx.createOscillator();
            osc.connect(metronomeVolume);
            metronomeVolume.connect(audioCtx.destination);
            osc.frequency.value = 500;
            if (counter === 1) {
                osc.frequency.value = 500;
            } else {
                osc.frequency.value = 300;
            }
            osc.start(time);
            osc.stop(time + 0.1);
        }
    }
    //END Metronome 

    function playTick() {
        secondsPerBeat = 60 / tempo;
        counterTimeValue = (secondsPerBeat / 4);
        console.log("This is 16th note: " + counter);
        counter += 1;
        futureTickTime += counterTimeValue;
        if (counter > 16) {
            counter = 1;
        }
    }

    function scheduler() {
        // console.log("scheduler now!");

        if (futureTickTime < audioCtx.currentTime + 0.1) {
            playMetronome(futureTickTime, true);
            scheduleSound(kickTrack, kick, counter, futureTickTime - audioCtx.currentTime);
            scheduleSound(snareTrack, snare, counter, futureTickTime - audioCtx.currentTime);
            scheduleSound(hiHatTrack, hihat, counter, futureTickTime - audioCtx.currentTime);
            scheduleSound(shakerTrack, shaker, counter, futureTickTime - audioCtx.currentTime);
            playTick();
            // console.log("This 16th note is: " + counter);
            // console.log("16th is: " + counterTimeValue);
            // console.log("time: " + time);
            // console.log("futureTickTime: " + futureTickTime);
            // console.log("Web Audio Time: " + audioCtx.currentTime);
        }
        timerID = window.setTimeout(scheduler, 0);
    }

    function play() {
        isPlaying = !isPlaying;

        if (isPlaying) {
            counter = 1;
            futureTickTime = audioCtx.currentTime;
            scheduler();
        } else {
            window.clearTimeout(timerID);
        }
    }

    //BEING create grid
    for (let i = 1; i <= 4; i += 1) {

        $(".app-grid").append("<div class='track-" + i + "-container'</div>");

        for (let j = 1; j < 17; j += 1) {

            $(".track-" + i + "-container").append("<div class='grid-item track-step step-" + j + "'</div>");

        }
    }
    //END create grid

    $(".play-stop-button").on("click", function () {

        play();

    });

    $(".metronome").on("click", function () {
        if (metronomeVolume.gain.value) {
            metronomeVolume.gain.value = 0;

        } else {
            metronomeVolume.gain.value = 1;
        }


    });
    //END metronome toggle

    $("#tempo").on("change", function () {
        tempo = this.value;
        $("#showTempo").html(tempo);
    });

    //BEGIN Grid interactivity
    function sequenceGridToggler(domEle, arr) {
        $(domEle).on("mousedown", ".grid-item", function () {

            let gridIndexValue = $(this).index(); //Get index of grid-item
            let offset = gridIndexValue + 1; //Add +1 so value starts at 1 instead of 0
            let index = arr.indexOf(offset); //Check if value exists in array


            if (index > -1) { //If index of item exists"

                arr.splice(index, 1); //then remove it
                $(this).css("background-color", ""); // and change color of DOM element to default
                console.log(arr); 

            } else { //if item does not exit
                
                arr.push(offset); //then push it to track array
                $(this).css("background-color", "purple"); //and change color of DOM element to puple 
                console.log(arr);           
            }

        });
    }

    sequenceGridToggler(".track-1-container", kickTrack);
    sequenceGridToggler(".track-2-container", snareTrack);
    sequenceGridToggler(".track-3-container", hiHatTrack);
    sequenceGridToggler(".track-4-container", shakerTrack);

});