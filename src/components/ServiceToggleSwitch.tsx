import React from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {colors} from '../theme/colors';
import type {WeatherService} from '../services/types';

export interface ServiceToggleProps {
  options: ReadonlyArray<WeatherService>;
  selected: WeatherService;
  onSelect: (name: WeatherService) => void;
}

const ServiceToggle: React.FC<ServiceToggleProps> = ({
  options,
  selected,
  onSelect,
}) => {
  const isRight = selected === options[1];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, !isRight && styles.labelActive]}>
        {options[0]}
      </Text>
      <Switch
        value={isRight}
        onValueChange={val => onSelect(val ? options[1] : options[0])}
        trackColor={{false: colors.accent, true: colors.accent}}
        thumbColor="#FFFFFF"
      />
      <Text style={[styles.label, isRight && styles.labelActive]}>
        {options[1]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: colors.sectionBackground ?? '#eeeeee',
  },
  label: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.45,
  },
  labelActive: {
    opacity: 1,
    fontWeight: '600',
  },
});

export default ServiceToggle;
