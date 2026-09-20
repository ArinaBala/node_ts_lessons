import express, {Request} from "express"
import "dotenv/config"
import { books } from "./data/books.js"
import { BookResponceType } from "./types/BookResponceType.js"
import { getBooksByTittle } from "./utils/showBooks.js"
import { BookType } from "./types/BookType.js"
//middleware - попередній обробник
import { authors } from "./data/authors.js";
import router from "./routes/bookRoutes.js"
import path from "node:path"
import ejs from "ejs"
import { fileURLToPath } from "node:url"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cl = console.log
const PORT = process.env.PORT || 3200
const HOST = process.env.HOST || "http://localhost"

const app = express()
app.use(express.static('public'));

app.set("views", path.join(__dirname, "..",path.sep,"views"));
app.set("view engine", "ejs")


function compareBook(b1: BookType, b2: BookType): number {
    return b2.id, b1.id
}



app.use(express.static("public"))

app.use(express.json())

app.get('/', (req:Request<null,null,null,{title:string}>,res)=>
{

res.render("pages2/home",{
    name:req.query.title
})

})


app.use('/books', router)

app.get('/', (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/html"
    })
    res.end("<h2>Hello from me</h2>")
})

app.get('/books/:title/:is_active', (req, res) => {
    const searchTitle = req.params.title.toLowerCase();
    const isActive = req.params.is_active === 'true';

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

app.get('/book', (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8"
    })
    res.end(JSON.stringify(books[0]))
})

app.listen(PORT, () => {
    cl(`Server has been started http://${HOST}:${PORT}`)
})

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