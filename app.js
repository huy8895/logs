const fs = require('fs');
const readline = require('readline');
const moment = require('moment');  
const path = require('path');

const defaultInputFile = 'AFS-log.json';
const defaultSkipLine = 5;
const defaultOutputFile = 'out/AFS-new-logs.log';
const outputFolder = 'out';
const inputFolder = 'input';
const breakLine = '\r\n';
const outFileExtension = '.log';

const skipLine = isNullOrUndefine(process.argv[2]) ? defaultSkipLine : process.argv[2];
const outputFile = isNullOrUndefine(process.argv[3]) ? defaultOutputFile : (folder + '/' + process.argv[3] + outFileExtension);
const inputFile = isNullOrUndefine(process.argv[4]) ? defaultInputFile : process.argv[4];

createFolderIfNotExist(inputFolder);
createFolderIfNotExist(outputFolder);

fs.readdirSync(outputFolder, (err, files) => {
    if (err) throw err;
    for (const file of files) {
        fs.unlink(path.join(outputFolder, file), err => {
            if (err) throw err;
        });
    }
});
const listFile = getListFile(inputFolder);

listFile.forEach(file => {
    const rl = getReadLine(inputFolder + '/' +file);
    const outputFile = (outputFolder + '/' + file).replace(/\s+/g, '');
    const writeStream = fs.createWriteStream(outputFile);
    rl.on('line', (line) => {
        if (isJson(line)) {
            convertLog(line,writeStream);
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
        listFile.push(file)
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

function convertLog(rawLine,writeStream) {
    let parseToObject = JSON.parse(rawLine);
    let newFormatLine = toNewFormat(parseToObject);
    writeStream.write(newFormatLine + breakLine);
}

function toNewFormat(obj){
    let newLine = `${converDate(obj['@timestamp'])} ${obj['level']} --- ${obj['message']}`;
    return newLine;
}

function converDate(toConvert){
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





