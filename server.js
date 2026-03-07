// server.js
const express = require("express");
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

app.get("/api/waves", async (req, res) => {
  try {
    const response = await fetch(
      "https://www.ndbc.noaa.gov/data/realtime2/51101.txt",
    );
    const text = await response.text();
    res.send(text);
  } catch (error) {
    console.error("NOAA fetch error:", error);
    res.status(500).json({ error: "Wave data failed" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
