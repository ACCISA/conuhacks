// PieChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Register necessary chart components
Chart.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const data = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [30, 50, 20],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
      },
    ],
  };

  const options = {
    maintainAspectRatio: false, // This allows custom height to work
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-xl h-[410px]">
      <h2 className="text-xl font-semibold mb-2">Resource Distribution</h2>
      <div className="h-[350px]">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default PieChart;
