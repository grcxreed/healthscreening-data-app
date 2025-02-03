const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { exec } = require('child_process'); // To run the Python script
const axios = require('axios'); // To download the CSV file from URL
const fs = require('fs'); // To handle file operations

const app = express();  // Initialize express app
app.use(cors());  // Use CORS middleware after app is initialized

const port = 5001;

const uri = "mongodb+srv://gracereed:parsimony76@healthscreeningdata.uqd0d.mongodb.net/healthscreeningdata?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useUnifiedTopology: true,
});

app.use(express.json()); // To parse JSON requests

// Route to run Python script
app.post('/process-data', async (req, res) => {
  const { dataFrameUrl } = req.body;  // Expecting the URL of the DataFrame hosted on GitHub
  
  try {
    // Download the CSV file from the URL (we need to download it locally)
    const response = await axios.get(dataFrameUrl);
    const filePath = './temp_data.csv';

    // Save the CSV content to a local file
    fs.writeFileSync(filePath, response.data);
    
    // Run the Python script with the path to the temporary file
    exec(`python3 wellness_score_check.py ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error}`);
        return res.status(500).json({ error: "Error running script" });
      }

      // After the script is executed successfully, save the output to MongoDB
      client.connect()
        .then(() => {
          const db = client.db();
          const collection = db.collection('processedData');
          
          // Parse the output from the Python script (JSON format)
          const processedData = JSON.parse(stdout);

          collection.insertMany(processedData)
            .then(() => {
              res.json({ message: "Data processed and saved to MongoDB", processedData });
            })
            .catch(err => {
              console.error("Error inserting data into MongoDB", err);
              res.status(500).json({ error: "Failed to save data" });
            });
        })
        .catch(err => {
          console.error("MongoDB connection failed", err);
          res.status(500).json({ error: "MongoDB connection failed" });
        });
    });
  } catch (error) {
    console.error('Error downloading CSV:', error);
    res.status(500).json({ error: "Error downloading the CSV file" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
