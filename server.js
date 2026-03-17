// server.js
const express = require("express");
const fetch = require("node-fetch");
const nunjucks = require("nunjucks");

const app = express();

app.use(express.static("public")); // serve static files

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

// Landing page
app.get("/", (req, res) => {
  res.render("landing.njk");
});

// Sketch page
app.get("/index", (req, res) => {
  res.render("index.njk");
});

// waves api endpoint
app.get("/api/waves", async (req, res) => {
  try {
    const location = req.query.location || "default";

    let buoy;

    if (location === "honolulu") {
      buoy = "51201";
    } else if (location === "gulf-of-mexico") {
      buoy = "42002";
    } else {
      buoy = "46026"; // San Francisco / Alcatraz region
    }

    const response = await fetch(
      `https://www.ndbc.noaa.gov/data/realtime2/${buoy}.txt`,
    );

    const text = await response.text();
    res.send(text);
  } catch (error) {
    console.error("NOAA fetch error:", error);
    res.status(500).json({ error: "Wave data failed" });
  }
});

// earthquakes api endpoint
app.get("/api/earthquakes", async (req, res) => {
  try {
    const response = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("USGS fetch error:", error);
    res.status(500).send(error.toString());
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
