import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Register necessary chart components
Chart.register(ArcElement, Tooltip, Legend);

const PieChart = ({ fireInfo }) => {
  // State to hold the chart data
  // Only update when fireInfo changes
  const [chartData, setChartData] = useState({
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
      },
    ],
  });
  
  const [fireCounts, setFireCounts] = useState({ high: 0, medium: 0, low: 0 });
  
  useEffect(() => {
    setFireCounts((prevCounts) => {
      let newCounts = { ...prevCounts };
  
      fireInfo.forEach((fire) => {
        console.log(fire.severity);
        switch (fire.severity) {
          case 'high':
            newCounts.high++;
            break;
          case 'medium':
            newCounts.medium++;
            break;
          case 'low':
            newCounts.low++;
            break;
          default:
            break;
        }
      });
  
      return newCounts;
    });
  }, [fireInfo]);
  
  useEffect(() => {
    setChartData({
      labels: ['High', 'Medium', 'Low'],
      datasets: [
        {
          data: [fireCounts.high, fireCounts.medium, fireCounts.low],
          backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
        },
      ],
    });
  }, [fireCounts]);
  

  const options = {
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-xl h-[410px]">
      <h2 className="text-xl font-semibold mb-2">Resource Distribution</h2>
      <div className="h-[350px]">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PieChart;