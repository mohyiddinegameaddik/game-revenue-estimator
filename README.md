# Game Revenue Estimator

A React-based application that estimates game revenue using Steam Charts data, genre analysis, and studio metrics. This tool provides realistic revenue projections for different types of games based on their monetization models.

## 🎮 Features

- **Game Search & Discovery**: Browse and search through thousands of games
- **Revenue Estimation**: Calculate monthly and total revenue based on player data
- **Game Type Detection**: Automatically detects game monetization models (Battle Royale, Premium DLC, MOBA, F2P)
- **Steam Charts Integration**: Uses real Steam player count data for historical analysis
- **Visual Analytics**: Interactive charts showing revenue trends over time
- **Multi-Platform Support**: GitHub Pages deployment ready

## 📊 Revenue Calculation System

### Game Type Detection
The system categorizes games into 4 monetization models:

1. **BATTLE ROYALE** (20% conversion, $72/month ARPPU)
   - Keywords: PUBG, Fortnite, Apex Legends, Warzone, Fall Guys
   - High monetization through battle passes and cosmetics

2. **PREMIUM DLC** (30% conversion, $60/month ARPPU)
   - Keywords: The Sims, Civilization, Cities, Total War
   - Base game sales + expansion/DLC revenue

3. **MOBA** (12% conversion, $60/month ARPPU)
   - Keywords: League of Legends, Dota, MOBA genre
   - Cosmetic monetization model

4. **F2P Traditional** (Variable by genre)
   - Uses genre-based metrics with studio scale multipliers
   - Conversion rates: 1.5% - 5.0%
   - ARPPU: $15 - $80 per genre

### Calculation Formula
```
Revenue = MAU × Conversion Rate × ARPPU
```

### Validation Results
- **PUBG: BATTLEGROUNDS**: Estimated $1.002B vs Real $1.2B (83% accuracy)
- **The Sims™ 4**: Realistic estimates for premium game with DLC model

## 🚀 Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
