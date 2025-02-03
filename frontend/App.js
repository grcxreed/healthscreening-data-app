import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle the data processing logic
  const handleProcessData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sending the POST request to the backend with the dataFrameUrl
      const response = await axios.post('http://localhost:5001/process-data', {
        dataFrameUrl: 'https://github.com/grcxreed/healthscreening-data-app/blob/main/HealthScreeningTracking.csv'  // Replace with your actual CSV URL
      });
      setData(response.data.processedData);  // Assuming 'processedData' is returned by the backend
    } catch (error) {
      setError('Error processing data');  // Show error if request fails
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Button to trigger data processing */}
      <button onClick={handleProcessData} disabled={loading}>
        {loading ? 'Processing...' : 'Process Data'}
      </button>

      {/* Display error message if there was an issue */}
      {error && <p>{error}</p>}

      {/* Display the processed data when available */}
      {data && (
        <div>
          <h3>Processed Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
