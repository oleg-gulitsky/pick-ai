import { ReactNode } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/colors';

interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.LICORICE} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: COLORS.LICORICE,
    alignItems: 'center',
  },
});
