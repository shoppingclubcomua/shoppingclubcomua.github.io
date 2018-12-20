importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

firebase.initializeApp({
   'messagingSenderId': '209475115553'
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  var notificationTitle = 'Background Message Title';
  var notificationOptions = {
    body: 'Background Message body.',
    icon: '/img/ShoppingClub.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});

// https://github.com/firebase/quickstart-js/blob/master/messaging/index.html
