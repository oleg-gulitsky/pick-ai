import { ReactNode } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/colors';

interface ContainerProps {
  children: ReactNode;
  isPending?: boolean;
}

export function Container({ children, isPending = false }: ContainerProps) {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.LICORICE} />
      {isPending ? (
        <ActivityIndicator
          style={styles.activityIndicator}
          size="large"
          color={COLORS.DUTCH_WHITE}
        />
      ) : (
        children
      )}
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
  activityIndicator: {
    marginTop: '70%',
  },
});
