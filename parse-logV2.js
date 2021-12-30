const fs = require('fs');
const readline = require('readline');
const moment = require('moment');
const fsExtra = require('fs-extra')

const outputFolder = 'out';
const breakLine = '\r\n';
const outFileExtension = '.log';

createFolderIfNotExist(outputFolder);
fsExtra.emptyDirSync(outputFolder)

let inputFolder;
// const listFile = getListFile(inputFolder);
let listFile = [];

// lay dia chi thu muc hien tai
var currentPath = process.cwd();
console.log("currentPath: " + currentPath);

listFile = getListFile(currentPath)

if (listFile == null || listFile == undefined) {
    console.log('list file is null or undifine')
    return;
}

listFile.forEach(file => {
    const rl = getReadLine(file);
    console.log('getReadLine' + file)
    const outputFile = (outputFolder + '/' + file).replace(/\s+/g, '') + outFileExtension;
    const writeStream = fs.createWriteStream(outputFile);
    rl.on('line', (line) => {
        if (isJson(line)) {
            convertLog(line, writeStream);
        }
    });
    console.log(`done ! check new log in ${outputFile}`)
})

/**
 * @param file
 */
function getReadLine(file) {
    return readline.createInterface({
        input: fs.createReadStream(file),
        crlfDelay: Infinity
    });
}

function getListFile(inputFolder) {
    const listFile = [];
    fs.readdirSync(inputFolder).forEach(file => {
        // kiem tra xem file co phai la 1 thu muc khong.
        if(!fs.lstatSync(file).isDirectory()){
            listFile.push(file)
        }
    });
    return listFile;
}

function createFolderIfNotExist(folder) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
}

function deleteAllFileInFolder(folder) {

}

function isNullOrUndefine(toCheck) {
    return toCheck == null || toCheck == undefined;
}

function convertLog(rawLine, writeStream) {
    let parseToObject = JSON.parse(rawLine);
    let newFormatLine = toNewFormat(parseToObject);
    writeStream.write(newFormatLine + breakLine);
}
//thread_name
function toNewFormat(obj) {
    let className = String(obj['logger_name']).split(".").slice(-1).pop();
    let newLine = `${converDate(obj['@timestamp'])} ${obj['level']}  [${obj['thread_name']}] - ${className} ----  ${obj['message']}`;
    return newLine;
}

function converDate(toConvert) {
    let dt = new Date(Date.parse(toConvert));
    return moment(dt).format('DD-MM-yyyy HH:mm:ss.SSS');
}

function isJson(item) {
    item = typeof item !== "string"
        ? JSON.stringify(item)
        : item;

    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }

    if (typeof item === "object" && item !== null) {
        return true;
    }

    return false;
}





