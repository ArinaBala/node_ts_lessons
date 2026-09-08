// import * as fs from "node:fs/promises";
// import * as readline from "node:readline/promises";
// import { stdout as output, stdin as input } from "node:process";
// import path from "node:path";

// export default class FileWorker {
//     private static path_to_file: string;

//     public static set path(path: string) {
//         FileWorker.path_to_file = path;
//     }

//     public static async getContent(): Promise<string> {
//         const rl = readline.createInterface({ input, output });
//         try {
//             const content: string = await rl.question("Enter your content: ");
//             return content;
//         } catch (error) {
//             console.log(`no data ${error}`);
//             return '';
//         } finally {
//             rl.close();
//         }
//     }

//     public static async writeToFile(filePath: string, content: string): Promise<void> {
//         try {
//             await fs.appendFile(filePath, content + '\n', 'utf-8');
//             console.log("Файл успішно збережено");
//         } catch (error) {
//             console.log("Файл не збережено", error);
//         }
//     }

//     public static async readFile(filePath: string): Promise<Buffer | undefined> {
//         try {
//             return await fs.readFile(filePath);
//         } catch (error) {
//             console.error(`My Error ${error}`);
//         }
//     }

   
//     public static async createDirectory(dirPath: string): Promise<void> {
//         try {
            
//             // fs.mkdir() cтворює нову папку { recursive: true } дозволяє не видавати помилку якщо папка існує та створювати вкладені папки.
//             await fs.mkdir(dirPath, { recursive: true });
//             console.log(`[mkdir]: Директорія '${dirPath}' готова до роботи.`);
//         } catch (error) {
//             console.error(`Помилка створення папки: ${error}`);
//         }
//     }

    
//     public static async getAbsolutePath(itemPath: string): Promise<void> {
//         try {
//             //fs.realpath() Визначає абсолютний шлях до файлу/папки у системі.
//             const absPath = await fs.realpath(itemPath);
//             console.log(`[realpath]: Абсолютний шлях до '${itemPath}':\n --> ${absPath}`);
//         } catch (error) {
//             console.error(`Помилка отримання шляху: ${error}`);
//         }
//     }

   
//     public static async printFileInfo(filePath: string): Promise<void> {
//         try {
//             // fs.stat() Отримує детальну метаінформацію про файл його розмір,тип,час 
//             const stats = await fs.stat(filePath);
//             console.log(`[stat]: Розмір файлу ${filePath}: ${stats.size} байт.`);
//         } catch (error) {
//             console.error(`Помилка отримання інфо про файл: ${error}`);
//         }
//     }


//     public static async updateTimestamps(filePath: string): Promise<void> {
//         try {
//             // fs.utimes() Змінює час останнього доступу (atime) та модифікації (mtime) файлу
//             const time = new Date(); // поточний час
//             await fs.utimes(filePath, time, time);
//             console.log(`[utimes]: Час доступу та модифікації для '${filePath}' оновлено на ${time.toISOString()}`);
//         } catch (error) {
//             console.error(`Помилка оновлення часу: ${error}`);
//         }
//     }

 
//     public static async showDirectoryContent(dirPath: string): Promise<void> {
//         try {
//             //fs.readdir() Читає вміст папки та повертає масив імен файлів або папок які там знаходяться
//             const files = await fs.readdir(dirPath);
//             console.log(`[readdir]: Вміст папки '${dirPath}':`, files);
//         } catch (error) {
//             console.error(`Помилка читання директорії: ${error}`);
//         }
//     }

    
//     public static async renameMyFile(oldPath: string, newPath: string): Promise<void> {
//         try {
//             //fs.rename() Перейменовує файл або переміщує його
//             await fs.rename(oldPath, newPath);
//             console.log(`[rename]: Файл перейменовано з '${oldPath}' на '${newPath}'`);
//         } catch (error) {
//             console.error(`Помилка перейменування: ${error}`);
//         }
//     }

    
//     public static async setReadOnly(filePath: string): Promise<void> {
//         try {
//             //fs.chmod() Змінює права доступу до файлу. 0o444 - тільки для читання.
//             await fs.chmod(filePath, 0o444);
//             console.log(`[chmod]: Права файлу '${filePath}' змінено на 'тільки читання'`);
            
//             // тут ми повертаємо права на запис (0o666), щоб можна було тестувати далі
//             await fs.chmod(filePath, 0o666); 
//         } catch (error) {
//             console.error(`Помилка зміни прав: ${error}`);
//         }
//     }

    
//     public static async truncateMyFile(filePath: string, length: number): Promise<void> {
//         try {
//             //fs.truncate() Обрізає вміст файлу до вказаної кількості байтів
//             await fs.truncate(filePath, length);
//             console.log(`[truncate]: Файл '${filePath}' обрізано до ${length} байт`);
//         } catch (error) {
//             console.error(`Помилка обрізання файлу: ${error}`);
//         }
//     }

    
//     public static async deleteMyFile(filePath: string): Promise<void> {
//         try {
//             //fs.unlink() Повністю видаляє файл
//             await fs.unlink(filePath);
//             console.log(`[unlink]: Файл '${filePath}' успішно видалено`);
//         } catch (error) {
//             console.error(`Помилка видалення файлу: ${error}`);
//         }
//     }

  
//     public static async removeFolder(dirPath: string): Promise<void> {
//         try {
//             //fs.rm() Видаляє файли або цілі директорії  
//             await fs.rm(dirPath, { recursive: true, force: true });
//             console.log(`[rm]: Директорію '${dirPath}' та весь її вміст видалено`);
//         } catch (error) {
//             console.error(`Помилка видалення директорії: ${error}`);
//         }
//     }
// }



// const LOG_DIR = 'logs';
// const FILE_TO_PATH = path.join(LOG_DIR, 'logs.txt');
// const DUMMY_FILE = path.join(LOG_DIR, 'dummy.txt');
// const RENAMED_DUMMY = path.join(LOG_DIR, 'dummy_old.txt');
// const TEMP_DIR = 'temp_folder';

// async function run() {
//     //створюємо робочу директорію та тимчасову папку для тесту видалення
//     await FileWorker.createDirectory(LOG_DIR);
//     await FileWorker.createDirectory(TEMP_DIR);

//     //отримуємо абсолютний шлях до створеної папки
//     await FileWorker.getAbsolutePath(LOG_DIR);

//     FileWorker.path = FILE_TO_PATH; 

//     //робимо запит контенту від користувача та запис у файл 
//     let content: string | undefined = await FileWorker.getContent();
//     await FileWorker.writeToFile(FILE_TO_PATH, content);

//     //створюємо додатковий файл-пустушку для тестів перейменуванняабо видалення
//     await FileWorker.writeToFile(DUMMY_FILE, "Тимчасовий текст");

//     //дивимося інформацію про головний файл
//     await FileWorker.printFileInfo(FILE_TO_PATH);

//     //оновлюємо мітки часу файлу (ніби його щойно редагували)
//     await FileWorker.updateTimestamps(FILE_TO_PATH);

//     //дивимося вміст папки logs
//     await FileWorker.showDirectoryContent(LOG_DIR);

//     //перейменовуємо файл-пустушку
//     await FileWorker.renameMyFile(DUMMY_FILE, RENAMED_DUMMY);

//     //права доступу робимо для читання
//     await FileWorker.setReadOnly(FILE_TO_PATH);

//     //обрізаємо оригінальний файл та залишаємо лише 5 байт для тесту
//     await FileWorker.truncateMyFile(FILE_TO_PATH, 5);

//     //видаляємо перейменований даммі файл
//     await FileWorker.deleteMyFile(RENAMED_DUMMY);

//     //видаляємо тимчасову тестову директорію разом із вмістом
//     await FileWorker.removeFolder(TEMP_DIR);
// }

// run();