import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;

async function createClient() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }
  const client = new Client({ connectionString });
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!connectionString) {
    return res.status(500).json({ error: "Database URL is not configured." });
  }

  const { name, school, stars, liked, improve, other, ts } = req.body || {};
  if (!stars) {
    return res.status(400).json({ error: "Missing star rating." });
  }

  const client = await createClient();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        name TEXT,
        school TEXT,
        stars INTEGER NOT NULL,
        liked TEXT,
        improve TEXT,
        other TEXT,
        submitted_at TIMESTAMPTZ
      )
    `);

    const result = await client.query(
      `INSERT INTO feedback (name, school, stars, liked, improve, other, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, school, stars, liked, improve, other, submitted_at`,
      [name || "Anonymous", school || "—", parseInt(stars, 10), liked || "", improve || "", other || "", ts || new Date().toISOString()]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Feedback save error:", error);
    return res.status(500).json({ error: "Unable to save feedback." });
  } finally {
    await client.end();
  }
}
