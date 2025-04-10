/**
 * @format
 */

// Set global flag to silence Firebase modular API deprecation warnings
global.RNFB_SILENCE_MODULAR_DEP = true;

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

console.log('INDEX.JS: LOADING MAIN NAVIGATION APP');
AppRegistry.registerComponent(appName, () => App);
console.log('MAIN NAVIGATION APP REGISTERED SUCCESSFULLY');
