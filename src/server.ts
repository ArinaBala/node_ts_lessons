import express from "express"
import "dotenv/config"
import { books } from "./data/books.js"
import { BookResponceType } from "./types/BookResponceType.js"

const cl = console.log
const PORT = process.env.PORT || 3200
const HOST = process.env.HOST || "localhost"

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/html"
    })
    res.end("<h2>Hello from me</h2>")
})

// Роут для пошуку за частиною назви та статусом is_active
app.get('/books/:title/:is_active', (req, res) => {
    const searchTitle = req.params.title.toLowerCase();
    const isActive = req.params.is_active === 'true';

    // Фільтруємо масив книжок
    const filteredBooks = books.filter((book) => {
        const matchesTitle = book.title.toLowerCase().includes(searchTitle);
        const matchesActive = book.is_active === isActive;
        return matchesTitle && matchesActive;
    });

    const exist_book = filteredBooks.length > 0;
    const responce: BookResponceType = {
        data: exist_book ? filteredBooks : null,
        error: exist_book ? null : "No books found matching this criteria",
        status: exist_book ? 200 : 404
    };

    res.writeHead(responce.status, {
        "Content-Type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify(responce));
});

app.get('/books/:id', (req, res) => {
    const id: number = +req.params.id
    const book = books.find((b) => b.id === id);
    const exist_book: boolean = book !== undefined
    const responce: BookResponceType = {
        data: book ?? null, // Виправлено: якщо book немає, повертається null замість undefined
        error: exist_book ? null : "The book is not found",
        status: exist_book ? 200 : 404
    };
    
    res.writeHead(responce.status, {
        "Content-Type": "application/json; charset=utf-8"
    })
    res.end(JSON.stringify(responce))
}) 

app.post('/books', (req, res) => {
    const { title, price, is_active, image } = req.body;

    let status_code: number = 201;
    const responce: BookResponceType = {
        data: null,
        error: null,
        status: 201
    }

    if (!title || typeof price !== "number" || typeof is_active !== "boolean") {
        status_code = 400;
        responce.status = status_code;
        responce.error = "Invalid book data";
    } else {
        const newBook = {
            id: books.length ? books[books.length - 1].id + 1 : 1,
            title: title.trim(),
            price,
            is_active,
            ...(image ? { image } : {})
        };

        books.push(newBook);
        responce.data = newBook;
    }

    res.writeHead(status_code, {
        "Content-Type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify(responce));
})

app.delete('/books/:id', (req, res) => {
    const id: number = +req.params.id
    const bookIndex = books.findIndex((b) => b.id === id);

    let status_code: number = 200;
    const responce: BookResponceType = {
        data: null,
        error: null,
        status: 200
    }

    if (bookIndex === -1) {
        status_code = 404;
        responce.status = status_code;
        responce.error = "The book is not found or not deleted";
    } else {
        const deletedBook = books.splice(bookIndex, 1)[0];
        status_code = 200;
        responce.status = status_code;
        responce.data = deletedBook;
    }

    res.writeHead(status_code, {
        "Content-Type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify(responce));
})

app.get('/books', (req, res) => {
    const exist_book: boolean = books.length > 0
    const responce: BookResponceType = {
        data: exist_book ? books : null,
        error: exist_book ? null : "Books list is empty",
        status: exist_book ? 200 : 404
    };

    res.writeHead(responce.status, {
        "Content-Type": "application/json; charset=utf-8"
    })
    res.end(JSON.stringify(responce))
})

app.get('/book', (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8"
    })
    res.end(JSON.stringify(books[0]))
})

app.listen(PORT, () => {
    cl(`Server has been started http://${HOST}:${PORT}`)
})