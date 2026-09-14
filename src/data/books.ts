import { BookType } from "../types/BookType.js";

const books: Array<BookType> = [
  {
    id: 1,
    title: "Кобзар",
    price: 250,
    is_active: true,
    authorIds: [1]
  },
  {
    id: 2,
    title: "Тигролови",
    price: 320,
    is_active: true,
    authorIds: [2]
  },
  {
    id: 3,
    title: "1984",
    price: 400,
    is_active: true,
    authorIds: [3]
  },
  {
    id: 4,
    title: "Гаррі Поттер і філософський камінь",
    price: 450,
    is_active: false,
    authorIds: [4]
  },
  {
    id: 5,
    title: "Маленький принц",
    price: 280,
    is_active: true,
    authorIds: [5]
  },
  {
    id: 6,
    title: "pug test",
    price: 500,
    is_active: true,
    authorIds: [1]
  }
];
 
export { books };