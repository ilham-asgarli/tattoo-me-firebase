const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();

exports.sendDesignFinishedNotification = functions.firestore
  .document('design-responses/{documentId}')
  .onCreate(async (snap, context) => {
    const requestDocumentSnapshot = await firestore.collection("design-requests").doc(snap.get("requestId")).get();
    const userDocumentSnapshot = await firestore.collection("users").doc(requestDocumentSnapshot.get("userId")).get();

    const deviceToken = userDocumentSnapshot.get("deviceToken");

    if(deviceToken) {
      const message = {
        token: deviceToken,
        data: {
          type: "design_finished",
          designResponseId: snap.id,
        },
        android: {
          priority: "high",
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
            },
          },
          headers: {
            "apns-push-type": "background",
            "apns-priority": "5", // Must be `5` when `contentAvailable` is set to true.
            "apns-topic": "io.flutter.plugins.firebase.messaging", // bundle identifier
          },
        },
      };
  
      return admin.messaging().send(message);
    }
  });