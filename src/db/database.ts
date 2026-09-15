import {Pool} from "pg"
export const pool = new Pool({
    host:"localhost",
    port:5432,
    user: "arizonaaaaa",
    password:"salsa55555",
    database: "library",
})