import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';

export default function App() {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    Keyboard.dismiss();
    setLoading(true);
    setError('');
    setWeatherData(null);

    try {
      // Vercel routes `/api/weather` dynamically to our Python backend
      const backendUrl = `/api/weather?pincode=${pincode}`;
      
      const response = await fetch(backendUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError('Failed to fetch weather. Ensure the Python backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const isRainy = weatherData?.theme === 'rain';

  return (
    <View style={[styles.container, isRainy ? styles.rainyTheme : styles.sunnyTheme]}>
      <Text style={styles.header}>Weather Alert App ⛅</Text>
      
      <View style={styles.inputContainer}>
        <View style={styles.singleInputGroup}>
          <Text style={styles.label}>Pin Code / Zip Code</Text>
          <TextInput
            style={styles.input}
            value={pincode}
            onChangeText={setPincode}
            keyboardType="default"
            placeholder="e.g. 110001 or 90210"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={fetchWeather} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Checking...' : 'Check Weather'}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {weatherData && (
        <View style={styles.card}>
          <Text style={styles.alertText}>{weatherData.alert}</Text>
          {weatherData.location_name && (
            <Text style={styles.locationText}>{weatherData.location_name}</Text>
          )}
          <Text style={styles.subMessage}>{weatherData.sub_message}</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>Temp: {weatherData.current_temp}°C</Text>
            <Text style={styles.statText}>Rain Chance: {weatherData.rain_probability}%</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  rainyTheme: {
    backgroundColor: '#b0bec5',
  },
  sunnyTheme: {
    backgroundColor: '#fff9c4',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    maxWidth: 400,
  },
  singleInputGroup: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  card: {
    marginTop: 40,
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  alertText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  statText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  }
});
