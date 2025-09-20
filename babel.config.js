module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Plugin actualizado según la advertencia de Reanimated.
      'react-native-worklets/plugin'
    ],
  };
};