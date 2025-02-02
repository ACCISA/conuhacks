import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';

// Register necessary chart components
Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const LineGraph = () => {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Incident Trends',
        data: [12, 19, 3, 5, 2],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        fill: true,
      },
    ],
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-xl h-[410px]"> 
      <h2 className="text-xl font-semibold mb-2">Incident Trends</h2>
      <Line data={data} />
    </div>
  );
};

export default LineGraph;
