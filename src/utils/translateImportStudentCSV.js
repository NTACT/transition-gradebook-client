import nanoid from 'nanoid';
import moment from 'moment';
import { csvDataHelper } from 'tgb-shared';
import enums from '../enums';

/**
 * Attempt to get the value using the valid aliases for the fields
 * @param {object} studentData the parsed student object
 * @param {Array<string>} aliases a list of valid aliases
 */
function findFieldByAlias(studentData, aliases) {
    if (!studentData) {
        return undefined;
    }
    for (const alias of aliases) {
        const data = studentData[alias];
        if (data) {
            return data;
        }
    }
    return undefined;
}

function isRequiredAndMissing(field, uploadedValue) {
    return field.required && !uploadedValue
}

function isRequiredAndUnacceptedValue(field, uploadedValue) {
    if (!field.validValues || !field.required) {
        return false;
    }
    if (typeof uploadedValue === 'undefined') {
        return true;
    }
    return uploadedValue === null || !field.validValues.map(val => val.toLowerCase()).includes(uploadedValue.toString().toLowerCase());
}

function isOptionalAndUnacceptedValue(field, uploadedValue) {
    if (!field.validValues) {
        return false;
    }
    if (typeof uploadedValue === 'undefined' || uploadedValue === null) {
        return false;
    }
    if(field.type === csvDataHelper.types.integer || field.type === csvDataHelper.types.float) {
        return isNaN(+uploadedValue);
    }
    return !field.required && !field.validValues.map(val => val.toLowerCase()).includes(uploadedValue.toString().toLowerCase());
}

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
            if(typeof field.deserialize === 'function') {
                return field.deserialize(value);
            }
            return value;
        case types.boolean:
            return csvDataHelper.yesNoBooleanFromString(value);
        case types.date:
            return moment(value).format('MM/DD/YYYY');
        case types.integer:
        case types.float:
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

function compareFields(existingStudentField, csvField, column) {
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

function getErrorsForCell(field, data) {
    if(isRequiredAndMissing(field, data)) {
        return `Required data is missing`;
    }
    if(isRequiredAndUnacceptedValue(field, data)) {
        return `Required data is an unexpected value`;
    }
    return null;
}

function getWarningsForCell(field, data) {
    if(isOptionalAndUnacceptedValue(field, data)) {
        return `Data is an unexpected value.`;
    }
    return null;
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

function assignUniqueIdsForCellsAndRow(row) {
    const assigned = { id: nanoid() };
    for(const key in row) {
        const value = row[key];
        assigned[key] = {
            ...value,
            id: nanoid(),
        }
    }
    return assigned;
}

function existingStudent(translated, currentStudents) {
    return {
        ...translated,
        currentStudent: findExistingStudentWithId(translated, currentStudents) !== null,
    }
}

function translateRow(studentData) {
    const normalizedStudentData = fromEntries(Object.entries(studentData).map(csvDataHelper.normalizeFieldNames));
    const translated = {};
    for(const column of [...csvDataHelper.requiredFields, ...csvDataHelper.optionalFields]) {
        const translatedField = findFieldByAlias(normalizedStudentData, column.validAlias);
        translated[column.field] = {
            value: normalizeValue(column, translatedField),
            rawValue: translatedField,
        }
    }
    return assignUniqueIdsForCellsAndRow(translated);
}

function attachErrors(currentStudent, importingStudents, validDisabilities) {
    const studentWithErrors = { ...currentStudent };
    for(const required of csvDataHelper.requiredFields) {
        const importingValue = currentStudent[required.field].value;
        const requiredDataError = getErrorsForCell(required, importingValue);
        studentWithErrors[required.field].error = requiredDataError;
    }
    const { grade, gradeType, gradeLevel, exitCategory, postSchoolOutcome } = currentStudent;
    if(grade.value) {
        if(!gradeType.value) {
            studentWithErrors.grade.error = 'Grade type must be specified when a grade is specified';
        } else {
            if(gradeType.value === 'percent' || gradeType.value === 'gpa') {
                studentWithErrors.grade.error = isNaN(+grade.value) ? 'Grade is not a valid number' : studentWithErrors.grade.error;
            } else {
                studentWithErrors.grade.error = !enums.gradeLetters.find(letter => letter === grade.value.toUpperCase()) ? 'Grade is not a valid letter grade' : studentWithErrors.grade.error;
            }
        }
    }

    // DB schema requirement
    if(gradeLevel.value === 'Post-school') {
        if(!exitCategory.value) {
            studentWithErrors.exitCategory.error = 'Exit category is required when the grade level is Post-school';
        }
        if(!postSchoolOutcome.value) {
            studentWithErrors.postSchoolOutcome.error = 'Post-school outcome is required when the grade level is Post-school';
        }
    }

    if(currentStudent.disabilities.value !== '' && !checkDisabilities(currentStudent.disabilities.value, validDisabilities)) {
        const disabilitiesError = 'One or more of the disabilities is an unexpected value';;
        studentWithErrors.disabilities.error = disabilitiesError;
    }
    const duplicateCheck = findImportingStudentWithId(currentStudent, importingStudents);
    if(duplicateCheck && duplicateCheck.studentId.id !== currentStudent.studentId.id) {
        const { studentId, } = currentStudent;
        const duplicateError =  `Duplicate student ID (${studentId.value})`;
        studentWithErrors.studentId.error = duplicateError;
    }
    return studentWithErrors;
}

function attachWarnings(currentStudent, currentStudents) {
    const studentWithWarnings = {...currentStudent}
    for(const optional of csvDataHelper.optionalFields) {
        const warning = getWarningsForCell(optional, currentStudent[optional.field].rawValue);
        studentWithWarnings[optional.field].warning = warning;
    }
    const existingStudent = findExistingStudentWithId(currentStudent, currentStudents);
    if(existingStudent) {
        for(const column of csvDataHelper.columns) {
            if(studentWithWarnings[column.field].warning) {
                // Already has a warning. Skip this field, for now
                continue;
            }
            const existingValue = existingStudent[column.field];
            const importingValue = currentStudent[column.field].value;
            if(notProvided(importingValue) || importingValue === '' || notProvided(existingValue)) {
                // will be ignored by the server
                continue;
            }

            if(!compareFields(existingValue, importingValue, column)) {
                studentWithWarnings[column.field].warning = `Student already exists and value will overwrite current records.`;
            }
        }
    }
    return studentWithWarnings;
}

/**
 * Take data returned from a parsed CSV file and return a list of student data
 * @param {Array<Object>} data the data from a parsed CSV file 
 * @param {Array<Student>} currentStudents the current students to check changes against
 */
async function translateImportStudentCSV(data, currentStudents = [], validDisabilities) {
    const translatedData = data.map(student => translateRow(student))
        .map((student => existingStudent(student, currentStudents)));
    const translatedWithErrors = translatedData.map(translated => attachErrors(translated, translatedData, validDisabilities));
    const translatedWithErrorsAndWarnings = translatedWithErrors.map(translated => attachWarnings(translated, currentStudents));

    const students = translatedWithErrorsAndWarnings.map(translated => {
        const { errors, warnings } = findErrorsAndWarningsForRow(translated);
        return {
            ...translated, 
            errors,
            warnings,
        }
    });

    const warnings = students.reduce((warningList, currentRow) => [...warningList, ...currentRow.warnings], []);
    const errors = students.reduce((errorList, currentRow) => [...errorList, ...currentRow.errors], []);
    return {
        students,
        errors,
        warnings,
    }
}

function resetErrorsAndWarnings(student) {
    const clearedStudent = {};
    for(const column of csvDataHelper.columns) {
        const { error, warning, ...rest} = student[column.field];
        clearedStudent[column.field] = {
            ...rest
        }
    }
    return clearedStudent;
}
/**
 * Recheck the import that has already been processed by translateImportStudentCSV
 * @param {Array<Object>} data the data that has already been processed translateImportStudentCSV 
 * @param {Array<Student>} currentStudents the current students to check changes against
 */
async function recheckImport(data, currentStudents = [], validDisabilities) {
    const removedErrorsAndWarnings = data.map(student => existingStudent({
            ...resetErrorsAndWarnings(student),
            id: student.id,
        }, currentStudents)
    );
    const recheckedWithErrors = removedErrorsAndWarnings.map(checked => attachErrors(checked, data, validDisabilities));
    const recheckedWithErrorsAndWarnings = recheckedWithErrors.map(checked => attachWarnings(checked, currentStudents));

    const students = recheckedWithErrorsAndWarnings.map(translated => {
        const { errors, warnings } = findErrorsAndWarningsForRow(translated);
        return {
            ...translated, 
            errors,
            warnings,
        }
    });

    const warnings = students.reduce((warningList, currentRow) => [...warningList, ...currentRow.warnings], []);
    const errors = students.reduce((errorList, currentRow) => [...errorList, ...currentRow.errors], []);
    return {
        students,
        errors,
        warnings,
    }
}

function getDownloadTemplateUrl() {
    const headers = encodeURIComponent(csvDataHelper.columns.map(column => column.headerText).join(','));
    return `data:text/csv;charset=utf-8,${headers}`;
}

export {
    translateImportStudentCSV, 
    recheckImport,
    getDownloadTemplateUrl,
};