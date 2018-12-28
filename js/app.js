'use strict';


var config = {
  apiKey: "AIzaSyCXDaL_fBQ7uRPa_7zkME-miQm2Uo0HoB8",
  authDomain: "shoppingclubcomua-firebase.firebaseapp.com",
  databaseURL: "https://shoppingclubcomua-firebase.firebaseio.com",
  projectId: "shoppingclubcomua-firebase",
  storageBucket: "shoppingclubcomua-firebase.appspot.com",
  messagingSenderId: "209475115553",
  serviceWorkerLocation: "./firebase-messaging-sw.js",
  fallback: function(payload) {
        // Code that executes on browsers with no notification support
        // "payload" is an object containing the 
        // title, body, tag, and icon of the notification 
        alert(payload);
    }
};

firebase.initializeApp(config);
Push.config({FCM: config});


var database = firebase.database();
var tokens = database.ref('tokens/');
var emails = database.ref('emails/');
var messaging = firebase.messaging();


messaging.usePublicVapidKey(
  "BIWiiYlS46z93E4gm9p80G32i98EwezKb-xzQBv2WgK4C2uj_xgyPA23T-8pw_Ar4L42d-Swegkgwb5A89w9KYs"
);


function makeDeviceInfo(token) {
  var device = new ClientJS();
  var now = Date.now();
  var date = Date(now);
  return {
            token: token,
            created_at: now,
            created_at_string: date.toString(),
            fingerprint: device.getFingerprint(),
            browser_data: JSON.stringify(device.getBrowserData()),
            user_agent: device.getUserAgent(),
            is_mobile: device.isMobile(),
            is_mobile_android: device.isMobileAndroid(),
            is_mobile_ios: device.isMobileIOS(),
        }
};


function setTokenSentToServer(sent) {
  window.localStorage.setItem('sentToServer', sent ? '1' : '0');
};


function isTokenSentToServer() {
  return window.localStorage.getItem('sentToServer') === '1';
};


function sendTokenToServer(currentToken) {
  if (!isTokenSentToServer()) {
    console.log('Sending token to server...', currentToken);

    var deviceInfo = makeDeviceInfo(currentToken);
    tokens.push().set(deviceInfo);

    setTokenSentToServer(true);
  } else {
    console.log('Token already sent to server so won\'t send it again ' +
        'unless it changes');
  }
};


function updateUIForPushPermissionRequired() {
  messaging.requestPermission().then(function() {
    console.log('Notification permission granted.');
  }).catch(function(err) {
    console.log('Unable to get permission to notify.', err);
  });
};


// Get Instance ID token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
messaging.getToken().then(function(currentToken) {
  if (currentToken) {
    sendTokenToServer(currentToken);
  } else {
    // Show permission request.
    console.log('No Instance ID token available. Request permission to generate one.');
    // Show permission UI.
    updateUIForPushPermissionRequired();
    setTokenSentToServer(false);
  }
}).catch(function(err) {
  console.log('An error occurred while retrieving token. ', err);
  setTokenSentToServer(false);
});


// Callback fired if Instance ID token is updated.
messaging.onTokenRefresh(function() {
  messaging.getToken().then(function(refreshedToken) {
    console.log('Token refreshed.');
    // Indicate that the new Instance ID token has not yet been sent to the
    // app server.
    setTokenSentToServer(false);
    // Send Instance ID token to app server.
    sendTokenToServer(refreshedToken);
    // ...
  }).catch(function(err) {
    console.log('Unable to retrieve refreshed token ', err);
  });
});


// plugin
Push.FCM().then(function(FCM) {
    FCM.getToken().then(function(currentToken) {
      if (currentToken) {
        sendTokenToServer(currentToken);
      } else {
        // Show permission request.
        console.log('No Instance ID token available. Request permission to generate one.');
        // Show permission UI.
        updateUIForPushPermissionRequired();
        setTokenSentToServer(false);
      }
    }).catch(function(err) {
      console.log('An error occurred while retrieving token. ', err);
      setTokenSentToServer(false);
    });
}).catch(function(initError) {
   throw initError; 
});


// When Push notification come in
// Push.FCM().then(function(FCM) {
//   FCM.onMessage(function(payload) {
//     console.log('Message received. ', payload);
//     Push.create(payload.notification.title, {
//         body: payload.notification.body,
//         icon: payload.notification.body,
//         timeout: 4000,
//         onClick: function () {
//             window.focus();
//             this.close();
//         }
//     });
//   })
// });


// When Push notification come in
messaging.onMessage(function(payload) {
  console.log('Message received. ', payload);
  Push.create(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon,
        timeout: 240000,
        requireInteraction: true,
        vibrate: true,
        onClick: function () {
            window.focus();
            this.close();
        }
    });
});


// ===========================

function setUserLocation(sent) {
  window.localStorage.setItem('setUserLocation', sent ? '1' : '0');
};


function isUserLocationSentToServer() {
  return window.localStorage.getItem('setUserLocation') === '1';
};


function showPosition(position) {
    window.localStorage.setItem(
      'userLocation', 
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
    );
    setUserLocation(true);
};


function getLocation() {
  if (!isUserLocationSentToServer()) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log(
      'User location', 
      window.localStorage.getItem('userLocation'));
  }
};


function sendEmail() {
    var new_email = document.getElementById("send-email").value;
    var userLocation = window.localStorage.getItem('userLocation');
    var deviceInfo = makeDeviceInfo(null);
    deviceInfo['email'] = new_email;
    deviceInfo['user_location'] = {
            latitude:  ('latitude' in userLocation) ? userLocation.latitude : '',
            longitude: ('longitude' in userLocation) ? userLocation.longitude : ''
    };

    emails.push().set(deviceInfo);
    alert(`Спасибо, ваш email ${new_email} добавлен в список рассылки, теперь вы подписаны на наши новости.`);
    return false;
}


setTimeout(getLocation, 10000);  // 10 sec
