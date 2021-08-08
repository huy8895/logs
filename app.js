const fs = require('fs');
const readline = require('readline');
const moment = require('moment');  


const defaultInputFile = 'AFS-log.json';
const defaultSkipLine = 5;
const outputFile = 'out/AFS-new-logs.log';
const outputFolder = 'out';
const breakLine = '\r\n';

const writeStream = fs.createWriteStream(outputFile);
const skipLine = isNullOrUndefine(process.argv[2]) ? defaultSkipLine : process.argv[2];
const inputFile = isNullOrUndefine(process.argv[3]) ? defaultInputFile : process.argv[3];
const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity
});

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

let count = 0;

console.log(`skipLine = ${skipLine}`)
console.log(`inputFile = ${inputFile}`)

rl.on('line', (line) => {
    count++;
    if (isNullOrUndefine(skipLine)) {
        convertLog(line);
    } else {
        if(count > skipLine){
            convertLog(line);
        }
    }
});
console.log(`done ! check new log in ${outputFile}`)

function isNullOrUndefine(toCheck) {
    return toCheck == null || toCheck == undefined;
}

function convertLog(rawLine) {
    let parseToObject = JSON.parse(rawLine);
    let newFormatLine = toNewFormat(parseToObject);
    writeStream.write(newFormatLine + breakLine);
}

function toNewFormat(obj){
    let newLine = [];
    newLine.push(
        converDate(obj['@timestamp']),
        obj['level'],
        obj['logger_name'],
        obj['message']
        )
    ;
    return newLine.join(' ');
}

function converDate(toConvert){
    let dt = new Date(Date.parse(toConvert));
    return moment(dt).format('DD-MM-yyyy HH:mm:ss.SSS');
}







