/**
 * Mobile Service
 * Handles native device features, PWA capabilities, and mobile-specific logic.
 */

// Vibration patterns
export const HAPTIC = {
  SUCCESS: [50],
  WARNING: [50, 50, 50],
  ERROR: [50, 100, 50, 100],
  LIGHT: [10],
  MEDIUM: [30],
  HEAVY: [60]
};

export const vibrate = (pattern: number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendLocalNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        icon: 'https://via.placeholder.com/192.png?text=Icon',
        vibrate: HAPTIC.SUCCESS,
        ...options
      } as any);
    });
  }
};

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || (window.innerWidth <= 768);
};

// Mock Biometric Auth
export const authenticateBiometric = async (): Promise<boolean> => {
  // In a real app, this would use the Web Authentication API
  return new Promise((resolve) => {
    // Simulate FaceID/TouchID prompt
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate mock
      if (success) vibrate(HAPTIC.SUCCESS);
      else vibrate(HAPTIC.ERROR);
      resolve(success);
    }, 1500);
  });
};

// Voice Command Simulation
export const startVoiceListening = (onResult: (text: string) => void) => {
  // Check for browser support
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn("Speech recognition not supported");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => vibrate(HAPTIC.LIGHT);
  
  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript;
    onResult(text);
    vibrate(HAPTIC.SUCCESS);
  };

  recognition.start();
  return recognition;
};