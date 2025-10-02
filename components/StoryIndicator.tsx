import React from 'react';
import { View, StyleSheet } from 'react-native';

type Props = {
  total: number;
  activeIndex: number;
};

const StoryIndicator: React.FC<Props> = ({ total, activeIndex }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i < activeIndex
              ? styles.watched
              : i === activeIndex
              ? styles.active
              : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
};

export default StoryIndicator;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 30,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  inactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  active: {
    backgroundColor: 'white',
  },
  watched: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});
