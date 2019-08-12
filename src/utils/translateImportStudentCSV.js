import { Settings } from '../components/Icons';

const nanoid = require('nanoid');
const moment = require('moment');
const { csvDataHelper } = require('tgb-shared');

const notProvided = value => value === undefined || value === null;

function normalizeValue(field, value) {
    if(notProvided(value)|| value === '') { 
        return '';
    }
    const { types } = csvDataHelper;
    const fieldType = field.type || types.string;
    switch(fieldType) {
        case types.string:
        case types.enum:
            return value;
        case types.boolean:
            return csvDataHelper.toYesNoBooleanValue(value);
        case types.date:
            return moment(value).format('MM/DD/YYYY');
        case types.integer:
        case types.float:
            return +value;
        default:
            return value;
    }
}

function findExistingStudentWithId(parsedStudentData, currentStudents) {
    if(!currentStudents || !currentStudents.length) {
        return null;
    }
    const studentId = parsedStudentData.studentId;
    if(studentId && studentId.value) {
        const existingStudent = currentStudents.find(student => student.studentId === studentId.value);
        if(existingStudent) {
            return existingStudent;
        }
        return null;
    }
    return null;
}

function findImportingStudentWithId(parsedStudentData, runningList) {
    const studentId = parsedStudentData.studentId;
    if(studentId && studentId.value) {
        const existingStudent = runningList.find(student => student.studentId && student.studentId.value === studentId.value);
        if(existingStudent) {
            return existingStudent;
        }
        return null;
    }
    return null;
}

function getMismatchedFieldWarnings(parsedStudent, existingStudent) {
    const mismatchedCells = [];
    const importEntries = Object.entries(parsedStudent);
    for(const [key, studentData] of importEntries) {
        const existingValue = existingStudent[key];
        // If the new data isn't provided, it will (or should) be ignored on the server.
        if(notProvided(studentData.value) || studentData.value === '') {
            continue;
        }
        if(!notProvided(existingValue) && existingValue.toString().toLowerCase() !== studentData.value) {
            mismatchedCells.push({
                cellId: studentData.id, 
                warning: `Student already exists and value will overwrite current records. Current: ${existingValue.toString()}`
            });
        }
    }
    return mismatchedCells;
}

function getErrorsForCell(field, data) {
    if(csvDataHelper.isRequiredAndMissing(field, data)) {
        return 'Required data is missing';
    }
    if(csvDataHelper.isRequiredAndUnacceptedValue(field, data)) {
        return 'Required data is an unexpected value';
    }
    return null;
}

function getWarningsForCell(field, data) {
    if(csvDataHelper.isOptionalAndUnacceptedValue(field, data)) {
        return 'Data is an unexpected value';
    }
    return null;
}

/**
 * Get the value for required student data
 * @param {object} studentData 
 */
function parseRequiredStudentData(studentData, currentStudents, runningList) {
    const parsed = {};
    for(const required of csvDataHelper.requiredFields) {
        const parsedField = csvDataHelper.findFieldByAlias(studentData, required.validAlias);
        const error = getErrorsForCell(required, parsedField);
        parsed[required.field] = {
            value: error ? parsedField : normalizeValue(required, parsedField),
            error,
        }
    }
    if(findExistingStudentWithId(parsed, currentStudents) !== null) {
        parsed.currentStudent = true;
    }
    if(findImportingStudentWithId(parsed, runningList) !== null) {
        const { studentId, } = parsed;
        // Replace any existing error with this one
        parsed['studentId'] = {
            ...studentId,
            error: `Duplicate student ID (${studentId.value})`
        }
    }
    return {
        ...parsed,
    };
}

function recheckRequiredStudentData(studentData, currentStudents, runningList) {
    const parsed = {};
    for(const required of csvDataHelper.requiredFields) {
        const fieldData = studentData[required.field];
        const { id, value } = fieldData; 
        const newError = getErrorsForCell(required, value);
        parsed[required.field] = {
            value: newError || null ? value : normalizeValue(required, value),
            error: newError,
            id,
        }
    }

    if(findExistingStudentWithId(parsed, currentStudents) !== null) {
        parsed.currentStudent = true;
    }
    if(findImportingStudentWithId(parsed, runningList) !== null) {
        const { studentId, } = parsed;
        // Replace any existing error with this one
        parsed['studentId'] = {
            ...studentId,
            error: `Duplicate student ID (${studentId.value})`
        }
    }
    return {
        ...parsed,
    };
}

/**
 * Parse the non-required fields of the imported student
 * @param {object} studentData 
 */
function parseExtraStudentData(studentData) {
    const parsed = {};
    for(const optional of csvDataHelper.optionalFields) {
        const parsedField = csvDataHelper.findFieldByAlias(studentData, optional.validAlias);
        const warning = getWarningsForCell(optional, parsedField);
        parsed[optional.field] = {
            value: warning ? parsedField : normalizeValue(optional, parsedField),
            warning,
        }
    }
    return {
        ...parsed,
    };
}
function recheckExtraStudentData(studentData) {
    const parsed = {};
    const { warnings, ...restOfData} = studentData;
    for(const optional of csvDataHelper.optionalFields) {
        const fieldData = restOfData[optional.field];
        const { id, value, } = fieldData; 
        const checkedValue = value === '' ? null : value.toString(); 
        const newWarning = getWarningsForCell(optional, checkedValue);
        parsed[optional.field] = {
            value: newWarning ? checkedValue : normalizeValue(optional, checkedValue),
            warning: newWarning,
            id,
        }
    }
    return {
        ...parsed,
    };
}

// Object.fromEntries doesn't have good support
function fromEntries(entries) {
    const object = {};
    for (const [key, value] of entries) {
        object[key] = value;
    }
    return object;
}

function findErrorsAndWarningsForRow(studentData) {
    const errors = [];
    const warnings = [];
    for(const key in studentData) {
        const value = studentData[key];
        if(value.error) {
            errors.push({
                cellId: value.id,
                error: value.error,
            });
        }
        if(value.warning) {
            warnings.push({
                cellId: value.id,
                warning: value.warning,
            });
        }
    }
    return {errors, warnings};
}

function assignUniqueIdsForCells(row) {
    const assigned = {};
    for(const key in row) {
        const value = row[key];
        assigned[key] = {
            ...value,
            id: nanoid(),
        }
    }
    return assigned;
}

function parseStudentCSVRow(studentData, currentStudents, runningList) {
    const normalizedStudentData = fromEntries(Object.entries(studentData).map(csvDataHelper.normalizeFieldNames));
    const [required, optional] = [
        parseRequiredStudentData(normalizedStudentData, currentStudents, runningList),
        parseExtraStudentData(normalizedStudentData, currentStudents)
    ];
    const studentDataRow = assignUniqueIdsForCells({...required, ...optional});
    const {errors, warnings} = findErrorsAndWarningsForRow(studentDataRow);
    let mismatchedCellWarnings = [];
    if(studentDataRow.currentStudent) {
        mismatchedCellWarnings = getMismatchedFieldWarnings(studentDataRow, findExistingStudentWithId(studentDataRow, currentStudents));
    }
    return {
        ...studentDataRow,
        id: nanoid(),
        errors,
        warnings: [...warnings, ...mismatchedCellWarnings],
    }
}

function checkStudentRow(studentData, currentStudents, runningList) {
    const data = fromEntries(Object.entries(studentData));
    const [required, optional] = [
        recheckRequiredStudentData(data, currentStudents, runningList),
        recheckExtraStudentData(data, currentStudents)
    ];
    const studentDataRow = {...required, ...optional};
    const { errors, warnings } = findErrorsAndWarningsForRow(studentDataRow);
    let mismatchedCellWarnings = [];
    if(studentDataRow.currentStudent) {
        mismatchedCellWarnings = getMismatchedFieldWarnings(studentDataRow, findExistingStudentWithId(studentDataRow, currentStudents));
    }
    return {
        ...required,
        ...optional,
        id: studentData.id,
        errors,
        warnings: [...warnings, ...mismatchedCellWarnings],
    }
}

/**
 * Take data returned from a parsed CSV file and return a list of student data
 * @param {Array<Object>} data the data from a parsed CSV file 
 * @param {Array<Student>} currentStudents the current students to check changes against
 */
async function translateImportStudentCSV(data, currentStudents = []) {
    let students = [];
    for(const studentData of data) {
        students.push(parseStudentCSVRow(studentData, currentStudents, students));
    }
    const warnings = students.reduce((warningList, row) => [...warningList, ...row.warnings], []);
    const errors = students.reduce((errorList, row) => [...errorList, ...row.errors], []);
    return {
        students,
        warnings,
        errors,
    };
}


/**
 * Recheck the import that has already been processed by translateImportStudentCSV
 * @param {Array<Object>} data the data that has already been processed translateImportStudentCSV 
 * @param {Array<Student>} currentStudents the current students to check changes against
 */
async function recheckImport(data, currentStudents = []) {
    let students = [];
    for(const studentData of data) {
        students.push(checkStudentRow(studentData, currentStudents, students));
    }
    const warnings = students.reduce((warningList, row) => [...warningList, ...row.warnings], []);
    const errors = students.reduce((errorList, row) => [...errorList, ...row.errors], []);
    return {
        students,
        warnings,
        errors,
    };
}

// Ugly hack to allow this to be tested
if(process.env.NODE_ENV === 'test') {
    module.exports = {
        translateImportStudentCSV,
        recheckImport
    };
}
export {
    translateImportStudentCSV, 
    recheckImport
};