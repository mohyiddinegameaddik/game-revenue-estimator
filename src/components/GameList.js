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
      const response = await fetch('https://grm.gameops.tech/games/games/?monetization_options=free_to_play&exclude_nulls=steam_id');
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
      
      // Calculate revenue metrics (conversion rate and ARPPU) based on genres and studio scale
      const metrics = await calculateRevenueMetrics(gameData);
      
      // Calculate estimated monthly revenue using proper F2P formula:
      // Revenue = MAU × Conversion Rate × ARPPU
      const mau = gameData.avg_monthly_active_user || 0;
      const payingUsers = mau * metrics.conversionRate;
      const estimatedMonthlyRevenue = payingUsers * metrics.arppu;
      
      // Fetch Steam Charts data if steam_id is available
      let steamChartsData = null;
      if (gameData.steam_id) {
        try {
          console.log('Fetching Steam Charts for Steam ID:', gameData.steam_id);
          // Use CORS proxy to bypass CORS restrictions
          const steamResponse = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://steamcharts.com/app/${gameData.steam_id}/chart-data.json`)}`);
          console.log('Steam Charts response status:', steamResponse.status);
          if (steamResponse.ok) {
            const steamData = await steamResponse.json();
            console.log('Raw Steam Charts data:', steamData);
            steamChartsData = processSteamChartsData(steamData);
            console.log('Processed Steam Charts data:', steamChartsData);
          } else {
            console.error('Steam Charts API error:', steamResponse.status, steamResponse.statusText);
          }
        } catch (steamError) {
          console.error('Error fetching Steam Charts data:', steamError);
        }
      } else {
        console.log('No Steam ID found for game:', gameData.title);
      }
      
      // Calculate total revenue from Steam Charts data if available
      let totalSteamChartsRevenue = 0;
      if (steamChartsData && steamChartsData.playerCounts && Array.isArray(steamChartsData.playerCounts)) {
        totalSteamChartsRevenue = steamChartsData.playerCounts.reduce((total, playerCount) => {
          const payingUsers = playerCount * metrics.conversionRate;
          const monthlyRevenue = payingUsers * metrics.arppu;
          return total + monthlyRevenue;
        }, 0);
      }

      // Use Steam Charts total revenue as the primary total revenue if available
      const primaryTotalRevenue = totalSteamChartsRevenue > 0 ? totalSteamChartsRevenue : (gameData.revenue || 0);

      // Generate revenue data based on calculated values
      const revenueData = {
        totalRevenue: primaryTotalRevenue,
        totalSteamChartsRevenue: totalSteamChartsRevenue,
        totalUnitsSold: gameData.units_sold || 0,
        estimatedMonthlyRevenue: estimatedMonthlyRevenue,
        conversionRate: metrics.conversionRate,
        arppu: metrics.arppu,
        gameType: metrics.gameType,
        payingUsers: Math.round(payingUsers),
        avgMonthlyActiveUser: mau,
        monthlyRevenue: generateMonthlyRevenueData(estimatedMonthlyRevenue),
        unitsSold: generateUnitsSoldData(gameData.units_sold || 0),
        monthlyLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        steamChartsData: steamChartsData,
        steamId: gameData.steam_id
      };
      
      console.log('Revenue data generated:', revenueData);
      console.log('Steam Charts data:', steamChartsData);
      setRevenueData(revenueData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setRevenueData(null);
    }
  };

  const detectGameType = (gameData) => {
    const title = gameData.title.toLowerCase();
    const genres = gameData.genres?.map(g => g.value.toLowerCase()) || [];
    
    // Battle Royale games (high monetization, battle passes, cosmetics)
    const battleRoyaleKeywords = ['battlegrounds', 'battle royale', 'fortnite', 'apex legends', 'warzone', 'fall guys'];
    if (battleRoyaleKeywords.some(keyword => title.includes(keyword))) {
      return 'battle_royale';
    }
    
    // Premium games with DLC (Sims, Civilization, etc.)
    const premiumKeywords = ['the sims', 'civilization', 'cities:', 'europa universalis', 'crusader kings', 'total war'];
    if (premiumKeywords.some(keyword => title.includes(keyword))) {
      return 'premium_dlc';
    }
    
    // MOBA games (League of Legends style)
    if (genres.includes('moba') || title.includes('league of legends') || title.includes('dota')) {
      return 'moba';
    }
    
    // Traditional F2P games
    return 'f2p';
  };

  const calculateRevenueMetrics = async (gameData) => {
    const gameType = detectGameType(gameData);
    
    // Battle Royale games: Moderate ARPPU, many players buy battle passes
    if (gameType === 'battle_royale') {
      return {
        conversionRate: 0.20,  // 20% regularly buy battle passes/cosmetics
        arppu: 72             // $72/month (battle pass + cosmetics)
      };
    }
    
    // Premium games with DLC: Everyone pays base game + many buy DLC
    if (gameType === 'premium_dlc') {
      return {
        conversionRate: 0.30,  // 30% buy DLC/expansions
        arppu: 60             // $60/month (base game amortized + DLC)
      };
    }
    
    // MOBA games: Moderate conversion, high spending
    if (gameType === 'moba') {
      return {
        conversionRate: 0.12,  // 12% spend on cosmetics
        arppu: 60             // $60/month (skins, champions)
      };
    }
    
    // Traditional F2P games: Lower conversion, lower spending
    const genreConversionRates = {
      'INDIE': 0.025,        // 2.5%
      'ACTION': 0.030,       // 3%
      'ADVENTURE': 0.025,    // 2.5%
      'RPG': 0.045,          // 4.5% (higher for RPGs)
      'SPORTS': 0.035,       // 3.5%
      'RACING': 0.030,       // 3%
      'PUZZLE': 0.020,       // 2% (lower monetization)
      'QUIZ_AND_TRIVIA': 0.015, // 1.5%
      'STRATEGY': 0.040,     // 4%
      'HORROR_AND_SURVIVAL': 0.025, // 2.5%
      'PLATFORMER': 0.025,   // 2.5%
      'FIGHTING': 0.035,     // 3.5%
      'BEAT_EM_UP': 0.030,   // 3%
      'MUSIC': 0.020,        // 2%
      'SHOOTER': 0.040,      // 4% (high monetization)
      'PINBALL': 0.015,      // 1.5%
      'ARCADE': 0.025,       // 2.5%
      'CARD_AND_BOARD_GAME': 0.050, // 5% (highest monetization)
      'POINT_AND_CLICK': 0.020,  // 2%
      'TACTICAL': 0.040,     // 4%
      'VISUAL_NOVEL': 0.025, // 2.5%
      'MOBA': 0.050          // 5% (high monetization)
    };

    const genreARPPU = {
      'INDIE': 25,
      'ACTION': 45,
      'ADVENTURE': 35,
      'RPG': 75,             // Higher ARPPU for RPGs
      'SPORTS': 50,
      'RACING': 40,
      'PUZZLE': 20,
      'QUIZ_AND_TRIVIA': 15,
      'STRATEGY': 60,
      'HORROR_AND_SURVIVAL': 35,
      'PLATFORMER': 30,
      'FIGHTING': 45,
      'BEAT_EM_UP': 35,
      'MUSIC': 25,
      'SHOOTER': 55,
      'PINBALL': 15,
      'ARCADE': 30,
      'CARD_AND_BOARD_GAME': 80, // Highest ARPPU
      'POINT_AND_CLICK': 25,
      'TACTICAL': 60,
      'VISUAL_NOVEL': 30,
      'MOBA': 65
    };

    // Calculate genre-based conversion rate and ARPPU for traditional F2P games
    let totalConversionRate = 0;
    let totalARPPU = 0;
    let genreCount = 0;
    
    if (gameData.genres && gameData.genres.length > 0) {
      gameData.genres.forEach(genre => {
        const genreKey = genre.value.toUpperCase();
        const convRate = genreConversionRates[genreKey] || 0.030; // Default 3%
        const arppu = genreARPPU[genreKey] || 40; // Default $40
        totalConversionRate += convRate;
        totalARPPU += arppu;
        genreCount++;
      });
    }

    const avgConversionRate = genreCount > 0 ? totalConversionRate / genreCount : 0.030;
    const avgARPPU = genreCount > 0 ? totalARPPU / genreCount : 40;

    // Get studio scale multiplier for ARPPU
    let studioMultiplier = 1.00;
    
    if (gameData.developers && gameData.developers.length > 0) {
      try {
        const developerSlug = gameData.developers[0].slug;
        const developerResponse = await fetch(`https://grm.gameops.tech/games/companies/developers/?slug=${developerSlug}`);
        const developerData = await developerResponse.json();
        
        if (developerData.results && developerData.results.length > 0) {
          const employeesNumber = developerData.results[0].employees_number;
          
          // Studio scale affects ARPPU (larger studios have better monetization)
          const studioMultipliers = {
            '1 - 10': 0.70,      // Smaller studios, lower ARPPU
            '11 - 50': 0.90,
            '51 - 100': 1.10,
            '101 - 250': 1.30,
            '251 - 500': 1.50,
            '501 - 1000': 1.70,
            '1001 - 5000': 2.00,
            '5001 - 10000': 2.50,
            '10001+': 3.00       // Large studios (AAA), highest ARPPU
          };
          
          studioMultiplier = studioMultipliers[employeesNumber] || 1.00;
        }
      } catch (error) {
        console.error('Error fetching developer data:', error);
      }
    }

    // Apply studio multiplier to ARPPU
    const finalARPPU = avgARPPU * studioMultiplier;

    return {
      conversionRate: avgConversionRate,
      arppu: finalARPPU,
      gameType: gameType
    };
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

  const processSteamChartsData = (steamData) => {
    if (!steamData || !Array.isArray(steamData)) {
      return null;
    }

    // Process the Steam Charts data
    // Each entry is [timestamp, playerCount]
    const processedData = steamData.map(([timestamp, playerCount]) => ({
      date: new Date(timestamp),
      playerCount: playerCount
    }));

    // Sort by date to ensure chronological order
    processedData.sort((a, b) => a.date - b.date);

    // Filter to only include first day of each month
    const monthlyData = [];
    const seenMonths = new Set();
    
    processedData.forEach(item => {
      const date = item.date;
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      // Only include if this is the first occurrence of this month
      if (!seenMonths.has(monthKey)) {
        seenMonths.add(monthKey);
        monthlyData.push(item);
      }
    });

    // Extract labels and data for the chart
    const labels = monthlyData.map(item => {
      const date = item.date;
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });

    const playerCounts = monthlyData.map(item => item.playerCount);

    return {
      labels: labels,
      playerCounts: playerCounts,
      rawData: monthlyData
    };
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
