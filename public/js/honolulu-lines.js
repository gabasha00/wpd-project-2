//All of the global variables to be used

let ekgWave = [] //Array to store all of the pulse/Y-values
let x = 0 //To position the line horizontally 
let ekgLine; 
let waveHistory = [] //Array to store multiple wave values
let currentWave = 1 //Fallback value for the line

//Variables for earthquake data
let eqHistory = [];       //Array to store earthquake magnitudes
let currentEQ = 0;        //Fallback/default spike value
let eqLineOffset = 150;   //Distance between wave line and earthquake line
let eqWave = []           //Array to store earthquake EKG points

//Function to parse NOAA wave data
function waveData(text) {
    let lines = text.trim().split("\n");

    //Skip header rows (first 2 lines usually)
    //NOAA data is translated into text lines
    for (let i = 2; i < lines.length; i++) {
        let parts = lines[i].trim().split(/\s+/);
        let value = parseFloat(parts[8]); //Column for the wave height in meters

        if (!isNaN(value)) {
            waveHistory.push(value); //Everytime NOAA data is added, the data is pushed into the waveHistory array
        }
    }

    console.log("Wave history loaded:", waveHistory.length);
}

//Function for USGS earthquake data <- add it under this comment for honolulu
function earthquakeData(data) {
    // data.features is an array of earthquakes from USGS
    data.features.forEach(eq => {
        let mag = eq.properties.mag; // magnitude of the quake
        if (!isNaN(mag)) {
            eqHistory.push(mag);
        }
    });

    console.log("Earthquake history loaded:", eqHistory.length);
}

function setup() {
    let cnv = createCanvas(800, 300);
    cnv.parent("ekg"); //Attach canvas to the div
    ekgLine = height / 2; //Positions the EKG line

    //Fetch wave data for Honolulu
    fetch("/api/waves?location=honolulu")
        .then(res => res.text())
        .then(data => {
            waveData(data);
        });

    //Fetch earthquake data for Honolulu
    fetch("/api/earthquakes?location=honolulu")
        .then(res => res.json())
        .then(data => {
            earthquakeData(data);
        });
}

function draw() {
    clear();
    
    //Wave line styling
    stroke(29, 120, 116); 
    strokeWeight(3);
    noFill();
    
    //Effect to make the line sway / always stay in motion
    let sway = 10 * sin(frameCount * 0.03);
    
    //EKG Line
    let y = ekgLine + sway;

    let spikeFrames = 20;

    //Use wave data over time if available
    if (waveHistory.length > 0) {
        let index = floor(frameCount * 0.2) % waveHistory.length;
        currentWave = waveHistory[index];
    }
    
    //Function that uses the realtime wave data
    let spikeHeight = map(currentWave, 0, 5, 10, 100);
    let intervals = map(currentWave, 0, 5, 120, 40);
    if (frameCount % intervals < spikeFrames) {
        let t = map(frameCount % intervals, 0, spikeFrames, 0, PI);
        y -= spikeHeight * sin(t) * sin(t);
    }
    
    ekgWave.push(y);
    
    //Draw wave line
    beginShape();
    for (let i = 0; i < ekgWave.length; i++) {
        vertex(i, ekgWave[i]);
    }
    endShape();
    
    if (ekgWave.length > width) {
        ekgWave.splice(0, 1);
    }

    //Draw earthquake line as EKG
    stroke(242, 95, 92);
    strokeWeight(3);
    noFill();

    let eqY = ekgLine + eqLineOffset;
    let eqSpikeFrames = 20;

    //Pick magnitude from eqHistory over time
    if (eqHistory.length > 0) {
        let eqIndex = floor(frameCount * 0.2) % eqHistory.length;
        currentEQ = eqHistory[eqIndex];
    }

    //Map magnitude to spike height
    let eqSpikeHeight = map(currentEQ, 0, 5, 10, 100);
    let eqIntervals = map(currentEQ, 0, 5, 140, 50); //slightly slower than wave line

    //EKG-style spike
    if (frameCount % eqIntervals < eqSpikeFrames) {
        let t = map(frameCount % eqIntervals, 0, eqSpikeFrames, 0, PI);
        eqY -= eqSpikeHeight * sin(t) * sin(t);
    }

    eqWave.push(eqY);

    //Draw earthquake EKG line
    beginShape();
    for (let i = 0; i < eqWave.length; i++) {
        vertex(i, eqWave[i]);
    }
    endShape();

    if (eqWave.length > width) {
        eqWave.splice(0, 1);
    }
}