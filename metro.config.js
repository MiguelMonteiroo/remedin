const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const config = {
  resolver: {
    blockList: [/[\\/]\.cxx[\\/].*/],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
