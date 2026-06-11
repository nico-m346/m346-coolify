const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get("/", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tipps (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        weltmeister TEXT NOT NULL,
        torschuetzenkoenig TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const result = await pool.query("SELECT * FROM tipps ORDER BY created_at DESC");

    const rows = result.rows.map(tipp => `
      <tr>
        <td>${tipp.name}</td>
        <td>${tipp.weltmeister}</td>
        <td>${tipp.torschuetzenkoenig}</td>
        <td>${new Date(tipp.created_at).toLocaleString("de-CH")}</td>
      </tr>
    `).join("");

    res.send(`
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <title>WM Tippspiel</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f6f8;
            padding: 40px;
          }
          .container {
            max-width: 900px;
            margin: auto;
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          h1 { color: #1d3557; }
          input, button {
            padding: 10px;
            margin: 6px 0;
            width: 100%;
            box-sizing: border-box;
          }
          button {
            background: #1d3557;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 6px;
          }
          button:hover { background: #457b9d; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          th {
            background: #1d3557;
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚽ WM Tippspiel</h1>
          <p>Tippe, wer Weltmeister wird und wer Torschützenkönig wird.</p>

          <form method="POST" action="/tipp">
            <input name="name" placeholder="Dein Name" required>
            <input name="weltmeister" placeholder="Wer gewinnt die WM?" required>
            <input name="torschuetzenkoenig" placeholder="Wer wird Torschützenkönig?" required>
            <button type="submit">Tipp speichern</button>
          </form>

          <h2>Abgegebene Tipps</h2>
          <table>
            <tr>
              <th>Name</th>
              <th>Weltmeister</th>
              <th>Torschützenkönig</th>
              <th>Zeit</th>
            </tr>
            ${rows}
          </table>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.send(`<h1>Fehler</h1><pre>${error.message}</pre>`);
  }
});

app.post("/tipp", async (req, res) => {
  const { name, weltmeister, torschuetzenkoenig } = req.body;

  await pool.query(
    "INSERT INTO tipps (name, weltmeister, torschuetzenkoenig) VALUES ($1, $2, $3)",
    [name, weltmeister, torschuetzenkoenig]
  );

  res.redirect("/");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(port, () => {
  console.log(`App läuft auf Port ${port}`);
});
