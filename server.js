const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`
      <h1>M346 Coolify Demo</h1>
      <p>Deployment erfolgreich!</p>
      <p><b>Datenbank verbunden!</b></p>
      <p>Aktuelle Zeit aus PostgreSQL: ${result.rows[0].now}</p>
    `);
  } catch (error) {
    res.send(`
      <h1>M346 Coolify Demo</h1>
      <p>Deployment erfolgreich!</p>
      <p>Datenbank noch nicht verbunden.</p>
      <pre>${error.message}</pre>
    `);
  }
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(port, () => {
  console.log(`App läuft auf Port ${port}`);
});
