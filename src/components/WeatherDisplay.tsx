import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import type {WeatherData} from '../services/types';
import {colors} from '../theme/colors';

export interface WeatherDisplayProps {
  weather: WeatherData | null;
  loading?: boolean;
  errorText?: string;
}

const conditionEmoji = (condition: string): string => {
  const c = condition.toLowerCase();
  if (c.includes('sun') || c.includes('clear')) return '☀️';
  if (c.includes('cloud')) return '☁️';
  if (c.includes('rain') || c.includes('drizzle')) return '🌧️';
  if (c.includes('storm') || c.includes('thunder')) return '⛈️';
  if (c.includes('snow')) return '❄️';
  if (c.includes('fog') || c.includes('mist')) return '🌫️';
  if (c.includes('wind')) return '💨';
  return '🌤️';
};

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  weather,
  loading,
  errorText,
}) => {
  if (loading) {
    return (
      <View style={[styles.card, styles.centeredCard]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.muted}>Fetching weather…</Text>
      </View>
    );
  }

  if (errorText) {
    return (
      <View style={[styles.card, styles.centeredCard]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.error}>{errorText}</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={[styles.card, styles.centeredCard]}>
        <Text style={styles.emptyIcon}>🌍</Text>
        <Text style={styles.muted}>Enter a location to see the weather.</Text>
      </View>
    );
  }

  const emoji = conditionEmoji(weather.condition);
  const tempRounded = Math.round(weather.temperature);
  const isHot = tempRounded >= 25;
  const isCold = tempRounded <= 5;
  const tempColor = isHot ? '#FF6B35' : isCold ? '#5B9BD5' : colors.text;

  return (
    <View style={styles.card}>
      {/* Top row: location + emoji */}
      <View style={styles.topRow}>
        <View style={styles.locationBlock}>
          <Text style={styles.locationLabel}>📍 LOCATION</Text>
          <Text style={styles.location} numberOfLines={1}>
            {weather.location}
          </Text>
        </View>
        <Text style={styles.conditionEmoji}>{emoji}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.tempRow}>
        <Text style={[styles.temperature, {color: tempColor}]}>
          {tempRounded}
        </Text>
        <View style={styles.tempMeta}>
          <Text style={[styles.tempUnit, {color: tempColor}]}>°C</Text>
          <Text style={styles.condition}>{weather.condition}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>via {weather.source}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: colors.sectionBackground ?? '#eeeeee',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  centeredCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationBlock: {
    flex: 1,
    marginRight: 12,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  location: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  conditionEmoji: {
    fontSize: 44,
    lineHeight: 52,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
    opacity: 0.5,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  temperature: {
    fontSize: 80,
    fontWeight: '200',
    lineHeight: 80,
    letterSpacing: -4,
  },
  tempMeta: {
    paddingBottom: 8,
    gap: 6,
  },
  tempUnit: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
  },
  condition: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
    maxWidth: 120,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
  },
  pill: {
    backgroundColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  emptyIcon: {
    fontSize: 40,
  },
  errorIcon: {
    fontSize: 36,
  },
  muted: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
});

export default WeatherDisplay;
