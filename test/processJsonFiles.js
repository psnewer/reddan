const fs = require('fs').promises;
const path = require('path');

async function replaceKeysInObject(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            // 递归处理嵌套对象
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                replaceKeysInObject(obj[key]);
            }

            // 替换键名
            if (key === 'Epr') {
                obj['Esrv'] = obj[key];
                delete obj[key];
            }
        }
    }
}

async function processJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        let jsonData = JSON.parse(data);

        // 递归替换键名
        replaceKeysInObject(jsonData);

        // 写回修改后的 JSON 数据
        await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log(`Processed ${filePath}`);
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
    }
}

async function processDirectory(directory) {
    try {
        const files = await fs.readdir(directory, { withFileTypes: true });
        for (let file of files) {
            const fullPath = path.join(directory, file.name);
            if (file.isDirectory()) {
                // 递归处理子目录
                await processDirectory(fullPath);
            } else if (file.isFile() && path.extname(file.name) === '.json') {
                // 处理 JSON 文件
                await processJsonFile(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${directory}:`, error);
    }
}

const currentDirectory = './'; // 当前目录
processDirectory(currentDirectory);

