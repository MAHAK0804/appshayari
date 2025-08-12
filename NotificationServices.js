import notifee, { AndroidImportance } from '@notifee/react-native';

const shayaris = [
  'तेरे बिना अधूरी है ज़िन्दगी मेरी 😔',
  'मोहब्बत करने वालों का नसीब बुरा होता है 💔',
  'जिन्दगी एक किताब की तरह होती है, हर पन्ना कुछ न कुछ कहता है 📖',
  // Add more...
];

// Create notification channel (only once, ideally on app startup)
export async function setupNotificationChannel() {
  await notifee.createChannel({
    id: 'shayari',
    name: 'Shayari Notifications',
    importance: AndroidImportance.HIGH,
  });
}

// Send random shayari notification
export async function sendRandomNotification() {
  const random = Math.floor(Math.random() * shayaris.length);
  const message = shayaris[random];

  await notifee.displayNotification({
    title: 'Shayari Time!',
    body: message,
    android: {
      channelId: 'shayari',
      pressAction: {
        id: 'default',
      },
    },
  });
}
