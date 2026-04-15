import { Client } from "pg";
import nodemailer from "nodemailer";

const connectionString = process.env.DATABASE_URL;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailTo = process.env.EMAIL_TO;

async function createClient() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }
  const client = new Client({ connectionString });
  await client.connect();
  return client;
}

async function sendFeedbackEmail(entry) {
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !emailTo) {
    throw new Error("SMTP configuration is not complete.");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: parseInt(smtpPort, 10) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const body = `New feedback submission:\n\n` +
    `Name: ${entry.name || "Anonymous"}\n` +
    `School/District: ${entry.school || "—"}\n` +
    `Rating: ${entry.stars}\n` +
    `Liked most: ${entry.liked || "(none)"}\n` +
    `Needs improvement: ${entry.improve || "(none)"}\n` +
    `Other comments: ${entry.other || "(none)"}\n` +
    `Submitted at: ${entry.ts || new Date().toISOString()}\n`;

  await transporter.sendMail({
    from: smtpUser,
    to: emailTo,
    subject: "EduReport GH feedback submission",
    text: body,
  });
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
    if (smtpHost && smtpPort && smtpUser && smtpPass && emailTo) {
      await sendFeedbackEmail(entry);
    }

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
    await client.query(`
    console.error("Feedback save error:", error);
    return res.status(500).json({ error: "Unable to save feedback." });
  } finally {
    await client.end();
    if (client) {
      await client.end();
    }
}
