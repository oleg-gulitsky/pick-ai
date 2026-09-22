import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../../../../constants/colors';
import { FONTS, monoText, uiText } from '../../../../constants/typography';
import { useThemedStyles } from '../../../../hooks/useAppTheme';
import { Range } from '../../../../store/useSettingsStore';
import { RangeSlider } from './RangeSlider';

interface RangeSettingProps {
  label: string;
  bounds: Range;
  value: Range;
  onChange: (value: Range) => void;
}

export const RangeSetting = memo(RangeSettingComponent);

function RangeSettingComponent({
  label,
  bounds,
  value,
  onChange,
}: RangeSettingProps) {
  const styles = useThemedStyles(createStyles);
  const [min, max] = value;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {min === max ? `${min}` : `${min}–${max}`}
        </Text>
      </View>
      <RangeSlider bounds={bounds} value={value} onChange={onChange} />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    card: {
      paddingTop: 16,
      paddingHorizontal: 18,
      paddingBottom: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    label: {
      ...uiText(FONTS.REGULAR, 15.5),
      color: colors.ink,
    },
    value: {
      ...monoText(19),
      fontFamily: FONTS.MONO_MEDIUM,
      color: colors.accentLine,
    },
  });

  return styles;
}
