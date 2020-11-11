import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    console.log(original)
    // Push the new message into Cloud Firestore using the Firebase Admin SDK.
    const writeResult = await admin.firestore().collection('messages').add({ original: original });
    // Send back a message that we've succesfully written the message
    res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

exports.startGame = functions.https.onCall(async () => {
    await admin.firestore().collection('game').doc('state').set({ started: true });
    console.log('Started game successfully');
})

exports.endGame = functions.https.onCall(async () => {
    await admin.firestore().collection('game').doc('state').set({ started: false });
    await admin.firestore().collection('box').doc('position').set({ posX: 50, posY: 50 });
    console.log('Ended game successfully');
})

exports.updateBoxPosition = functions.https.onCall(async (data) => {
    // const screenHeight = data.screenHeight;
    // const screenWidth = data.screenWidth;
    const size = 10; //as percentage of height

    const posX = Math.random() * 100;
    const posY = Math.random() * 100;

    await admin.firestore().collection('box').doc('position').set({ posX: Math.floor(posX), posY: Math.floor(posY), size: size });
    console.log('Position updated successfully');
});

exports.getUser = functions.https.onRequest(async (req, res) => {
    admin.auth().getUser(req.query.uid as string).then((userRecord) => {
        res.json(userRecord);
    }).catch(() => console.log('Error'));
});

exports.onPlayerDelete = functions.firestore.document('sessions/{sessionId}/{players}/{playerId}').onDelete((snapshot, context) => {
    const playerId = context.params.playerId;
    const sessionId = context.params.sessionId;
    console.log(`Player ${playerId} left session ${sessionId}`);
    console.log(snapshot.data());
    const player = snapshot.ref;
    const players = player.parent;
    console.log('Checking session status...');
    return players.listDocuments().then((resolve) => {
        if (resolve.length == 0) {
            console.log('Session empty. Deleting...');
            players.parent?.delete().then(() => console.log('Session deleted')); // delete empty session
        }
        else { console.log('Session not empty'); console.log(resolve); }
        return resolve;
    }).catch((reject) => reject);
});

export const testAddToEmptyDB = functions.https.onRequest(async (req, res) => {
    await admin.firestore().collection('sessions').doc().set({ a: Math.random() * 100, b: Math.random() * 100 });
    res.json('done');
});