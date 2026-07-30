import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
  // Une recherche filtrée = jusqu'à 7 requêtes ; sans ces bornes, un pool
  // saturé fait attendre les requêtes suivantes indéfiniment, sans erreur ni
  // log (connectionTimeoutMillis vaut 0 = infini par défaut).
  max: Number(process.env.DB_POOL_MAX) || 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  // Tué côté Postgres — couvre aussi les requêtes orphelines des navigations
  // abandonnées, que Next n'annule jamais. Pire recherche mesurée : ~8s.
  statement_timeout: 15000,
});

// Un client idle qui émet une erreur (coupure réseau OVH…) sans handler
// ferait crasher le process Node entier.
pool.on("error", (err) => {
  console.error("Idle PostgreSQL client error:", err.message);
});

pool.connect((err, client, release) => {
  if (err) {
    console.log("Error acquiring client from the database pool:", err);

  } else {
    release();
  }
});

export default pool;
