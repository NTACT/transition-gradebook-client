const path = require('path');
const { readFileSync } = require('fs');
const parseCSV = require('../src/utils/parseCSV');
const translateImportStudentCSV = require('../src/utils/translateImportStudentCSV');
const { csvDataHelper } = require('tgb-shared');

const csvFiles = path.resolve(__dirname, 'csv');
function load(csv) {
    const csvFile = path.resolve(csvFiles, csv);
    return readFileSync(csvFile, 'utf-8');
}
const allRequiredStandard = load('allRequiredFieldsPresent.csv');
const allRequiredWithAliases = load('allRequiredWithAliases.csv');
const empty = load('empty.csv');
const large = load('largeFile.csv');

function countErrors(results) {
    let errorCount = 0;
    for (const result of results) {
        const entries = Object.entries(result);
        errorCount += entries.reduce((count, [key, value]) => {
            if(value.error) {
                count += 1;
            }
            return count;
        }, 0)
    }
    return errorCount;
}

function countWarnings(results) {
    let warningCount = 0;
    for (const result of results) {
        const entries = Object.entries(result);
        warningCount += entries.reduce((count, [_, value]) => {
            if(value.warning) {
                count += 1;
            }
            return count;
        }, 0)
    }
    return warningCount;
}

describe('translateImportStudentCSV tests', () => {
    test('All required, standard format', async () => {
        const { data, meta } = await parseCSV(allRequiredStandard);
        const result = await translateImportStudentCSV({data, meta});
        expect(result).toBeDefined();
        expect(result.length).toEqual(6);
        expect(countErrors(result)).toEqual(0);
    });

    test('Gracefully handles empty files', async () => {
        const { data, meta } = await parseCSV(empty);
        const result = await translateImportStudentCSV({data, meta});
        expect(result).toBeDefined();
        expect(result.length).toEqual(0);
    });

    test('Gracefully handles large files', async () => {
        const { data, meta } = await parseCSV(large);
        const result = await translateImportStudentCSV({data, meta});
        expect(result).toBeDefined();
        expect(result.length).toEqual(1998);
    });

    test('Handles aliased columns', async () => {
        const { data, meta } = await parseCSV(allRequiredWithAliases);
        const result = await translateImportStudentCSV({data, meta});
        expect(result).toBeDefined();
        expect(result.length).toEqual(6);
        expect(countErrors(result)).toEqual(0);
    });
});