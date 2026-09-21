import { Router, Request, Response } from "express";
import { BookType } from "../types/BookType.js";
import { BookResponceType } from "../types/BookResponceType.js";
import { pool } from "../db/database.js";
import path from "node:path"
import multer from "multer"

declare global {
  namespace Express {
    interface Request {
      image?: string;
    }
  }
}

type BookCreateType = Omit<BookType, "id">;
 
const bookRouter = Router();

 const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,path.join("public","images"))
  },
  filename:(req,file,cb)=>{
    const uniqueFileName = Date.now()+'_'+file.originalname
    req.image = uniqueFileName
    cb(null,uniqueFileName)
  }
})
const upload = multer({storage})


bookRouter.get(
  "/add-book",
  (
    req: Request,
    res: Response
  ) =>{
    res.render("pages/bookForm", {title: "Add Book"})
  },
);

bookRouter.post(
  "/add-book",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { title, price, year } = req.body;
      
      // Проверка на пустой title, чтобы не падало с ошибкой
      if (!title || title.trim() === "") {
        return res.status(400).send("Title cannot be empty");
      }

      const is_active = req.body.is_active ? true : false;
      const imageName = req.file ? req.file.filename : 'default.jpg';
      const publicationYear = year ? Number(year) : null;
      const parsedPrice = price ? Number(price) : 0;

      // Записываем книгу в облачную базу данных PostgreSQL
      const query = `
        INSERT INTO books (title, price, is_active, image, publication_year) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *;
      `;
      const values = [title, parsedPrice, is_active, imageName, publicationYear];
      
      await pool.query(query, values);

      // После успешного добавления перенаправляем пользователя на каталог книг
      return res.redirect("/books");

    } catch (error) {
      console.error("Помилка при додаванні книги:", error);
      return res.status(500).send("Internal server error");
    }
  }
);

// 1. Получение всех книг (каталог) с поддержкой поиска по названию
bookRouter.get(
  "/",
  async (
    req: Request<{}, any, null, { title?: string }>,
    res: Response,
  ) => {
    try {
      const { title } = req.query;
      let result;

     if (title !== undefined && title !== "undefined" && title.trim() !== "") {
        result = await pool.query(
          "SELECT * FROM books WHERE title ILIKE $1",
          [`%${title}%`]
        );
      } else {
        // Убираем фильтр по is_active, чтобы гарантированно забрать все 10 книг
        result = await pool.query("SELECT * FROM books ORDER BY id ASC");
      }

      

      const books = result.rows;
      
console.log("Кількість книг з бази:", books.length); // Что выведет в консоль терминала?
console.log("Список:", books);
      
      // Рендерим страницу каталога books.ejs
      res.render("pages2/books", { books, title: "Books" });

    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },
);


// ВНИМАНИЕ: Роут `/:id` для HTML-страницы мы перенесли в `server.ts`, 
// чтобы он рендерил шаблон `book-detail.ejs`, а не отдавал JSON. 
// Поэтому здесь мы его удалили, чтобы он не перехватывал запросы!

// API: Добавление новой книги (оставляем для POST-запросов)
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
        INSERT INTO books (title, price, is_active, image) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *;
      `;
      const values = [body.title, body.price, body.is_active ?? true, body.image || 'default.jpg'];
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

// API: Удаление книги по ID
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

// API: Обновление книги по ID
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