'use strict';


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
var messaging = firebase.messaging();
var tokens = database.ref('tokens/');
var emails = database.ref('emails/');


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


messaging.onMessage(function(payload) {
  console.log('Message received. ', payload);
  Push.create(payload.notification.body);
});


async function FCMnotificationPermission() {
    try {
        await messaging.requestPermission();
        const token = await messaging.getToken();
        console.log('token do:', token);

        var device = new ClientJS();
        var now = Date.now();
        var date = Date(now);
        var fingerprint = device.getFingerprint();
        var br = JSON.stringify(device.getBrowserData());
        var us = device.getUserAgent();
        var mob = device.isMobile();
        var and = device.isMobileAndroid();
        var ios = device.isMobileIOS();

        tokens.push().set({
            token: token,
            created_at: now,
            created_at_string: date.toString(),
            fingerprint: fingerprint,
            browser_data: br,
            user_agent: us,
            is_mobile: mob,
            is_mobile_android: and,
            is_mobile_ios: ios,
        });
        return token;
      } catch (error) {
        console.error(error);
      }
  };


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
setTimeout(FCMnotificationPermission, 3000);  // 3 sec
setTimeout(getLocation, 5000);                // 5 sec
