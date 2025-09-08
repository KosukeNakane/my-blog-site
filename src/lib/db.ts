import mysql, { Pool } from "mysql2/promise";

// Next.js の開発HMRでプール多重生成を避ける
const globalForPool = global as unknown as { _mysqlPool?: Pool };

export function getPool(): Pool {
  if (!globalForPool._mysqlPool) {
    globalForPool._mysqlPool = mysql.createPool({
      host: process.env.DB_HOST ?? "127.0.0.1",
      port: Number(process.env.DB_PORT ?? 8889),
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "root",
      database: process.env.DB_NAME ?? "my-blog-site",
      waitForConnections: true,
      connectionLimit: 10,
      // お好みで: namedPlaceholders: true,
    });
  }
  return globalForPool._mysqlPool!;
}
