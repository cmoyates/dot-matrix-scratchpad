import {
  SharedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

export const useFlickerFreeClock = (
  speed: SharedValue<number>,
  isPaused: SharedValue<boolean>,
) => {
  const integratedTime = useSharedValue(0);
  const lastTimestamp = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    if (isPaused.value) {
      // When paused, update the last timestamp to prevent a time jump on resume
      lastTimestamp.value = frameInfo.timestamp;
      return;
    }

    if (lastTimestamp.value === 0) {
      lastTimestamp.value = frameInfo.timestamp;
    }

    // Calculate time passed since the last frame
    const delta = frameInfo.timestamp - lastTimestamp.value;

    // Add the scaled delta to our integrated time. This is the key step.
    // The increment is small and continuous, even if `speed.value` changes.
    integratedTime.value += delta * speed.value;

    // Update the last timestamp for the next frame
    lastTimestamp.value = frameInfo.timestamp;
  });

  return integratedTime;
};
