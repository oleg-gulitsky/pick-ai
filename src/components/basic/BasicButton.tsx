import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../../constants/colors';

interface BasicButtonProps {
  disabled?: boolean;
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
}

export function BasicButton({
  disabled = false,
  onPress,
  title,
  style,
}: BasicButtonProps) {
  return (
    <Pressable
      style={[styles.button, style]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={styles.buttonTittle} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 60,
    backgroundColor: COLORS.DARK_LAVA,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  buttonTittle: {
    color: COLORS.DUTCH_WHITE,
    fontSize: 20,
    textAlign: 'center',
  },
});
