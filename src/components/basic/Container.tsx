import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemeColors } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { useThemedStyles } from '../../hooks/useAppTheme';

interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  const styles = useThemedStyles(createStyles);

  return <View style={styles.container}>{children}</View>;
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: LAYOUT.SCREEN_TOP,
      backgroundColor: colors.bg,
    },
  });

  return styles;
}
