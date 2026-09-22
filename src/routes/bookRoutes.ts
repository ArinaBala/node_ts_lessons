import { Router, Request, Response } from "express";
import { BookType } from "../types/BookType.js";
import { BookResponceType } from "../types/BookResponceType.js";
import upload from "../middlewares/multer.js";
import path from "node:path";
import fs from "node:fs/promises";
import 'dotenv/config';

type BookCreateType = Omit<BookType, "id">;
 
const bookRouter = Router();

// Отображение формы добавления книги
bookRouter.get(
  "/add-book",
  (
    req: Request,
    res: Response
  ) => {
    res.render("pages2/bookForm", { title: "Add Book" });
  },
);

// POST: Добавление новой книги через json-server
bookRouter.post(
  "/add-book",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      console.log("[ADD BOOK] Отримано запит на додавання книги. Body:", req.body);
      console.log("[ADD BOOK] Файл зображення:", req.file);

      const { title, price, year } = req.body;
      
      if (!title || title.trim() === "") {
        console.log("[ADD BOOK] Помилка: Назва порожня");
        return res.status(400).send("Title cannot be empty");
      }

      const is_active = req.body.is_active ? true : false;
      const imageName = req.file ? req.file.filename : 'default.jpg';
      const publicationYear = year ? Number(year) : null;
      const parsedPrice = price ? Number(price) : 0;

      const newBook = {
        title,
        price: parsedPrice,
        is_active,
        image: imageName,
        publication_year: publicationYear
      };

      console.log("[ADD BOOK] Надсилаємо запит на json-server:", `${process.env.PATH_TO_JSON_SERVER}/books`);

      const response = await fetch(`${process.env.PATH_TO_JSON_SERVER}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBook)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[ADD BOOK] Помилка від json-server:", errorText);
        throw new Error("Не вдалося додати книгу до json-server");
      }

      const result = await response.json();
      console.log("[ADD BOOK] Книгу успішно додано:", result);

      return res.redirect("/books");

    } catch (error) {
      console.error("[ADD BOOK] Критична помилка:", error);
      return res.status(500).send("Internal server error");
    }
  }
);

// GET: Отримання всіх книжок через json-server
bookRouter.get(
  "/",
  async (
    req: Request<{}, BookResponceType, null, { title: string }>,
    res: Response,
  ) => {
    try {
      const data = await fetch(`${process.env.PATH_TO_JSON_SERVER}/books`);
      const json = await data.json();
      res.render("pages2/books", { books: json, title: "Books" });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },
);

// DELETE: Удаление книги по ID (с удалением файла картинки и записи из json-server)
bookRouter.delete("/:id", async (req: Request<{ id: string }, BookResponceType>, res: Response) => {
  const id = req.params.id;
  const response: BookResponceType = {
    data: null,
    error: null,
    status: 200,
  };

  console.log(`[DELETE] Отримано запит на видалення книги з ID: ${id}`);

  try {
    const getResponse = await fetch(`${process.env.PATH_TO_JSON_SERVER}/books/${id}`);
    
    if (!getResponse.ok) {
      response.status = 404;
      response.error = "The book is not found";
      return res.status(response.status).json(response);
    }

    const book = await getResponse.json() as BookType;

    if (book.image && book.image !== 'default.jpg') {
      const imagePath = path.join(process.cwd(), "public", "images", book.image);
      try {
        await fs.unlink(imagePath);
        console.log(`Файл картинки ${book.image} успішно видалено з сервера.`);
      } catch (fileError: any) {
        if (fileError.code === 'ENOENT') {
          console.log(`[DELETE] Файл картинки ${book.image} вже відсутній на диска.`);
        } else {
          console.log("Не вдалося видалити файл картинки:", fileError);
        }
      }
    }

    const deleteRes = await fetch(`${process.env.PATH_TO_JSON_SERVER}/books/${id}`, {
      method: 'DELETE',
    });

    if (!deleteRes.ok) {
      response.status = 500;
      response.error = "Failed to delete book from json-server";
      return res.status(response.status).json(response);
    }

    response.data = book as any;
    response.status = 200;

  } catch (error) {
    console.error(error);
    response.status = 500;
    response.error = "Internal server error";
  }

  res.status(response.status).json(response);
});

// PUT: Обновление книги по ID (с поддержкой загрузки нового изображения через multer)
bookRouter.put("/:id", upload.single("image"), async (req: Request<{ id: string }, BookResponceType>, res: Response) => {
  const id = req.params.id;
  const response: BookResponceType = {
    data: null,
    error: null,
    status: 200,
  };

  try {
    // 1. Получаем текущую книгу из json-server, чтобы узнать старое имя файла картинки
    const getRes = await fetch(`${process.env.PATH_TO_JSON_SERVER}/books/${id}`);
    if (!getRes.ok) {
      response.status = 404;
      response.error = "The book is not found";
      return res.status(response.status).json(response);
    }
    const oldBook = await getRes.json() as BookType;

    const { title, price, is_active } = req.body;

    if (!title || title.trim() === "") {
      response.status = 400;
      response.error = "Invalid update data or empty title";
      return res.status(response.status).json(response);
    }

    let imageName = oldBook.image; // По умолчанию оставляем старую картинку

    // 2. Если пользователь загрузил новый файл картинки
    if (req.file) {
      imageName = req.file.filename;

      // Удаляем старый файл с диска, если он существовал и не был дефолтным
      if (oldBook.image && oldBook.image !== 'default.jpg') {
        const oldImagePath = path.join(process.cwd(), "public", "images", oldBook.image);
        try {
          await fs.unlink(oldImagePath);
          console.log(`[PUT] Старий файл картинки ${oldBook.image} успішно видалено.`);
        } catch (fileError) {
          console.log("[PUT] Старий файл картинки на диску не знайдено або вже видалено.");
        }
      }
    }

    const updatedData = {
      title,
      price: Number(price),
      is_active: is_active === 'true' || is_active === true,
      image: imageName
    };

    // 3. Отправляем обновленные данные на json-server
    const updateRes = await fetch(`${process.env.PATH_TO_JSON_SERVER}/books/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });

    if (!updateRes.ok) {
      response.status = 500;
      response.error = "Failed to update book in json-server";
      return res.status(response.status).json(response);
    }

    const updatedBook = await updateRes.json();
    response.data = updatedBook;
    response.status = 200;

  } catch (error) {
    console.error("Помилка при оновленні:", error);
    response.status = 500;
    response.error = "Internal server error";
  }

  res.status(response.status).json(response);
});

export default bookRouter;