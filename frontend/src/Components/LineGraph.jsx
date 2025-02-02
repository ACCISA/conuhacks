import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';

// Register necessary chart components
Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const LineGraph = ({ fireInfo }) => {
  const [fires, setFires] = useState([]);
  const [monthlyCounts, setMonthlyCounts] = useState(Array(12).fill(0));

  useEffect(() => {
    if (Array.isArray(fireInfo) && fireInfo.length > 0) {
      console.log('New fire data received:', fireInfo);

      // Add all new fire incidents to state
      setFires((prevFires) => [...prevFires, ...fireInfo]);

      // Update monthly counts
      setMonthlyCounts((prevCounts) => {
        const updatedCounts = [...prevCounts];
        fireInfo.forEach((fire) => {
          const month = new Date(fire.fire_start_time).getMonth();
          updatedCounts[month] += 1;
        });
        console.log('Updated monthly counts:', updatedCounts);
        return updatedCounts;
      });
    }
  }, [fireInfo]);

  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [
      {
        label: 'Incident Trends',
        data: monthlyCounts,
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
