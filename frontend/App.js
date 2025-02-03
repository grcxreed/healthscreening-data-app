import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import Slider from "@mui/material/Slider";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);
  const [dateRange, setDateRange] = useState([new Date("2020-01-01").getTime(), new Date("2023-12-31").getTime()]);

  useEffect(() => {
    axios.get("http://localhost:5001/get-data") // Make a request to your backend API
      .then((response) => {
        setData(response.data);
        setFilteredData(response.data);
        const siteOptions = Array.from(new Set(response.data.map((row) => row.Site)));
        setSites(siteOptions);
      });
  }, []);

  useEffect(() => {
    const filtered = data.filter((row) => {
      const rowDate = new Date(row.Date).getTime();
      const matchesDate = rowDate >= dateRange[0] && rowDate <= dateRange[1];
      const matchesSite = selectedSites.length === 0 || selectedSites.includes(row.Site);
      return matchesDate && matchesSite;
    });
    setFilteredData(filtered);
  }, [selectedSites, dateRange, data]);

  const handleSiteChange = (event) => {
    const { value, checked } = event.target;
    setSelectedSites((prev) =>
      checked ? [...prev, value] : prev.filter((site) => site !== value)
    );
  };

  const handleDateChange = (event, newValue) => {
    setDateRange(newValue);
  };

  const chartData = {
    labels: filteredData.map((row) => row.Date),
    datasets: [
      {
        label: "Wellness Score",
        data: filteredData.map((row) => row.Wellness_Score),
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <h1>Health Screening Dashboard</h1>

      {/* Filter by Sites */}
      <div>
        {sites.map((site) => (
          <FormControlLabel
            key={site}
            control={
              <Checkbox
                checked={selectedSites.includes(site)}
                onChange={handleSiteChange}
                value={site}
                color="primary"
              />
            }
            label={site}
          />
        ))}
      </div>

      {/* Date Range Slider */}
      <Slider
        value={dateRange}
        onChange={handleDateChange}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => new Date(value).toLocaleDateString()}
        min={new Date("2020-01-01").getTime()}
        max={new Date("2023-12-31").getTime()}
        step={86400000} // 1 day in ms
      />

      {/* Data Visualization */}
      {filteredData.length > 0 && (
        <Line data={chartData} />
      )}
    </div>
  );
};

export default App;
