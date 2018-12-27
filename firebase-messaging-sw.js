importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

firebase.initializeApp({
   'messagingSenderId': '209475115553'
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  var notificationOptions = {
    body: payload.notification.body,
    icon: 'img/favicon.ico'
  };

  return self.registration.showNotification(
    payload.notification.title,
    notificationOptions
  );
});
