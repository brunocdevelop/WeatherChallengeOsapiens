import React, {useState, useEffect, useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import LocationInput from '../components/LocationInput';
import ServiceToggle from '../components/ServiceToggle';
import WeatherDisplay from '../components/WeatherDisplay';
import {colors} from '../theme/colors';
import {OpenWeatherMapService} from '../services/openWeatherMap/OpenWeatherMapService';
import {OpenMeteoService} from '../services/openMeteo/OpenMeteoService';
import {
  type WeatherData,
  type WeatherService,
  WeatherServiceError,
} from '../services/types';
import type {IWeatherService} from '../services/IWeatherService';
import {validateLocation} from '../validation/locationValidator';
import ServiceToggleSwitch from '../components/ServiceToggleSwitch';
import {useDebounce} from '../hooks/useDebounce'; // adjust path to match your project

const openMeteoService = new OpenMeteoService();
const openWeatherMapService = new OpenWeatherMapService();
const services: Record<string, IWeatherService> = {
  [openMeteoService.name]: openMeteoService,
  [openWeatherMapService.name]: openWeatherMapService,
};

const serviceOptions = Object.keys(services) as WeatherService[];

const WeatherScreen: React.FC = () => {
  const [locationText, setLocationText] = useState('');
  const [selectedService, setSelectedService] = useState<WeatherService>(
    openMeteoService.name,
  );

  const debouncedLocation = useDebounce(locationText, 500);

  // State variables to manage the API lifecycle
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Core fetch function wrapped in useCallback
  const handleFetchWeather = useCallback(async () => {
    const result = validateLocation(debouncedLocation);
    if (!result.valid) {
      setErrorMessage(result.reason);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const service = services[selectedService];

    try {
      const data = await service.fetchWeather({query: result.value});
      setWeatherData(data);
    } catch (error) {
      if (error instanceof WeatherServiceError) {
        console.log('Error fetching weather:', error);
        setErrorMessage(
          error.code === 'NOT_FOUND'
            ? 'Location not found.'
            : 'Service unavailable.',
        );
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedLocation, selectedService]);

  // Re-fetch when debounced location or selected service changes
  useEffect(() => {
    if (debouncedLocation.trim()) {
      handleFetchWeather();
    }
  }, [debouncedLocation, selectedService]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <LocationInput
          value={locationText}
          onChangeText={setLocationText}
          onSubmit={handleFetchWeather}
          errorText={errorMessage ?? undefined}
        />
      </View>

      {isLoading && (
        <View style={styles.centerSection}>
          <ActivityIndicator size="large" color={'#007AFF'} />
        </View>
      )}

      {errorMessage && !isLoading && (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {!isLoading && !errorMessage && (
        <View style={styles.section}>
          <WeatherDisplay weather={weatherData} />
        </View>
      )}
      <View style={styles.section}>
        {serviceOptions.length === 2 ? (
          <ServiceToggleSwitch
            options={serviceOptions}
            selected={selectedService}
            onSelect={setSelectedService}
          />
        ) : (
          <ServiceToggle
            options={serviceOptions}
            selected={selectedService}
            onSelect={setSelectedService}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingVertical: 24,
    height: '100%',
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: 16,
  },
  centerSection: {
    marginVertical: 20,
    alignItems: 'center',
  },
  errorSection: {
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: '#FFD2D2',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#D8000C',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default WeatherScreen;
