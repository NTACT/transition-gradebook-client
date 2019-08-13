import nanoid from 'nanoid';
import moment from 'moment';
import { csvDataHelper } from 'tgb-shared';

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
            return csvDataHelper.yesNoBooleanFromString(value);
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

function compareFields(existingStudentField, csvField, fieldName) {
    const column = csvDataHelper.columns.find(col => col.field === fieldName);
    if(column.type === csvDataHelper.types.boolean) {
        if(csvDataHelper.isValidBoolean(csvField)) {
            const booleanValue = csvDataHelper.yesNoBooleanFromString(csvField);
            return existingStudentField === booleanValue.getBooleanValue();
        }
    }

    if(column.type === csvDataHelper.types.date) {
        const existingAsDate = moment(existingStudentField);
        const providedAsDate = moment(csvField);
        return existingAsDate.year() === providedAsDate.year() 
            && existingAsDate.month() === providedAsDate.month() 
            && existingAsDate.date() === providedAsDate.date();
    }

    if(column.field === 'disabilities') {
        if(existingStudentField.length && notProvided(csvField)) {
            return false;
        }
        const existingArray = existingStudentField.map(({name, fullName}) => {
            return {
                name, 
                fullName
            }
        });
        const providedArray = csvField.split(' ');
        for(const provided of providedArray) {
            const found = existingArray.find(dis => dis.fullName === provided || dis.name === provided.toUpperCase());
            if(!found) {
                return false;
            }
        }
        // Passed the found check
        return true; 
    }

    if(column.type === csvDataHelper.types.enum) {
        if(typeof column.deserialize === 'function') {
            return column.deserialize(existingStudentField) === column.deserialize(csvField);
        }
    }
    return existingStudentField.toString().toLowerCase() === csvField.toString().toLowerCase();
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
        if(!notProvided(existingValue) && !compareFields(existingValue, studentData.value, key)) {
            let existingValueAsString = existingValue.toString();
            if(key === 'disabilities') {
                existingValueAsString = existingValue.map(val => val.name).join(' ');
            }
            mismatchedCells.push({
                cellId: studentData.id, 
                warning: `Student already exists and value will overwrite current records. Current: ${existingValueAsString}`
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

function checkDisabilities(provided, validDisabilities) {
    if(notProvided(provided)) {
        return true;
    }
    const disabilities = provided.split(' ');
    for(const disability of disabilities) {
        const matched = validDisabilities.find(dis => dis.fullName === disability || dis.name === disability.toUpperCase());
        if(!matched) {
            return false;
        }
    }

    return true;
}

/**
 * Parse the non-required fields of the imported student
 * @param {object} studentData 
 */
function parseExtraStudentData(studentData, validDisabilities) {
    const parsed = {};
    for(const optional of csvDataHelper.optionalFields) {
        const parsedField = csvDataHelper.findFieldByAlias(studentData, optional.validAlias);
        const warning = getWarningsForCell(optional, parsedField);
        let error = null;
        if(optional.field === 'disabilities') {
            // error if one of the values mismatches
            if(!checkDisabilities(parsedField, validDisabilities)) {
                error = 'One or more of the disabilities is an unexpected value';
            }
        }
        parsed[optional.field] = {
            value: warning ? parsedField : normalizeValue(optional, parsedField),
            warning,
            error,
        }
    }
    return {
        ...parsed,
    };
}
function recheckExtraStudentData(studentData, validDisabilities) {
    const parsed = {};
    const { warnings, ...restOfData} = studentData;
    for(const optional of csvDataHelper.optionalFields) {
        const fieldData = restOfData[optional.field];
        const { id, value, } = fieldData; 
        const checkedValue = value === '' ? null : value.toString(); 
        const newWarning = getWarningsForCell(optional, checkedValue);
        let error = null;
        if(optional.field === 'disabilities') {
            if(!checkDisabilities(checkedValue, validDisabilities)) {
                error = 'One or more of the disabilities is an unexpected value';
            }
        }
        parsed[optional.field] = {
            value: newWarning ? checkedValue : normalizeValue(optional, checkedValue),
            warning: newWarning,
            error,
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

function parseStudentCSVRow(studentData, currentStudents, runningList, validDisabilities) {
    const normalizedStudentData = fromEntries(Object.entries(studentData).map(csvDataHelper.normalizeFieldNames));
    const [required, optional] = [
        parseRequiredStudentData(normalizedStudentData, currentStudents, runningList),
        parseExtraStudentData(normalizedStudentData, validDisabilities)
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

function checkStudentRow(studentData, currentStudents, runningList, validDisabilities) {
    const data = fromEntries(Object.entries(studentData));
    const [required, optional] = [
        recheckRequiredStudentData(data, currentStudents, runningList),
        recheckExtraStudentData(data, validDisabilities)
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
async function translateImportStudentCSV(data, currentStudents = [], validDisabilities) {
    let students = [];
    for(const studentData of data) {
        students.push(parseStudentCSVRow(studentData, currentStudents, students, validDisabilities));
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
async function recheckImport(data, currentStudents = [], validDisabilities) {
    let students = [];
    for(const studentData of data) {
        students.push(checkStudentRow(studentData, currentStudents, students, validDisabilities));
    }
    const warnings = students.reduce((warningList, row) => [...warningList, ...row.warnings], []);
    const errors = students.reduce((errorList, row) => [...errorList, ...row.errors], []);
    return {
        students,
        warnings,
        errors,
    };
}

export {
    translateImportStudentCSV, 
    recheckImport
};