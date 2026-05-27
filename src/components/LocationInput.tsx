import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {colors} from '../theme/colors';
export interface LocationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  errorText?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  errorText,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Enter a location"
        placeholderTextColor={colors.textSecondary}
        autoCorrect={false}
        autoCapitalize="words"
      />
      {errorText && <Text style={styles.errorText}>{errorText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.sectionBackground ?? '#F5F7FA',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
});

export default LocationInput;
