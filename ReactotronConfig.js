let reactotron = null;

if (__DEV__) {
  try {
    const Reactotron = require('reactotron-react-native').default;
    if (Reactotron && typeof Reactotron.configure === 'function') {
      reactotron = Reactotron.configure({ name: 'Indolj Lens' })
        .useReactNative()
        .connect();
    }
  } catch {
    // Reactotron is suppressed in Node/Jest testing environment
  }
}

export default reactotron;
