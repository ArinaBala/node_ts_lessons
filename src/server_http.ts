import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import 'dotenv/config'

import { books } from "./data/books.js";
import { showAllBooks, showBook } from "./utils/showBooks.js";

const PORT = 4200;
const SERVER_NAME = "My Library Server";

const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const basePath = path.join("src");

    
    if (req.method === "POST" && url.pathname === "/books") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            try {
                const { title, price, is_active, image } = JSON.parse(body);
                
                if (!title || typeof price !== "number" || typeof is_active !== "boolean") {
                    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                    return res.end(JSON.stringify({ success: false, message: "Некоректні дані" }));
                }

                const newBook = {
                    id: books.length ? books[books.length - 1].id + 1 : 1,
                    title: title.trim(),
                    price,
                    is_active,
                    ...(image ? { image } : {})
                };

                books.push(newBook);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ success: true, message: "Успішно додано!", book: newBook }));
            } catch {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ success: false, message: "Невірний JSON" }));
            }
        });
        return;
    }

    
    if (req.method === "GET" && url.pathname === "/books") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(`<html><head><link rel="stylesheet" href="/styles/book.css"></head><body><div class="container">${showAllBooks(books)}</div></body></html>`);
    }

  
    if (req.method === "GET" && url.pathname === "/book") {
        const id = Number(url.searchParams.get("id"));
        const book = books.find(b => b.id === id);

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        if (book) {
            res.writeHead(200);
            return res.end(showBook(book));
        }
        res.writeHead(404);
        return res.end("Книга не знайдена");
    }


    if (req.method === "GET" && (url.pathname.startsWith("/styles/") || url.pathname.startsWith("/images/"))) {
        const filePath = path.join(basePath, url.pathname);
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: Record<string, string> = {
                ".css": "text/css",
                ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
                ".png": "image/png", ".svg": "image/svg+xml",
                ".webp": "image/webp", ".gif": "image/gif"
            };
            res.writeHead(200, { "Content-Type": `${mimeTypes[ext] || "application/octet-stream"}; charset=utf-8` });
            return res.end(fs.readFileSync(filePath));
        }
    }

   
    const routes: Record<string, string> = {
        "/": "pages/index.html",
        "/index.html": "pages/index.html",
        "/about": "pages/about.html",
        "/about.html": "pages/about.html",
        "/events": "pages/events.html",
        "/events.html": "pages/events.html",
        "/contacts": "pages/contacts.html",
        "/contacts.html": "pages/contacts.html"
    };

    if (req.method === "GET" && routes[url.pathname]) {
        const filePath = path.join(basePath, routes[url.pathname]);
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(fs.readFileSync(filePath));
    }

    
    if (req.method === "GET" && (url.pathname === "/catalog" || url.pathname === "/catalog.html")) {
        const template = fs.readFileSync(path.join(basePath, "pages/catalog.html"), "utf-8");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(template.replace("<!-- BOOKS -->", showAllBooks(books)));
    }

   
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Сторінку не знайдено (404)");
});


console.log(`Server Name: ${SERVER_NAME}`);

server.listen(process.env.PORT, () => {
    console.log(`Server http://${process.env.HOST}:${process.env.PORT} has been started...`);
    console.log(`Server name: ${process.env.SERVER_NAME}`);
});