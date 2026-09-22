import { Request, Response, NextFunction } from "express";
import FileWorker from "../utils/FileWorker.js";
import path from "node:path";

export const loggerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    console.log("Run middleware logger");
    const FILE_TO_PATH = path.join("logs", "logs.txt");
    let message = `${new Date().toISOString()} ${req.method} ${req.originalUrl}`;

    if (req.params && Object.keys(req.params).length > 0) {
        const params = JSON.stringify(req.params);
        message += ` params: ${params}`;
    }

    if (req.query && Object.keys(req.query).length > 0) {
        const query = JSON.stringify(req.query);
        message += ` query: ${query}`;
    }

    if (req.body && Object.keys(req.body).length > 0) {
        const body = JSON.stringify(req.body);
        message += ` body: ${body}`;
    }

    message += '\n';

    await FileWorker.writeToFile(FILE_TO_PATH, message);
    next();
};