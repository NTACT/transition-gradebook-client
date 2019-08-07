const Papa = require('papaparse');

const defaultParseConfig = {
    // Map header as field names
    header: true,
    // display as strings, handle real values on the server
    dynamicTyping: false,
    delimiter: ',',
    // lines that are completely empty or have only whitespaces in all columns are ignored
    skipEmptyLines: 'greedy',
}

async function parseCSV(file) {
    return new Promise((resolve, reject) => {
        const onComplete = results => resolve(results);
        const onError = error => reject(error);
        const parseConfig = {
            ...defaultParseConfig,
            complete: onComplete,
            error: onError,
        }
        Papa.parse(file, parseConfig);
    });
}

if(process.env.NODE_ENV === 'test') {
    module.exports = parseCSV;
}
export default parseCSV;