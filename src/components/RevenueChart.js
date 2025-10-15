import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './RevenueChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ game, revenueData }) => {
  if (!revenueData) {
    return (
      <div className="revenue-chart-container">
        <div className="no-data">No revenue data available</div>
      </div>
    );
  }

  // Prepare datasets based on available data
  const datasets = [];

  // Add Steam Charts player count dataset if available
  if (revenueData.steamChartsData && revenueData.steamChartsData.playerCounts && Array.isArray(revenueData.steamChartsData.playerCounts)) {
    console.log('Adding Steam Charts data:', revenueData.steamChartsData.playerCounts.length, 'data points');
    
    // Add estimated revenue line based on actual player counts (show first/in front)
    // Using optimized F2P formula: Revenue = PlayerCount × ConversionRate × ARPPU
    const estimatedRevenueOverTime = revenueData.steamChartsData.playerCounts.map(playerCount => {
      const payingUsers = playerCount * revenueData.conversionRate;
      return payingUsers * revenueData.arppu;
    });

    datasets.push({
      label: 'Estimated Revenue (Based on Player Count)',
      data: estimatedRevenueOverTime,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1,
      yAxisID: 'y',
    });

    // Add player count line (show second/behind)
    datasets.push({
      label: 'Steam Player Count',
      data: revenueData.steamChartsData.playerCounts,
      borderColor: 'rgb(255, 165, 0)',
      backgroundColor: 'rgba(255, 165, 0, 0.2)',
      tension: 0.1,
      yAxisID: 'y1',
    });
  }

  // Check if we have any datasets
  if (datasets.length === 0) {
    return (
      <div className="revenue-chart-container">
        <div className="no-data">
          {revenueData.steamId 
            ? `No Steam Charts data available for Steam ID: ${revenueData.steamId}` 
            : 'No Steam ID found for this game'
          }
        </div>
      </div>
    );
  }

  console.log('Chart datasets:', datasets.map(d => ({ label: d.label, dataLength: d.data.length })));

  // Determine labels based on available data
  let labels;
  if (revenueData.steamChartsData && revenueData.steamChartsData.labels && Array.isArray(revenueData.steamChartsData.labels)) {
    labels = revenueData.steamChartsData.labels;
  } else {
    labels = revenueData.monthlyLabels || [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
  }

  // Ensure labels and data arrays have the same length
  const maxDataLength = Math.max(...datasets.map(dataset => dataset.data.length));
  if (labels.length !== maxDataLength) {
    // Adjust labels to match data length
    if (labels.length < maxDataLength) {
      // Extend labels
      const additionalLabels = [];
      for (let i = labels.length; i < maxDataLength; i++) {
        additionalLabels.push(`Period ${i + 1}`);
      }
      labels = [...labels, ...additionalLabels];
    } else {
      // Truncate labels
      labels = labels.slice(0, maxDataLength);
    }
  }

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
        },
      },
      title: {
        display: true,
        text: `${game.title} - Revenue Analysis`,
        color: '#ffffff',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue ($)',
          color: '#ffffff',
        },
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: '#444',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Player Count',
          color: '#ffffff',
        },
        ticks: {
          color: '#ffffff',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: '#444',
        },
      },
    },
  };

  return (
    <div className="revenue-chart-container">
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default RevenueChart;
