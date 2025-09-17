import React, { useState, useEffect } from 'react';
import GameCard from './GameCard';
import RevenueChart from './RevenueChart';
import RevenueDisplay from './RevenueDisplay';
import './GameList.css';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchGames(searchTerm);
    } else {
      fetchGames();
    }
  }, [searchTerm]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://grm.gameops.tech/games/games/');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setGames(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchGames = async (query) => {
    try {
      setLoading(true);
      const response = await fetch(`https://grm.gameops.tech/games/search/?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search games');
      }
      const data = await response.json();
      setGames(data.game?.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRevenue = async (game) => {
    setSelectedGame(game);
    
    try {
      // Fetch detailed game data
      const gameResponse = await fetch(`https://grm.gameops.tech/games/games/${game.id}/`);
      const gameData = await gameResponse.json();
      
      // Calculate conversion rate based on genres and studio scale
      const conversionRate = await calculateConversionRate(gameData);
      
      // Calculate estimated monthly revenue
      const estimatedMonthlyRevenue = gameData.avg_monthly_active_user * conversionRate * 15; // ARPPU = $15
      
      // Generate revenue data based on calculated values
      const revenueData = {
        totalRevenue: gameData.revenue || 0,
        totalUnitsSold: gameData.units_sold || 0,
        estimatedMonthlyRevenue: estimatedMonthlyRevenue,
        conversionRate: conversionRate,
        avgMonthlyActiveUser: gameData.avg_monthly_active_user || 0,
        monthlyRevenue: generateMonthlyRevenueData(estimatedMonthlyRevenue),
        unitsSold: generateUnitsSoldData(gameData.units_sold || 0),
        monthlyLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      };
      
      setRevenueData(revenueData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setRevenueData(null);
    }
  };

  const calculateConversionRate = async (gameData) => {
    // Genre multipliers mapping
    const genreMultipliers = {
      'INDIE': 0.80,
      'ACTION': 0.80,
      'ADVENTURE': 0.90,
      'RPG': 1.20,
      'SPORTS': 1.10,
      'RACING': 1.00,
      'PUZZLE': 0.85,
      'QUIZ_AND_TRIVIA': 0.80,
      'STRATEGY': 1.10,
      'HORROR_AND_SURVIVAL': 0.90,
      'PLATFORMER': 0.85,
      'FIGHTING': 1.00,
      'BEAT_EM_UP': 0.85,
      'MUSIC': 0.80,
      'SHOOTER': 0.80,
      'PINBALL': 0.70,
      'ARCADE': 0.80,
      'CARD_AND_BOARD_GAME': 1.50,
      'POINT_AND_CLICK': 0.85,
      'TACTICAL': 1.10,
      'VISUAL_NOVEL': 0.90,
      'MOBA': 1.10
    };

    // Calculate genre multiplier average
    let genreMultiplierSum = 0;
    let genreCount = 0;
    
    if (gameData.genres && gameData.genres.length > 0) {
      gameData.genres.forEach(genre => {
        const genreKey = genre.value.toUpperCase();
        const multiplier = genreMultipliers[genreKey] || 1.00; // Default to 1.00 if not found
        genreMultiplierSum += multiplier;
        genreCount++;
      });
    }

    const avgGenreMultiplier = genreCount > 0 ? genreMultiplierSum / genreCount : 1.00;

    // Get studio scale multiplier
    let studioMultiplier = 1.00;
    
    if (gameData.developers && gameData.developers.length > 0) {
      try {
        const developerSlug = gameData.developers[0].slug;
        const developerResponse = await fetch(`https://grm.gameops.tech/games/companies/developers/?slug=${developerSlug}`);
        const developerData = await developerResponse.json();
        
        if (developerData.results && developerData.results.length > 0) {
          const employeesNumber = developerData.results[0].employees_number;
          
          // Studio scale multipliers mapping
          const studioMultipliers = {
            '1 - 10': 0.80,
            '11 - 50': 1.00,
            '51 - 100': 1.10,
            '101 - 250': 1.20,
            '251 - 500': 1.20,
            '501 - 1000': 1.20,
            '1001 - 5000': 1.20,
            '5001 - 10000': 1.20,
            '10001+': 1.20
          };
          
          studioMultiplier = studioMultipliers[employeesNumber] || 1.00;
        }
      } catch (error) {
        console.error('Error fetching developer data:', error);
      }
    }

    // Calculate conversion rate as average of genre and studio multipliers
    return (avgGenreMultiplier + studioMultiplier) / 2;
  };

  const generateMonthlyRevenueData = (monthlyRevenue) => {
    // Generate 12 months of data with some variation
    const months = [];
    for (let i = 0; i < 12; i++) {
      const variation = 0.8 + (Math.random() * 0.4); // 80% to 120% variation
      months.push(monthlyRevenue * variation);
    }
    return months;
  };

  const generateUnitsSoldData = (totalUnitsSold) => {
    // Generate 12 months of data with some variation
    const months = [];
    for (let i = 0; i < 12; i++) {
      const variation = 0.8 + (Math.random() * 0.4); // 80% to 120% variation
      months.push((totalUnitsSold / 12) * variation);
    }
    return months;
  };

  return (
    <div className="game-list-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="main-content">
        <div className="games-section">
          {loading && (
            <div className="loading">Loading games...</div>
          )}
          
          {error && (
            <div className="error">Error: {error}</div>
          )}
          
          {!loading && !error && (
            <div className="games-list">
              {games.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  onGetRevenue={() => handleGetRevenue(game)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="revenue-section">
          <RevenueDisplay game={selectedGame} revenueData={revenueData} />
          <RevenueChart game={selectedGame} revenueData={revenueData} />
        </div>
      </div>
    </div>
  );
};

export default GameList;
