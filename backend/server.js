const express = require("express");
const axios = require("axios");
const fs = require("fs");
const { exec } = require("child_process");
const mongoose = require("mongoose");
const DataModel = require("./models/Data"); // MongoDB schema
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/healthscreening", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const CSV_URL = "https://raw.githubusercontent.com/grcxreed/healthscreening-data-app/main/healthscreening-data-app/HealthScreeningTracking.csv";

// Fetch CSV and process with Python
app.get("/process-data", async (req, res) => {
  try {
    const response = await axios.get(CSV_URL);
    fs.writeFileSync("backend/input.csv", response.data);

    // Run Python script to process the CSV file
    exec("python3 backend/wellness_score_check.py", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running Python script: ${stderr}`);
        return res.status(500).send("Processing error");
      }

      const outputData = JSON.parse(fs.readFileSync("backend/output.json", "utf-8"));

      // Save the processed data into MongoDB
      DataModel.create({ data: outputData })
        .then(() => res.json(outputData))
        .catch((err) => res.status(500).json({ error: err.message }));
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all data for frontend
app.get("/get-data", async (req, res) => {
  try {
    const data = await DataModel.find({});
    res.json(data[0]?.data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to filter data by Site and Date range
app.get("/filter-data", async (req, res) => {
  const { site, dateRange } = req.query;
  const [startDate, endDate] = dateRange.split(",").map((date) => new Date(date));

  try {
    const data = await DataModel.find({});
    const filteredData = data[0]?.data.filter((row) => {
      const rowDate = new Date(row.Date);
      const matchesSite = site.length === 0 || site.includes(row.Site);
      const matchesDateRange = rowDate >= startDate && rowDate <= endDate;

      return matchesSite && matchesDateRange;
    });

    res.json(filteredData || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5001, () => console.log("Server running on port 5001"));
