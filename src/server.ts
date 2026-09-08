import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT: number = 4200;


const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".svg", ".webp", ".gif"];

const server = http.createServer((req, res) => {
    const PATH_TO_PAGES = path.join("src", "pages");
    const PATH_TO_IMAGES = path.join("src", "images");
    const PATH_TO_STYLES = path.join("src", "styles");

    const PATH_TO_INDEX_PAGE = path.join(PATH_TO_PAGES, "index.html");
    const PATH_TO_ABOUT_PAGE = path.join(PATH_TO_PAGES, "about.html");
    const PATH_TO_CATALOG_PAGE = path.join(PATH_TO_PAGES, "catalog.html");
    const PATH_TO_EVENTS_PAGE = path.join(PATH_TO_PAGES, "events.html");
    const PATH_TO_CONTACTS_PAGE = path.join(PATH_TO_PAGES, "contacts.html");

  
    if (req.method === "GET" && req.url?.startsWith("/styles/")) {
        const styleName = path.basename(req.url);
        const pathToStyle = path.join(PATH_TO_STYLES, styleName);
        if (fs.existsSync(pathToStyle)) {
            const content = fs.readFileSync(pathToStyle);
            res.setHeader("Content-Type", "text/css; charset=utf-8");
            res.write(content);
            res.end();
            return;
        }
    }

    if (req.method === "GET" && req.url?.startsWith("/images/")) {
        const imageName = path.basename(req.url);
        const pathToImage = path.join(PATH_TO_IMAGES, imageName);
        const ext = path.extname(imageName).toLowerCase();

        
        if (ALLOWED_IMAGE_EXTENSIONS.includes(ext) && fs.existsSync(pathToImage)) {
            const content = fs.readFileSync(pathToImage);
            
           
            let contentType = "application/octet-stream";
            if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
            else if (ext === ".png") contentType = "image/png";
            else if (ext === ".svg") contentType = "image/svg+xml";
            else if (ext === ".webp") contentType = "image/webp";
            else if (ext === ".gif") contentType = "image/gif";

            res.setHeader("Content-Type", contentType);
            res.write(content);
            res.end();
            return;
        } else {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.write("Картинку не знайдено або заборонений формат");
            res.end();
            return;
        }
    }

    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
        const content = fs.readFileSync(PATH_TO_INDEX_PAGE);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.write(content.toString());
    }
    else if ((req.method === "POST" && req.url === "/") || (req.method === "GET" && (req.url === "/about" || req.url === "/about.html"))) {
        const content = fs.readFileSync(PATH_TO_ABOUT_PAGE);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.write(content.toString());
    }
    else if (req.method === "GET" && (req.url === "/catalog" || req.url === "/catalog.html")) {
        const content = fs.readFileSync(PATH_TO_CATALOG_PAGE);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.write(content.toString());
    }
    else if (req.method === "GET" && (req.url === "/events" || req.url === "/events.html")) {
        const content = fs.readFileSync(PATH_TO_EVENTS_PAGE);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.write(content.toString());
    }
    else if (req.method === "GET" && (req.url === "/contacts" || req.url === "/contacts.html")) {
        const content = fs.readFileSync(PATH_TO_CONTACTS_PAGE);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.write(content.toString());
    }
    else if (req.method === "PUT") {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.write(`Ти хочеш оновити дані. Request: ${req.method}`);
    }
    else {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.write("Сторінку не знайдено (404)");
    }

    res.end();
})

server.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} has been started...`)
})