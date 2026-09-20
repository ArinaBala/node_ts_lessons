import { BookType } from "../types/BookType.js";
 
type showBooksType = (book:BookType)=>string;
 
type getBookBYTitleType = (title:string, books:BookType[])=>BookType[]|null

type compareBookType = (b1:BookType, b2:BookType)=>number

const showBooks:showBooksType = (book)=>
{
    return `<div class="book-card">

<h2 class="book-title">${book.title}</h2>
 
  <p class="book-price">${book.price} грн</p>
 
  <span class="book-status active">${book.is_active?"В наявності":"Немає"}</span>
 
  <a href="book/?id=${book.id}" class="book-button">Купити</a>
</div>`
}

const showAllBooks = (books: BookType[]): string => books.map(showBooks).join("\n");

const showBook = (book: BookType): string => `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${book.title}</title>
  <link rel="stylesheet" href="/styles/book.css">
</head>
<body>
  <main class="container">${showBooks(book)}</main>
</body>
</html>`;

const getBooksByTittle:getBookBYTitleType = (title, books)=>{
    const books_filtred = books.filter(book=>title.toLowerCase().trim() === book.title.toLowerCase().trim())
    if(books_filtred.length > 0)
    {
        return books_filtred
    }
    return null; 
}

const compareBook:compareBookType = (b1:BookType, b2:BookType)=>{
    return b2.id-b1.id
}

export {showAllBooks, showBook, showBooks, getBooksByTittle};