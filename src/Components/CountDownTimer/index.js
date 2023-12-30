import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const CountdownCircle = ({ duration, onComplete, children, size }) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(intervalId);
          onComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [duration, onComplete]);

  const radius = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = ((duration - timeRemaining) / duration) * circumference;

  return (
    <View>
      <Svg height={size} width={size}>
        <Circle cx="100" cy="100" r={radius} stroke="#3498db" strokeWidth="10" fill="transparent" />
        <Circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#ecf0f1"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
        />
        <SvgText x="50%" y="50%" fontSize="20" fill="#2c3e50" textAnchor="middle" dy=".3em">
          {timeRemaining}
        </SvgText>
      </Svg>
      {children}
    </View>
  );
};

export default CountdownCircle;
