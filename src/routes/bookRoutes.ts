import { Router, Request, Response } from "express";
import { BookType } from "../types/BookType.js";
import { BookResponceType } from "../types/BookResponceType.js";
import { pool } from "../db/database.js";

type BookCreateType = Omit<BookType, "id">;
 
const bookRouter = Router();

// 2) 
bookRouter.get(
  "/",
  async (
    req: Request<{}, BookResponceType, null, { title?: string }>,
    res: Response,
  ) => {
    const response: BookResponceType = {
      data: null,
      error: null,
      status: 200,
    };

    try {
      const { title } = req.query;
      let result;

      if (title !== undefined && title !== "undefined" && title.trim() !== "") {
       
        result = await pool.query(
          "SELECT * FROM books WHERE title ILIKE $1",
          [`%${title}%`]
        );
      } else {
        
        result = await pool.query("SELECT * FROM books");
      }

      response.data = result.rows;
      response.status = 200;
    } catch (error) {
      console.error(error);
      response.error = "Internal server error";
      response.status = 500;
    }

    res.status(response.status).json(response);
  },
);

// 3) 
bookRouter.get("/:id", async (req: Request<{ id: string }, BookResponceType>, res: Response) => {
  const id = +req.params.id;
  const response: BookResponceType = {
    data: null,
    error: null,
    status: 200,
  };

  try {
    const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      response.status = 404;
      response.error = "The book not found";
    } else {
      response.data = result.rows[0];
      response.status = 200;
    }
  } catch (error) {
    console.error(error);
    response.status = 500;
    response.error = "Internal server error";
  }

  res.status(response.status).json(response);
});


bookRouter.post("/", async (req: Request<{}, BookResponceType, BookCreateType>, res: Response) => {
  const body = req.body;
  const response: BookResponceType = {
    data: null,
    error: null,
    status: 500,
  };

  if (body !== undefined && body.title && body.title.trim() !== "") {
    try {
      const query = `
        INSERT INTO books (title, price, is_active) 
        VALUES ($1, $2, $3) 
        RETURNING *;
      `;
      const values = [body.title, body.price, body.is_active ?? true];
      const result = await pool.query(query, values);

      response.data = result.rows[0];
      response.status = 201;
    } catch (error) {
      console.error(error);
      response.error = "Internal server error";
      response.status = 500;
    }
  } else {
    response.error = "Invalid request body or empty title";
    response.status = 400;
  }

  res.status(response.status).json(response);
});


bookRouter.delete("/:id", async (req: Request<{ id: string }, BookResponceType>, res: Response) => {
  const id = +req.params.id;
  const response: BookResponceType = {
    data: null,
    error: null,
    status: 200,
  };

  try {
    const result = await pool.query(
      "DELETE FROM books WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      response.status = 404;
      response.error = "The book is not found or not deleted";
    } else {
      response.data = result.rows[0];
      response.status = 200;
    }
  } catch (error) {
    console.error(error);
    response.status = 500;
    response.error = "Internal server error";
  }

  res.status(response.status).json(response);
});


bookRouter.put("/:id", async (req: Request<{ id: string }, BookResponceType, BookCreateType>, res: Response) => {
  const id = +req.params.id;
  const body = req.body;
  const response: BookResponceType = {
    data: null,
    error: null,
    status: 200,
  };

  if (!body || !body.title || body.title.trim() === "") {
    response.status = 400;
    response.error = "Invalid update data or empty title";
    return res.status(response.status).json(response);
  }

  try {
    const query = `
      UPDATE books 
      SET title = $1, price = $2, is_active = $3 
      WHERE id = $4 
      RETURNING *;
    `;
    const values = [body.title, body.price, body.is_active, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      response.status = 404;
      response.error = "The book is not found";
    } else {
      response.data = result.rows[0];
      response.status = 200;
    }
  } catch (error) {
    console.error(error);
    response.status = 500;
    response.error = "Internal server error";
  }

  res.status(response.status).json(response);
});
 
export default bookRouter;