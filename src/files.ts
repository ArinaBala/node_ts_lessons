import path from "node:path"
import fs from "node:fs/promises"

class FileWorker {
	static path: string

	static async getContent(): Promise<string> {
		return fs.readFile(this.path, "utf8")
	}

	static async writeToFile(filePath: string, content: string): Promise<void> {
		await fs.writeFile(filePath, content)
	}
}

const FILE_TO_PATH = path.join('logs','logs.txt')
 
FileWorker.path = FILE_TO_PATH;
const content = await FileWorker.getContent()
await FileWorker.writeToFile(FILE_TO_PATH, content)

