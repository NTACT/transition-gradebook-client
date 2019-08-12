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
        return;
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

function getMismatchedFields(parsedStudent, existingStudent) {
    const mismatchedCells = [];
    const importEntries = Object.entries(parsedStudent);
    for(const [key, values] of importEntries) {
        const existingValue = existingStudent[key];
        if(!notProvided(values.value) && !notProvided(existingValue) && existingValue !== values.value) {
            mismatchedCells.push(values.id);
        }
    }
    return mismatchedCells;
}

/**
 * Get the value for required student data
 * @param {object} studentData 
 */
async function parseRequiredStudentData(studentData, currentStudents) {
    const parsed = {};
    for(const required of csvDataHelper.requiredFields) {
        const parsedField = csvDataHelper.findFieldByAlias(studentData, required.validAlias);
        const error = csvDataHelper.isError(required, parsedField);
        parsed[required.field] = {
            value: error ? parsedField : normalizeValue(required, parsedField),
            error,
        }
    }
    if(findExistingStudentWithId(parsed, currentStudents) !== null) {
        parsed.currentStudent = true;
    }
    return {
        ...parsed,
    };
}

async function recheckRequiredStudentData(studentData, currentStudents) {
    const parsed = {};
    for(const required of csvDataHelper.requiredFields) {
        const fieldData = studentData[required.field];
        const { id, value } = fieldData; 
        const newError = csvDataHelper.isError(required, value);
        parsed[required.field] = {
            value: newError || null ? value : normalizeValue(required, value),
            error: newError,
            id,
        }
    }

    if(findExistingStudentWithId(parsed, currentStudents) !== null) {
        parsed.currentStudent = true;
    }
    return {
        ...parsed,
    };
}

/**
 * Parse the non-required fields of the imported student
 * @param {object} studentData 
 */
async function parseExtraStudentData(studentData) {
    const parsed = {};
    for(const optional of csvDataHelper.optionalFields) {
        const parsedField = csvDataHelper.findFieldByAlias(studentData, optional.validAlias);
        const warning = csvDataHelper.isWarning(optional, parsedField);
        const isTypeWarning = warning && csvDataHelper.isOptionalAndUnacceptedValue(optional, parsedField);
        parsed[optional.field] = {
            value: isTypeWarning ? parsedField : normalizeValue(optional, parsedField),
            warning,
        }
    }
    return {
        ...parsed,
    };
}

async function recheckExtraStudentData(studentData) {
    const parsed = {};
    const { warnings, ...restOfData} = studentData;
    for(const optional of csvDataHelper.optionalFields) {
        const fieldData = restOfData[optional.field];
        const { id, value, } = fieldData; 
        const checkedValue = value === '' ? null : value.toString(); 
        const newWarning = csvDataHelper.isWarning(optional, checkedValue);
        const isTypeWarning = newWarning && csvDataHelper.isOptionalAndUnacceptedValue(optional, checkedValue);
        parsed[optional.field] = {
            value: isTypeWarning ? checkedValue : normalizeValue(optional, checkedValue),
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
            errors.push(value.id);
        }
        if(value.warning) {
            warnings.push(value.id);
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

async function parseStudentCSVRow(studentData, currentStudents) {
    const normalizedStudentData = fromEntries(Object.entries(studentData).map(csvDataHelper.normalizeFieldNames));
    const [required, optional] = await Promise.all([
        parseRequiredStudentData(normalizedStudentData, currentStudents),
        parseExtraStudentData(normalizedStudentData, currentStudents)
    ]);
    const studentDataRow = assignUniqueIdsForCells({...required, ...optional});
    const {errors, warnings} = findErrorsAndWarningsForRow(studentDataRow);
    let mismatchedCells = [];
    if(studentDataRow.currentStudent) {
        mismatchedCells = getMismatchedFields(studentDataRow, findExistingStudentWithId(studentDataRow, currentStudents));
    }
    return {
        ...studentDataRow,
        id: nanoid(),
        errors,
        warnings: warnings.concat(mismatchedCells),
    }
}

async function checkStudentRow(studentData, currentStudents) {
    console.log(currentStudents);
    const data = fromEntries(Object.entries(studentData));
    const [required, optional] = await Promise.all([
        recheckRequiredStudentData(data, currentStudents),
        recheckExtraStudentData(data, currentStudents)
    ]);
    const studentDataRow = {...required, ...optional};
    const { errors, warnings } = findErrorsAndWarningsForRow(studentDataRow);
    let mismatchedCells = [];
    if(studentDataRow.currentStudent) {
        mismatchedCells = getMismatchedFields(studentDataRow, findExistingStudentWithId(studentDataRow, currentStudents));
    }
    return {
        ...required,
        ...optional,
        id: studentData.id,
        errors,
        warnings: warnings.concat(mismatchedCells),
    }
}

/**
 * Take data returned from a parsed CSV file and return a list of student data
 * @param {Array<Object>} data the data from a parsed CSV file 
 * @param {Array<Student>} currentStudents the current students to check changes against
 */
async function translateImportStudentCSV(data, currentStudents) {
    const students =  await Promise.all(data.map(studentData => parseStudentCSVRow(studentData, currentStudents)));
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
    const students =  await Promise.all(data.map(studentData => checkStudentRow(studentData, currentStudents)));
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