module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage|react-native-gifted-charts|gifted-charts-core|@react-native-community/datetimepicker|react-native-linear-gradient)/)',
  ],
};
