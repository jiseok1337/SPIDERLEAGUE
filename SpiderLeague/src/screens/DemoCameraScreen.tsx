import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { demoApiService } from '../services/demo-api';
import { Spider } from '../types';

interface DemoCameraScreenProps {
  onCapture: (spider: Spider) => void;
  onBack: () => void;
}

export default function DemoCameraScreen({ onCapture, onBack }: DemoCameraScreenProps) {
  const [capturing, setCapturing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const takePicture = async () => {
    setCapturing(true);
    
    // Simulate taking a photo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAnalyzing(true);
    
    try {
      // Simulate spider analysis
      const response = await demoApiService.captureSpider('demo-image-uri');

      Alert.alert(
        'Spider Captured! 🕷️',
        `You found a ${response.spider.commonName}!\nPower Level: ${response.spider.powerLevel}\nRarity: ${response.spider.rarity}`,
        [
          {
            text: 'View Spider',
            onPress: () => onCapture(response.spider),
          }
        ]
      );

    } catch (error: any) {
      Alert.alert(
        'Capture Failed',
        'Could not identify spider. Try getting a clearer photo.',
        [{ text: 'Try Again' }]
      );
    } finally {
      setCapturing(false);
      setAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Demo camera view */}
      <View style={styles.cameraDemo}>
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>📱 Demo Camera</Text>
          </View>

          {/* Demo spider in viewfinder */}
          <View style={styles.viewfinder}>
            <View style={styles.crosshair}>
              <View style={styles.crosshairInner}>
                <Text style={styles.spiderEmoji}>🕷️</Text>
                <Text style={styles.spiderText}>Desert Spider Spotted!</Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              {analyzing ? 'AI is analyzing spider...' : 'Demo: Tap capture to simulate spider identification'}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {analyzing ? (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="large" color="#ff6b35" />
                <Text style={styles.analyzingText}>
                  Analyzing species, size, and rarity...
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.captureButton, capturing && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={capturing}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            )}
          </View>

          {/* Demo info */}
          <View style={styles.demoInfo}>
            <Text style={styles.demoText}>
              🎭 Demo Mode: Simulating camera capture and AI analysis
            </Text>
            <Text style={styles.demoSubtext}>
              In production: Real camera + Google Vision API
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  cameraDemo: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    position: 'relative',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#ff6b35',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewfinder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshair: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: '#ff6b35',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spiderEmoji: {
    fontSize: 50,
    marginBottom: 8,
  },
  spiderText: {
    color: '#ff6b35',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructions: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    textAlign: 'center',
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
  analyzingContainer: {
    alignItems: 'center',
  },
  analyzingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    textAlign: 'center',
  },
  demoInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  demoText: {
    color: '#ff6b35',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  demoSubtext: {
    color: '#cccccc',
    fontSize: 12,
    textAlign: 'center',
  },
});