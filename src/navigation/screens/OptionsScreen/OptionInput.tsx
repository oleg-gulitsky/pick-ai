import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { COLORS } from '../../../constants/colors';

interface OptionInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function OptionInput({
  value,
  onChangeText,
  ...props
}: OptionInputProps) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      placeholderTextColor={COLORS.DUTCH_WHITE}
      cursorColor={COLORS.DUTCH_WHITE}
      onChangeText={onChangeText}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.WHITE_COFFEE,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: COLORS.DUTCH_WHITE,
    fontSize: 18,
  },
});
