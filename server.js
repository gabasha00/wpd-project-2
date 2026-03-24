// server.js
const express = require("express");
const fetch = require("node-fetch");
const nunjucks = require("nunjucks");

const app = express();

app.use(express.static("public")); // serve static files

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  noCache: true
});

// Landing page
app.get("/", (req, res) => {
  res.render("landing.njk");
});

// Sketch page
app.get("/index", (req, res) => {
  res.render("index.njk");
});

// About page
app.get("/about", (req, res) => {
  res.render("about.njk");
});

//Individual location pages
app.get("/honolulu", (req, res) => {
  res.render("honolulu.njk")
});
app.get("/tokyo", (req, res) => {
  res.render("tokyo.njk")
});
app.get("/sf", (req, res) => {
  res.render("sf.njk")
});

// waves api endpoint
app.get("/api/waves", async (req, res) => {
  try {
    const location = req.query.location || "default";

    let buoy;

    if (location === "honolulu") {
      buoy = "51201";
    } else if (location === "tokyo") {
      buoy = "21413";
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
    const location = req.query.location || "san-francisco"

    //API uses minimum and maximum latitude and longitude values for locations.
    let minlat, maxlat, minlon, maxlon;

    //This makes sure to specifically target the three locations we are using
    if (location === "honolulu") {
      minlat = 21; maxlat = 21.5; minlon = -158.5; maxlon = -157.5;
    } else if  (location === "tokyo") {
      minlat = 35.5; maxlat = 36; minlon = 139; maxlon = 140;
    } else {
      minlat = 37; maxlat = 39; minlon = -123; maxlon = -121;
    }

    //Updated URL that uses the latitude and longitude specifications
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=${minlat}&maxlatitude=${maxlat}&minlongitude=${minlon}&maxlongitude=${maxlon}`;
    const response = await fetch(url);
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
