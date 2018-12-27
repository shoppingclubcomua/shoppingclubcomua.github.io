'use strict';

var device = new ClientJS();


var config = {
  apiKey: "AIzaSyCXDaL_fBQ7uRPa_7zkME-miQm2Uo0HoB8",
  authDomain: "shoppingclubcomua-firebase.firebaseapp.com",
  databaseURL: "https://shoppingclubcomua-firebase.firebaseio.com",
  projectId: "shoppingclubcomua-firebase",
  storageBucket: "shoppingclubcomua-firebase.appspot.com",
  messagingSenderId: "209475115553"
};

firebase.initializeApp(config);


var database = firebase.database();
var tokens = database.ref('tokens/');
var emails = database.ref('emails/');
var messaging = firebase.messaging();


messaging.usePublicVapidKey(
  "BIWiiYlS46z93E4gm9p80G32i98EwezKb-xzQBv2WgK4C2uj_xgyPA23T-8pw_Ar4L42d-Swegkgwb5A89w9KYs"
);


Push.config({FCM: config});

Push.FCM().then(function(FCM) {
    FCM.getToken().then(function(token) {
        console.log("Initialized with token " + token);
    }).catch(function(tokenError) {
       throw tokenError; 
    });
}).catch(function(initError) {
   throw initError; 
});


// When Push notification come in
messaging.onMessage(function(payload) {
  console.log('Message received. ', payload);
  Push.create(payload.notification.body);
});


function makeDeviceInfo(token) {
  var now = Date.now();
  var date = Date(now);
  var fingerprint = device.getFingerprint();
  var br = JSON.stringify(device.getBrowserData());
  var us = device.getUserAgent();
  var mob = device.isMobile();
  var and = device.isMobileAndroid();
  var ios = device.isMobileIOS();
  return {
            token: token,
            created_at: now,
            created_at_string: date.toString(),
            fingerprint: fingerprint,
            browser_data: br,
            user_agent: us,
            is_mobile: mob,
            is_mobile_android: and,
            is_mobile_ios: ios,
        }
};


function setTokenSentToServer(isSent) {
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


// ===========================


function showPosition(position) {
    window.user_location = position;
};


function getLocation() {
    navigator.geolocation.getCurrentPosition(showPosition);
};


function sendEmail() {
    var new_email = document.getElementById("send-email").value;

    var now = Date.now();
    var date = Date(now);

    var device = new ClientJS();
    var fingerprint = device.getFingerprint();
    var br = JSON.stringify(device.getBrowserData());
    var us = device.getUserAgent();
    var mob = device.isMobile();
    var and = device.isMobileAndroid();
    var ios = device.isMobileIOS();

    emails.push().set({
        email: new_email,
        created_at: now,
        created_at_string: date.toString(),
        fingerprint: fingerprint,
        browser_data: br,
        user_agent: us,
        is_mobile: mob,
        is_mobile_android: and,
        is_mobile_ios: ios,
        
        user_location: {
            latitude:  ('user_location' in window) ? window.user_location.coords.latitude : '',
            longitude: ('user_location' in window) ? window.user_location.coords.longitude : ''
        }
    });
    alert(`Спасибо, ваш email ${new_email} добавлен в список рассылки, теперь вы подписаны на наши новости.`);
    return false;
}


// setup
// setTimeout(FCMnotificationPermission, 3000);  // 3 sec
setTimeout(getLocation, 5000);                // 5 sec
