declare namespace NodeJS 
{  interface ProcessEnv 
  {    DATABASE_URL: string;   
     API_KEY: string;   
      NODE_ENV: "development" | "production" | "test"; 
     }}
 
declare namespace NodeJS {
  interface ProcessEnv {
    PORT:number,
    HOST:string,
    DB_HOST:string,
    DB_PORT:number,
    DB_USER:string,
    DB_PASSWORD:string,
    DB_NAME:string
  }
}
 