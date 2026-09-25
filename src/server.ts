import express, {Request, Response} from "express"
import "dotenv/config"
import { books } from "./data/books.js"
import { BookResponceType } from "./types/BookResponceType.js"
import { BookType } from "./types/BookType.js"
import { authors } from "./data/authors.js";
import router from "./routes/bookRoutes.js"
import path from "node:path"
import { fileURLToPath } from "node:url"
import expressEjsLayouts from "express-ejs-layouts"
import { pool } from "./db/database.js"
import { loggerMiddleware } from "./middlewares/logger_Middleware.js"
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middlewares/authMiddleware.js"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cl = console.log
const PORT = process.env.PORT || 3200
const HOST = process.env.HOST || "http://localhost"

const app = express()
app.use(cookieParser());

app.use(loggerMiddleware) 
app.use(authMiddleware)


app.use(express.urlencoded({extended:true}))

// Правильное подключение статической папки public (для картинок)
app.use(express.static(path.join(__dirname, '../public')));

app.set("views", path.join(__dirname, "..","views"));
app.set("view engine", "ejs")

app.use(expressEjsLayouts)
app.set("layout", path.join(__dirname, "..","views", "layouts", "main"))

app.use(express.json())



app.get("/cookie", (req: Request, res: Response) => {
  res.cookie("username", "aaaaa",{
    httpOnly: true,
    maxAge: 2 * 60 * 1000,
  });
  res.cookie("email", "bibibibi@gmai.com");
  res.send("Cookie created");
});

app.get("/cookie-read", (req: Request, res: Response) => {
  if (req.cookies && req.cookies.username) {
    res.send(`Welcome, ${req.cookies.username}`);
  } else {
    res.send(`Welcome, guest`);
  }
});
app.get("/cookie-remove", (req: Request, res: Response) => {
  if (req.cookies && req.cookies.username) {
    res.clearCookie("username");
    res.send(`Removed cookie`);
  } else {
    res.send(`Cookie not found`);
  }
});

// Главная страница
app.get('/', (req: Request<null, null, null, { title: string }>, res) => {
    res.render("pages2/home", {
        title: "Home page",
        name: req.query.title
    });
});

// 1. ВАЖНО: Специфичный роут для формы добавления ДОЛЖЕН БЫТЬ ВЫШЕ /books/:id
app.get("/books/add-book", (req: Request, res: Response) => {
   res.render("pages2/bookForm", { title: "Add Book" });
});

// 2. Детальная страница книги по ID
app.get("/books/:id", async (req: Request, res: Response) => {
    try {
        const bookId = req.params.id;
        const result = await pool.query("SELECT * FROM books WHERE id = $1", [bookId]);
        
        if (result.rows.length === 0) {
            return res.status(404).send("Книгу не знайдено");
        }
        
        res.render("pages2/book-detail", { 
            title: result.rows[0].title, 
            book: result.rows[0] 
        });
    } catch (error) {
        console.error("Помилка при отриманні книги:", error);
        res.status(500).send("Помилка сервера");
    }
});

// 3. Общий роутер для книг (каталог, POST, DELETE и т.д.)
app.use('/books', router)

app.get("/contacts", (req, res) => {
    res.render("pages2/contacts", { title: "Контакти" });
});

app.get('/authors', (req, res) => {
    const exist_authors = authors.length > 0;
    const response = {
        data: exist_authors ? authors : null,
        error: exist_authors ? null : "Authors list is empty",
        status: exist_authors ? 200 : 404
    };
    
    res.writeHead(response.status, {
        "Content-Type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify(response));
});

app.get('/authors/:id', (req, res) => {
    const id: number = +req.params.id;
    const author = authors.find((a) => a.id === id);
    const exist_author = author !== undefined;

    let authorBooks = null;
    if (exist_author) {
        authorBooks = books.filter((b) => b.authorIds.includes(author.id));
    }

    const response = {
        data: exist_author ? { ...author, books: authorBooks } : null,
        error: exist_author ? null : "The author is not found",
        status: exist_author ? 200 : 404
    };

    res.writeHead(response.status, {
        "Content-Type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify(response));
});

app.get("/login", (req: Request, res: Response) => {
    res.render("pages2/login", { title: "Login" });
});

// Обработка отправки формы: записываем имя в куки и кидаем на главную
app.post("/login", (req: Request, res: Response) => {
    const { username } = req.body;
    if (username && username.trim() !== "") {
        res.cookie("username", username.trim(), {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 день
        });
    }
    res.redirect("/");
});

// Кнопка выхода: удаляем куки и кидаем на главную
app.get("/logout", (req: Request, res: Response) => {
    res.clearCookie("username");
    res.redirect("/");
});


// 2. Сторінка реєстрації (форма)
app.get("/register", (req: Request, res: Response) => {
    res.render("pages2/register", { title: "Register" });
});

// Обробка форми реєстрації
app.post("/register", (req: Request, res: Response) => {
    const { username } = req.body;
    if (username && username.trim() !== "") {
        res.cookie("username", username.trim(), {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
    }
    res.redirect("/");
});

// Вихід із системи (знищення куки)
app.get("/logout", (req: Request, res: Response) => {
    res.clearCookie("username");
    res.redirect("/");
});



app.listen(Number(PORT), () => {
    cl(`Server has been started http://localhost:${PORT}`)
});

app.post("/books", (req: Request, res: Response) => {
    // Вот здесь выводим то, что прилетело из формы в терминал:
    console.log(req.body);

    // Дальше идет твой код сохранения в базу или редирект...
    res.redirect("/books");
});

// import express, {Request} from "express"
// import "dotenv/config"
// import { books } from "./data/books.js"
// import { BookResponceType } from "./types/BookResponceType.js"
// import { BookType } from "./types/BookType.js"
// import { authors } from "./data/authors.js";
// import router from "./routes/bookRoutes.js"
// import path from "node:path"
// import { fileURLToPath } from "node:url"
// import expressEjsLayouts from "express-ejs-layouts"
// import { pool } from "./db.js"; // Убедитесь, что путь к вашему файлу подключения к БД верный

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const cl = console.log
// const PORT = process.env.PORT || 3200
// const HOST = process.env.HOST || "http://localhost"

// const app = express()
// app.use(express.static('public'));

// app.set("views", path.join(__dirname, "..","views"));
// app.set("view engine", "ejs")

// app.use(expressEjsLayouts)
// app.set("layout", path.join(__dirname, "..","views", "layouts", "main"))

// app.use(express.json())

// // Функция сравнения (оставили на месте)
// function compareBook(b1: BookType, b2: BookType): number {
//     return b2.id - b1.id;
// }

// // Главная страница
// app.get('/', (req: Request<null, null, null, { title: string }>, res) => {
//     res.render("pages2/home",{
//         title: "Home page",
//         name: req.query.title
//     })
// });

// // Роуты для книг через отдельный файл
// app.use('/books', router)

// // Страница контактов
// app.get("/contacts", (req, res) => {
//     res.render("pages2/contacts", { title: "Контакти" });
// });

// // Детальный просмотр книги по ID из базы данных PostgreSQL
// app.get("/books/:id", async (req, res) => {
//     try {
//         const bookId = req.params.id;
//         const result = await pool.query("SELECT * FROM books WHERE id = $1", [bookId]);
        
//         if (result.rows.length === 0) {
//             return res.status(404).send("Книгу не знайдено");
//         }
        
//         res.render("pages2/book-detail", { 
//             title: result.rows[0].title, 
//             book: result.rows[0] 
//         });
//     } catch (error) {
//         console.error("Помилка при отриманні книги:", error);
//         res.status(500).send("Помилка сервера");
//     }
// });

// // Поиск книг по названию и статусу (ваш старый эндпоинт)
// app.get('/books/:title/:is_active', (req, res) => {
//     const searchTitle = req.params.title.toLowerCase();
//     const isActive = req.params.is_active === 'true';

//     const filteredBooks = books.filter((book) => {
//         const matchesTitle = book.title.toLowerCase().includes(searchTitle);
//         const matchesActive = book.is_active === isActive;
//         return matchesTitle && matchesActive;
//     });

//     const exist_book = filteredBooks.length > 0;
//     const responce: BookResponceType = {
//         data: exist_book ? filteredBooks : null,
//         error: exist_book ? null : "No books found matching this criteria",
//         status: exist_book ? 200 : 404
//     };

//     res.writeHead(responce.status, {
//         "Content-Type": "application/json; charset=utf-8"
//     });
//     res.end(JSON.stringify(responce));
// });

// // Получить одну первую книгу в формате JSON (ваш старый эндпоинт)
// app.get('/book', (req, res) => {
//     res.writeHead(200, {
//         "Content-Type": "application/json; charset=utf-8"
//     })
//     res.end(JSON.stringify(books[0]))
// })

// // Удаление книги из локального массива (ваш старый эндпоинт)
// app.delete('/books/:id', (req, res) => {
//     const id: number = +req.params.id
//     const bookIndex = books.findIndex((b) => b.id === id);

//     let status_code: number = 200;
//     const responce: BookResponceType = {
//         data: null,
//         error: null,
//         status: 200
//     }

//     if (bookIndex === -1) {
//         status_code = 404;
//         responce.status = status_code;
//         responce.error = "The book is not found or not deleted";
//     } else {
//         const deletedBook = books.splice(bookIndex, 1)[0];
//         status_code = 200;
//         responce.status = status_code;
//         responce.data = deletedBook;
//     }

//     res.writeHead(status_code, {
//         "Content-Type": "application/json; charset=utf-8"
//     });
//     res.end(JSON.stringify(responce));
// })

// // Получить список всех авторов
// app.get('/authors', (req, res) => {
//     const exist_authors = authors.length > 0;
//     const response = {
//         data: exist_authors ? authors : null,
//         error: exist_authors ? null : "Authors list is empty",
//         status: exist_authors ? 200 : 404
//     };
    
//     res.writeHead(response.status, {
//         "Content-Type": "application/json; charset=utf-8"
//     });
//     res.end(JSON.stringify(response));
// });

// // Получить автора по ID вместе с его книгами
// app.get('/authors/:id', (req, res) => {
//     const id: number = +req.params.id;
//     const author = authors.find((a) => a.id === id);
//     const exist_author = author !== undefined;

//     let authorBooks = null;
//     if (exist_author) {
//         authorBooks = books.filter((b) => b.authorIds.includes(author.id));
//     }

//     const response = {
//         data: exist_author ? { ...author, books: authorBooks } : null,
//         error: exist_author ? null : "The author is not found",
//         status: exist_author ? 200 : 404
//     };

//     res.writeHead(response.status, {
//         "Content-Type": "application/json; charset=utf-8"
//     });
//     res.end(JSON.stringify(response));
// });

// // Запуск сервера
// app.listen(Number(PORT), () => {
//     cl(`Server has been started http://${HOST}:${PORT}`)
// });