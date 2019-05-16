import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
var cors = require('cors');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const app = express();
const main = express();

main.use(cors());
main.use('/api/v1', app);
main.use(bodyParser.json());

export const webApi = functions.https.onRequest(main);

app.get('/helloworld', (req, res) => {
    res.send('Hello World');
});

app.post('/players', async (request, response) => {
  try {
    const { username, password, balance } = request.body;
    const data = {
      username,
      password,
      balance
    } 
    const playerRef = await db.collection('players').add(data);
    const player = await playerRef.get();

    response.json({
      id: playerRef.id,
      data: player.data()
    });
  } catch(error){
    response.status(500).send(error);
  }
});

app.get('/players/:id', async (request, response) => {
  try {
    const playerId = request.params.id;

    if (!playerId) throw new Error('Player ID is required');

    const player = await db.collection('players').doc(playerId).get();

    if (!player.exists){
        throw new Error('Player doesnt exist.')
    }

    response.json({
      id: player.id,
      data: player.data()
    });

  } catch(error){
    response.status(500).send(error);
  }
});

app.get('/players', async (request, response) => {
  try {

    const playerQuerySnapshot = await db.collection('players').get();
    const players: Array<Object> = [];
    playerQuerySnapshot.forEach(
        (doc) => {
            players.push({
                id: doc.id,
                data: doc.data()
            });
        }
    );

    response.json(players);
  } catch(error){

    response.status(500).send(error);

  }
});

app.put('/players/:id', async (request, response) => {
  try {

    const playerId = request.params.id;
    const password = request.body.password;

    if (!playerId) throw new Error('id is blank');

    if (!password) throw new Error('Username is required');

    const data = { 
        password
    };
    await db.collection('players')
        .doc(playerId)
        .set(data, { merge: true });

    response.json({
        id: playerId,
        data
    })


  } catch(error){

    response.status(500).send(error);

  }
});

app.delete('/players/:id', async (request, response) => {
  try {

    const playerId = request.params.id;

    if (!playerId) throw new Error('id is blank');

    await db.collection('players')
        .doc(playerId)
        .delete();

    response.json({
        id: playerId,
    })


  } catch(error){

    response.status(500).send(error);

  }
});
