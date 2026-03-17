let waveValues = []; // store all NOAA wave heights
let displayWave = 0; // smoothed for visual
let baseRadius = 100;
let pulseAmplitude = 10;
let queryInterval = 15000;

let currentIndex = 0; // index in waveValues array
let cycleSpeed = 1;

let locationParam = "default";

function getLocation() {
  const params = new URLSearchParams(window.location.search);
  locationParam = params.get("location") || "default";
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(60);
  noStroke();

  getLocation();

  getWaveData();
  setInterval(getWaveData, queryInterval);
}

function draw() {
  background(10, 20, 50);
  rotateY(frameCount * 0.01);

  if (waveValues.length > 0) {
    // pick current wave height
    let wave = waveValues[currentIndex];

    // smooth transition
    displayWave = lerp(displayWave, wave, 0.05);

    // advance index and loop
    currentIndex += cycleSpeed;
    if (currentIndex >= waveValues.length) currentIndex = 0;
  }

  let pulse =
    baseRadius + displayWave * 20 + sin(frameCount * 0.2) * pulseAmplitude;

  sphere(pulse, 64, 64);
}

async function getWaveData() {
  try {
    const res = await fetch(`/api/waves?location=${locationParam}`);
    const text = await res.text();

    const lines = text.split("\n");
    const dataLines = lines.filter((line) => line && !line.startsWith("#"));

    waveValues = [];
    for (let line of dataLines) {
      const cols = line.trim().split(/\s+/);
      const value = parseFloat(cols[8]); // WVHT column
      if (!isNaN(value)) waveValues.push(value);
    }

    currentIndex = 0; // reset loop when new data arrives
    console.log("Loaded", waveValues.length, "wave values");
  } catch (err) {
    console.error("Wave fetch error:", err);
  }
}
