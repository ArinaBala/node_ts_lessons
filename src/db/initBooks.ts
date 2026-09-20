import { pool } from "./database.js";

const sql = `
  CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image TEXT,
    author_ids INTEGER[] NOT NULL DEFAULT '{}'
  );

  INSERT INTO books (id, title, price, is_active, image, author_ids)
  VALUES
    (1, 'Кобзар', 250, TRUE, '1.jpg', ARRAY[1]),
    (2, 'Тигролови', 320, TRUE, '2.jpg', ARRAY[2]),
    (3, '1984', 400, TRUE, '3.jpg', ARRAY[3]),
    (4, 'Гаррі Поттер і філософський камінь', 450, FALSE, NULL, ARRAY[4]),
    (5, 'Маленький принц', 280, TRUE, NULL, ARRAY[5]),
    (6, 'pug test', 500, TRUE, NULL, ARRAY[1])
  ON CONFLICT (id) DO NOTHING;

  SELECT setval(
    pg_get_serial_sequence('books', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM books), 1)
  );
`;

try {
  await pool.query(sql);
  console.log("Books table initialized");
} finally {
  await pool.end();
}
