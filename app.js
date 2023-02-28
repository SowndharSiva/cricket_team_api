const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
app.use(express.json());

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        app.listen(3003);
    } catch (e) {
        console.log(`db error:${e}`);
        process.exit(1);
    }
};
const convertDbObjectToResponseObject = (dbObject) => {
    return {
        playerId: dbObject.player_id,
        playerName: dbObject.player_name,
        jerseyNumber: dbObject.jersey_number,
        role: dbObject.role,
    };
};
app.get("/players/", async (request, response) => {
    const getPlayer = `SELECT *
    FROM cricket_team;`;
    const dbResponse = await db.all(getPlayer);
    response.send(
        dbResponse.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
    );
});
app.post("/players/", async (request, response) => {
    const playerDetails = request.body;
    const { playerName, jerseyNumber, role } = playerDetails;
    const postQuery = `INSERT INTO cricket_team
    (player_name,jersey_number,role)
    VALUES(
        `${ playerName }`,
        ${jerseyNumber},
        `${ role } `
    );`;
    await db.run(postQuery);
    response.send("Player Added to Team");
});
app.get("/players/:playerId/", async (request, response) => {
    const { playerId } = request.params;
    const getQuery = `SELECT *
    FROM cricket_team
    WHERE player_id=${playerId};`;
    const dbResponse = await db.get(getQuery);
    response.send(convertDbObjectToResponseObject(dbResponse));
});
app.put("/players/:playerId/", async (request, response) => {
    const { playerId } = request.params;
    const playerDetails = request.body;
    const { playerName, jerseyNumber, role } = playerDetails;
    const putQuery = `UPDATE  cricket_team
    SET player_name=`${ playerName }`.
    jersey_number=${jerseyNumber},
    role=`${ role } `
    WHERE player_id=${playerId};`;
    await db.run(putQuery);
    response.send("Player Details Updated");
});
app.delete("/players/:playerId/", async (request, response) => {
    const { playerId } = request.params;
    const deleteQuery = `DELETE FROM cricket_team
    WHERE player_id=${playerId};`;
    await db.run(deleteQuery);
    response.send("Player Removed");
})

initializeDBAndServer();
module.exports = app;
