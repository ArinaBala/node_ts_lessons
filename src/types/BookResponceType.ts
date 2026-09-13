import { BookType } from "./BookType.js"

export type BookResponceType = 
{
    data:null | BookType | BookType[],
    error:null|string,
    status:number

}