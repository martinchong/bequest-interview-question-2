import express from "express";
import cors from "cors";
import crypto from 'crypto';

const PORT = 8080;
const app = express();
const database = { data: "Hello World", hash: "5496a4355c3f3658e6701293d343fc34406c89d692939b1410b57e1c5d155018" };

// The idea is to have extra backup database in case one failed, there is always a fallback.
const databaseBackup = { data: "Hello World", hash: "5496a4355c3f3658e6701293d343fc34406c89d692939b1410b57e1c5d155018" };

app.use(cors());
app.use(express.json());

// Routes

const hashWithKey = ( target: string, key: string ) => {
  return crypto.createHmac('sha256', key).update(target).digest('hex');
}

app.post("/check", (req, res) => {
  const { data, key } = req.body;
  const hash = hashWithKey(data, key);
  if (database.hash === hash) {
    // Data is good
    res.json(database.data);
  } else {
    // Revert back to backup
    database.data = databaseBackup.data;
    database.hash = databaseBackup.hash;
    res.json(databaseBackup.data);
  }
});

app.get("/", (req, res) => {
  res.json(database.data);
});

app.post("/", (req, res) => {
  const { data, key } = req.body;
  database.data = data;
  database.hash = hashWithKey(data, key);

  //UpdateBackup
  databaseBackup.data = data;
  databaseBackup.hash = hashWithKey(data, key);

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
