import React from 'react';
import './RevenueDisplay.css';

const RevenueDisplay = ({ game, revenueData }) => {
  if (!revenueData) {
    return (
      <div className="revenue-display-container">
        <div className="no-data">Select a game to view revenue</div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (rate) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  return (
    <div className="revenue-display-container">
      <div className="revenue-header">
        <h3>{game.title}</h3>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Game ID</span>
            <span className="stat-value">{game.id}</span>
          </div>
          {revenueData.gameType && (
            <div className="stat-item">
              <span className="stat-label">Game Type</span>
              <span className="stat-value game-type">{revenueData.gameType.replace('_', ' ').toUpperCase()}</span>
            </div>
          )}
          {revenueData.steamId && (
            <div className="stat-item">
              <span className="stat-label">Steam ID</span>
              <span className="stat-value">{revenueData.steamId}</span>
            </div>
          )}
          <div className="stat-item highlight">
            <span className="stat-label">Estimated Monthly Revenue</span>
            <span className="stat-value revenue">{formatCurrency(revenueData.estimatedMonthlyRevenue || 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Monthly Active Users (MAU)</span>
            <span className="stat-value">{formatNumber(revenueData.avgMonthlyActiveUser || 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Conversion Rate</span>
            <span className="stat-value">{formatPercentage(revenueData.conversionRate || 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Paying Users</span>
            <span className="stat-value">{formatNumber(revenueData.payingUsers || 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">ARPPU (per month)</span>
            <span className="stat-value">{formatCurrency(revenueData.arppu || 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Revenue (API)</span>
            <span className="stat-value">{formatCurrency(revenueData.totalRevenue || 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Units Sold</span>
            <span className="stat-value">{formatNumber(revenueData.totalUnitsSold || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDisplay;
