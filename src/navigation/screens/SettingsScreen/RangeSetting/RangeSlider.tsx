import { memo, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ThemeColors } from '../../../../constants/colors';
import { monoText } from '../../../../constants/typography';
import { useThemedStyles } from '../../../../hooks/useAppTheme';
import { Range } from '../../../../store/useSettingsStore';

interface RangeSliderProps {
  bounds: Range;
  value: Range;
  onChange: (value: Range) => void;
}

export const RangeSlider = memo(RangeSliderComponent);

function RangeSliderComponent({ bounds, value, onChange }: RangeSliderProps) {
  const styles = useThemedStyles(createStyles);
  const [width, setWidth] = useState(0);
  const [positions] = useState(() => ({
    min: new Animated.Value(0),
    max: new Animated.Value(0),
  }));
  const [fillWidth] = useState(() =>
    Animated.subtract(positions.max, positions.min),
  );
  const draggedHandleRef = useRef<Handle | null>(null);
  const latest = useRef({ width, bounds, value, onChange });
  latest.current = { width, bounds, value, onChange };

  useEffect(() => {
    if (draggedHandleRef.current) return;

    positions.min.setValue(toX(value[0], width, bounds));
    positions.max.setValue(toX(value[1], width, bounds));
  }, [bounds, positions, value, width]);

  const [panResponder] = useState(() => {
    let startX = 0;
    let draggedValue: Range = latest.current.value;
    let isChoosingHandle = false;

    const follow = (fingerX: number) => {
      const handle = draggedHandleRef.current;

      if (!handle) return;

      const { width: sliderWidth, bounds: sliderBounds } = latest.current;
      const [low, high] = draggedValue;
      const x =
        handle === 'min'
          ? clamp(fingerX, TRACK_INSET, toX(high, sliderWidth, sliderBounds))
          : clamp(
              fingerX,
              toX(low, sliderWidth, sliderBounds),
              sliderWidth - TRACK_INSET,
            );
      const step = toValue(x, sliderWidth, sliderBounds);
      const next: Range = handle === 'min' ? [step, high] : [low, step];

      positions[handle].setValue(x);

      if (next[0] !== low || next[1] !== high) {
        draggedValue = next;
        latest.current.onChange(next);
      }
    };

    const settle = () => {
      const handle = draggedHandleRef.current;
      const { width: sliderWidth, bounds: sliderBounds } = latest.current;

      draggedHandleRef.current = null;
      isChoosingHandle = false;

      if (!handle) return;

      Animated.timing(positions[handle], {
        toValue: toX(
          draggedValue[handle === 'min' ? 0 : 1],
          sliderWidth,
          sliderBounds,
        ),
        duration: SETTLE_DURATION,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event: GestureResponderEvent) => {
        const { width: sliderWidth, bounds: sliderBounds } = latest.current;
        const [low, high] = latest.current.value;
        const lowX = toX(low, sliderWidth, sliderBounds);
        const highX = toX(high, sliderWidth, sliderBounds);

        startX = event.nativeEvent.locationX;
        draggedValue = latest.current.value;

        if (lowX === highX && Math.abs(startX - lowX) <= HANDLE_SIZE / 2) {
          isChoosingHandle = true;
          return;
        }

        draggedHandleRef.current =
          lowX === highX
            ? startX < lowX
              ? 'min'
              : 'max'
            : Math.abs(startX - lowX) <= Math.abs(startX - highX)
            ? 'min'
            : 'max';
        follow(startX);
      },
      onPanResponderMove: (
        _event: GestureResponderEvent,
        gesture: PanResponderGestureState,
      ) => {
        if (isChoosingHandle) {
          if (gesture.dx === 0) return;

          draggedHandleRef.current = gesture.dx < 0 ? 'min' : 'max';
          isChoosingHandle = false;
        }

        follow(startX + gesture.dx);
      },
      onPanResponderRelease: settle,
      onPanResponderTerminate: settle,
    });
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    const {
      bounds: sliderBounds,
      value: [low, high],
    } = latest.current;

    if (!draggedHandleRef.current) {
      positions.min.setValue(toX(low, nextWidth, sliderBounds));
      positions.max.setValue(toX(high, nextWidth, sliderBounds));
    }
    setWidth(nextWidth);
  };

  const steps = Array.from(
    { length: bounds[1] - bounds[0] + 1 },
    (_, index) => bounds[0] + index,
  );

  return (
    <View onLayout={handleLayout}>
      <View style={styles.slider}>
        <View style={styles.track} />
        {width > 0 ? (
          <>
            <Animated.View
              style={[styles.fill, { left: positions.min, width: fillWidth }]}
            />
            <Animated.View
              style={[
                styles.handle,
                { transform: [{ translateX: positions.min }] },
              ]}
            />
            <Animated.View
              style={[
                styles.handle,
                { transform: [{ translateX: positions.max }] },
              ]}
            />
          </>
        ) : null}
      </View>
      <View style={styles.steps}>
        {steps.map(step => (
          <Text
            key={step}
            style={[
              styles.step,
              step >= value[0] && step <= value[1] && styles.stepInRange,
            ]}
          >
            {step}
          </Text>
        ))}
      </View>
      <View style={styles.touchArea} {...panResponder.panHandlers} />
    </View>
  );
}

type Handle = 'min' | 'max';

const HANDLE_SIZE = 26;
const TRACK_HEIGHT = 6;
const TRACK_INSET = 9;
const STEP_LABEL_WIDTH = 18;
const SETTLE_DURATION = 140;

function toX(value: number, width: number, [min, max]: Range): number {
  const trackWidth = Math.max(width - TRACK_INSET * 2, 0);
  return TRACK_INSET + ((value - min) / (max - min)) * trackWidth;
}

function toValue(x: number, width: number, [min, max]: Range): number {
  const trackWidth = width - TRACK_INSET * 2;

  if (trackWidth <= 0) {
    return min;
  }

  const raw = min + ((x - TRACK_INSET) / trackWidth) * (max - min);
  return Math.min(max, Math.max(min, Math.round(raw)));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createStyles(colors: ThemeColors) {
  const trackTop = (HANDLE_SIZE - TRACK_HEIGHT) / 2;

  const styles = StyleSheet.create({
    slider: {
      height: HANDLE_SIZE,
    },
    track: {
      position: 'absolute',
      top: trackTop,
      left: TRACK_INSET,
      right: TRACK_INSET,
      height: TRACK_HEIGHT,
      borderRadius: TRACK_HEIGHT / 2,
      backgroundColor: colors.track,
    },
    fill: {
      position: 'absolute',
      top: trackTop,
      height: TRACK_HEIGHT,
      borderRadius: TRACK_HEIGHT / 2,
      backgroundColor: colors.accentLine,
    },
    handle: {
      position: 'absolute',
      top: 0,
      left: -HANDLE_SIZE / 2,
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
      borderRadius: HANDLE_SIZE / 2,
      borderWidth: 2,
      borderColor: colors.accentLine,
      backgroundColor: colors.handleBg,
      boxShadow: `0 2px 6px ${colors.handleShadow}`,
    },
    steps: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: TRACK_INSET - STEP_LABEL_WIDTH / 2,
    },
    step: {
      ...monoText(10.5),
      width: STEP_LABEL_WIDTH,
      textAlign: 'center',
      color: colors.label,
    },
    stepInRange: {
      color: colors.accentLine,
    },
    touchArea: {
      ...StyleSheet.absoluteFillObject,
    },
  });

  return styles;
}
