import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import axios from 'axios';

const defaultLatitude = 13.079353; // Replace with your default latitude
const defaultLongitude = 80.2535194; // Replace with your default longitude
const maxDistance = 40; // Maximum allowed distance in meters

const LocationComponent = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [checkStatus, setCheckStatus] = useState(''); // Check-In or Check-Out status
  const [emailSent, setEmailSent] = useState(false); // Track if the email has been sent
  const [username, setUsername] = useState(''); // User's name
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  useEffect(() => {
    // Function to update the user's location
    const updateLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let deviceLocation = await Location.getCurrentPositionAsync({});
      setLocation(deviceLocation);
    };

    // Initial update when the component mounts
    updateLocation();

    // Set up interval to update location every 5 seconds
    const intervalId = setInterval(updateLocation, 5000);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Function to check if the user is within the specified radius
  useEffect(() => {
    if (location && registrationCompleted && !emailSent) {
      const timestamp = new Date().toLocaleString(); // Convert timestamp to a readable format

      if (
        calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          defaultLatitude,
          defaultLongitude
        ) <= maxDistance
      ) {
        setCheckStatus('Check-In');
        sendEmail(Constants.installationId, timestamp, 'Check-In', username);
        setEmailSent(true);
      } else {
        setCheckStatus('Check-Out');
        sendEmail(Constants.installationId, timestamp, 'Check-Out', username);
        setEmailSent(true);
      }
    }
  }, [location, registrationCompleted, emailSent]);

  const sendEmail = async (deviceId, timestamp, checkStatus, username) => {
    try {
      const apiKey = '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';
      const apiUrl = 'https://api.sendgrid.com/v3/mail/send';

      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };

      const data = {
        personalizations: [
          {
            to: [
              {
                email: 'deepika@kappsoft.com', // Replace with the recipient's email address
              },
            ],
            subject: 'KAPPSOFT ATTENDANCE',
          },
        ],
        from: {
          email: 'madhana@kappsoft.com', // Replace with the sender's email address
        },
        content: [
          {
            type: 'text/plain',
            value: `Username: ${username}\nDevice ID: ${deviceId}\nTimestamp: ${timestamp}\nCheck Status: ${checkStatus}`,
          },
        ],
      };

      await axios.post(apiUrl, data, { headers });
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error.message);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  const handleRegister = () => {
    // Assuming you have some logic to validate the input
    if (username) {
      setRegistrationCompleted(true);
      setEmailSent(false); // Reset emailSent state for the next check
    } else {
      Alert.alert('Error', 'Please enter your username.');
    }
  };

  return (
    <View style={styles.container}>
      {!registrationCompleted && (
        <>
          <Text style={styles.title}>Registration</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </>
      )}
      {registrationCompleted && (
        <>
          <Text style={styles.title}>{checkStatus}</Text>
          <Text>Device ID: {Constants.installationId}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '100%',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
  },
});

export default LocationComponent;