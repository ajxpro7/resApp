import { View } from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';


const Loading = () => {
  return (
    <View style={{ height: 300, width: 300 }}>
      <LottieView 
        style={{ flex: 1 }} 
        source={require('../assets/images/Loading.json')} 
        autoPlay 
        loop 
      />
    </View>
  );
};

export default Loading;