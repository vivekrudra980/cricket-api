const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//get api
const converter = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`;
  const getPlayersResponse = await db.all(getPlayersQuery);
  response.send(getPlayersResponse.map((eachPlayer) => converter(eachPlayer)));
});

//add a player api
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role) VALUES ('${playerName}',${jerseyNumber},'${role}')`;
  const addPlayerResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//get a player api
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const getPlayerResponse = await db.get(getPlayerQuery);
  response.send(converter(getPlayerResponse));
});

//update a player API
app.put("/players/:playerId", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `UPDATE cricket_team SET player_name='${playerName}',jersey_number=${jerseyNumber},role='${role}';`;
  const updatePlayerResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//delete a player api
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
