import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;
const formspreeId = process.env.FORMSPREE_ID || "mlgagngr";

async function createClient() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }
  const client = new Client({ connectionString });
  await client.connect();
  return client;
}

async function sendFeedbackToFormspree(entry) {
  const formData = new FormData();
  formData.append("name", entry.name || "Anonymous");
  formData.append("school", entry.school || "—");
  formData.append("stars", entry.stars);
  formData.append("liked", entry.liked || "(none)");
  formData.append("improve", entry.improve || "(none)");
  formData.append("other", entry.other || "(none)");
  formData.append("submitted_at", entry.ts || new Date().toISOString());

  const resp = await fetch(`https://formspree.io/f/${formspreeId}`, {
    method: "POST",
    body: formData,
  });

  if (!resp.ok) {
    throw new Error(`Formspree error: ${resp.status}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, school, stars, liked, improve, other, ts } = req.body || {};
  if (!stars) {
    return res.status(400).json({ error: "Missing star rating." });
  }

  const entry = { name: name || "Anonymous", school: school || "—", stars: parseInt(stars, 10), liked: liked || "", improve: improve || "", other: other || "", ts: ts || new Date().toISOString() };

  let client;

  try {
    // Send to Formspree (non-fatal if it fails)
    try {
      await sendFeedbackToFormspree(entry);
    } catch (e) {
      console.warn("Formspree submission failed:", e.message);
    }

    // Optionally save to database if configured
    if (connectionString) {
      client = await createClient();
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
        [entry.name, entry.school, entry.stars, entry.liked, entry.improve, entry.other, entry.ts]
      );

      return res.status(201).json(result.rows[0]);
    }

    return res.status(201).json(entry);
  } catch (error) {
    console.error("Feedback save error:", error);
    return res.status(500).json({ error: "Unable to save feedback.", detail: error?.message || String(error) });
  } finally {
    if (client) {
      await client.end();
    }
  }
}
