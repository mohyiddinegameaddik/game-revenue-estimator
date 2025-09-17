import React from 'react';
import './GameCard.css';

const GameCard = ({ game, onGetRevenue }) => {
  const handleGetRevenue = () => {
    onGetRevenue();
  };

  return (
    <div className="game-card">
      <div className="game-cover">
        {game.portrait?.source ? (
          <img 
            src={game.portrait.source} 
            alt={game.title}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : game.portrait?.url ? (
          <img 
            src={game.portrait.url} 
            alt={game.title}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : (
          <div className="placeholder-image">
            <div className="placeholder-icon">🎮</div>
            <div className="placeholder-text">No Image</div>
          </div>
        )}
        <div className="placeholder-image" style={{display: 'none'}}>
          <div className="placeholder-icon">🎮</div>
          <div className="placeholder-text">No Image</div>
        </div>
      </div>
      
      <div className="game-info">
        <h3 className="game-title">{game.title}</h3>
        <div className="game-developer">
          {game.developers && game.developers.length > 0 && (
            <span>{game.developers.map(dev => dev.name).join(', ')}</span>
          )}
        </div>
      </div>
      
      <div className="game-actions">
        <button className="connect-button" onClick={handleGetRevenue}>
          Get revenue
        </button>
      </div>
    </div>
  );
};

export default GameCard;
