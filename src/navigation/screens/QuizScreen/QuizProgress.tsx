import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../../../constants/colors';
import { STRINGS } from '../../../constants/strings';
import { monoText } from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';

interface QuizProgressProps {
  index: number;
  count: number;
}

export const QuizProgress = memo(QuizProgressComponent);

function QuizProgressComponent({ index, count }: QuizProgressProps) {
  const styles = useThemedStyles(createStyles);
  const segmentWidth = getSegmentWidth(count);

  return (
    <View style={styles.header}>
      <Text style={styles.label}>
        {STRINGS.QUESTION_PROGRESS(index, count)}
      </Text>
      <View style={styles.segments}>
        {Array.from({ length: count }, (_, segmentIndex) => (
          <View
            key={segmentIndex}
            style={[
              styles.segment,
              { width: segmentWidth },
              segmentIndex <= index && styles.segmentFilled,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const SEGMENTS_MAX_WIDTH = 180;
const SEGMENT_GAP = 4;

function getSegmentWidth(count: number): number {
  const width = (SEGMENTS_MAX_WIDTH - SEGMENT_GAP * (count - 1)) / count;
  return Math.max(10, Math.min(20, Math.floor(width)));
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 22,
    },
    label: {
      ...monoText(12, 0.5),
      color: colors.label,
    },
    segments: {
      flexDirection: 'row',
      gap: SEGMENT_GAP,
    },
    segment: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.progressEmpty,
    },
    segmentFilled: {
      backgroundColor: colors.accentLine,
    },
  });

  return styles;
}
