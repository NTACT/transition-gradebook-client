const nanoid = require('nanoid');
const partition = require('lodash/partition');
const { csvDataHelper } = require('tgb-shared');

const [requiredFields, optionalFields] = partition(csvDataHelper.columns.map(col => {
    const { validAlias, ...rest} = col;
    return {
        ...rest,
        validAlias: validAlias.map(alias => alias.toLowerCase().replace(/\s/g, ''))
    }
}), col => col.required);

/**
 * Attempt to get the value using the valid aliases for the fields
 * @param {object} studentData the parsed student object
 * @param {Array<string>} aliases a list of valid aliases
 */
function findFieldByAlias(studentData, aliases) {
    for(const alias of aliases) {
        const data = studentData[alias];
        if(data) {
            return data;
        }
    }
    return undefined;
}

/**
 * Check a required field for invalid or missing values
 * @param {object} requiredField the metadata for the required field
 * @param {any} value the value that was parsed 
 */
function isError(requiredField, value) {
    return !value || (requiredFields.validValues && requiredField.validValues.includes(value));
}

/**
 * Convert cute, human friendly field names to a common form that computers can understand
 * @param {Array} entry a single value returned by Object.entries 
 */
function normalizeFieldNames(entry) {
    const [key, value] = entry;
    return [
        key
            .toLowerCase() // remove the cute uppercase letters
            .replace(/\s/g, ''), //remove the cute spaces in the fields
        value
    ];
}

/**
 * Get the value for required student data
 * @param {object} studentData 
 */
async function parseRequiredStudentData(studentData) {
    const parsed = {};

    for(const required of requiredFields) {
        const parsedField = findFieldByAlias(studentData, required.validAlias);
        parsed[required.field] = {
            value: parsedField,
            error: isError(required, parsedField),
            id: nanoid(),
        }
    }
    return parsed;
}

/**
 * Check the field against valid values.
 * A warning indicates that the value will be accepted for submission, but might be ignored by the server when importing
 * @param {object} optionalField an optional field metadata to test
 * @param {any} value the parsed value 
 */
function isWarning(optionalField, value) {
    return !value || (optionalField.validValues && optionalField.validValues.includes(value));
}

/**
 * Parse the non-required fields of the imported student
 * @param {object} studentData 
 */
async function parseExtraStudentData(studentData) {
    const parsed = {};
    for(const optional of optionalFields) {
        const parsedField = findFieldByAlias(studentData, optional.validAlias);
        parsed[optional.field] = {
            value: parsedField,
            warning: isWarning(optional, parsedField),
            id: nanoid(),
        }
    }
    return parsed;
}

// Object.fromEntries doesn't have good support
function fromEntries(entries) {
    const object = {};
    for (const [key, value] of entries) {
        object[key] = value;
    }
    return object;
}

async function parseStudentCSVRow(studentData) {
    const normalizedStudentData = fromEntries(Object.entries(studentData).map(normalizeFieldNames));
    const [required, optional] = await Promise.all([
        parseRequiredStudentData(normalizedStudentData),
        parseExtraStudentData(normalizedStudentData)
    ]);
    return {
        ...required,
        ...optional,
    }
}

async function translateImportStudentCSV(importedCSV) {
    const { data } = importedCSV;
    return await Promise.all(data.map(studentData => parseStudentCSVRow(studentData)));
}

// Ugly hack to allow this to be tested
if(process.env.NODE_ENV === 'test') {
    module.exports = translateImportStudentCSV;
}
export default translateImportStudentCSV;