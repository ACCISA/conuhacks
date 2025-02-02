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

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
      <h2 className="text-xl font-semibold mb-2">Resource Distribution</h2>
      <Pie data={data} />
    </div>
  );
};

export default PieChart;
