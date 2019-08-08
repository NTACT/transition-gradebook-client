const nanoid = require('nanoid');
const { csvDataHelper } = require('tgb-shared');

/**
 * Get the value for required student data
 * @param {object} studentData 
 */
async function parseRequiredStudentData(studentData) {
    const parsed = {};
    const errors = [];
    for(const required of csvDataHelper.requiredFields) {
        const parsedField = csvDataHelper.findFieldByAlias(studentData, required.validAlias);
        const id = nanoid();
        const error = csvDataHelper.isError(required, parsedField);
        parsed[required.field] = {
            value: parsedField,
            error,
            id,
        }
        if(error) {
            errors.push(id);
        }
    }
    return {
        ...parsed,
        errors,
    };
}

async function recheckRequiredStudentData(studentData) {
    const parsed = {};
    const newErrors = [];
    for(const required of csvDataHelper.requiredFields) {
        const fieldData = studentData[required.field];
        const { id, value, } = fieldData; 
        const newError = csvDataHelper.isError(required, value || null);
        parsed[required.field] = {
            value: value || null,
            error: newError,
            id,
        }
        if(newError) {
            newErrors.push(id);
        }
    }
    return {
        ...parsed,
        errors: newErrors,
    };
}

/**
 * Parse the non-required fields of the imported student
 * @param {object} studentData 
 */
async function parseExtraStudentData(studentData) {
    const parsed = {};
    const warnings = [];
    for(const optional of csvDataHelper.optionalFields) {
        const parsedField = csvDataHelper.findFieldByAlias(studentData, optional.validAlias);
        const id = nanoid();
        const warning = csvDataHelper.isWarning(optional, parsedField);
        parsed[optional.field] = {
            value: parsedField,
            warning,
            id,
        }
        if(warning) {
            warnings.push(id);
        }
    }
    return {
        ...parsed,
        warnings,
    };
}

async function recheckExtraStudentData(studentData) {
    const parsed = {};
    const newWarnings = [];
    const { warnings, ...restOfData} = studentData;
    for(const optional of csvDataHelper.optionalFields) {
        const fieldData = restOfData[optional.field];
        const { id, value, } = fieldData; 
        const newWarning = csvDataHelper.isWarning(optional, value || null);
        parsed[optional.field] = {
            value: value || null,
            warning: newWarning,
            id,
        }
        if(newWarning) {
            newWarnings.push(id);
        }
    }
    return {
        ...parsed,
        warnings: newWarnings,
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

async function parseStudentCSVRow(studentData) {
    const normalizedStudentData = fromEntries(Object.entries(studentData).map(csvDataHelper.normalizeFieldNames));
    const [required, optional] = await Promise.all([
        parseRequiredStudentData(normalizedStudentData),
        parseExtraStudentData(normalizedStudentData)
    ]);
    const { errors, ...restOfRequired} = required;
    const { warnings, ...restOfOptional} = optional;
    return {
        ...restOfRequired,
        ...restOfOptional,
        id: nanoid(),
        errors,
        warnings,
    }
}
function filterOldWarningsAndErrors(studentData) {
    const { errors, warnings, ...rest} = studentData;
    return {
        ...rest
    }
}
async function checkStudentRow(studentData) {
    // Object spread causes name clashes, so this is done out of scope of this function
    const { id, ...restOfData} = filterOldWarningsAndErrors(studentData);
    const data = fromEntries(Object.entries(restOfData));
    const [required, optional] = await Promise.all([
        recheckRequiredStudentData(data),
        recheckExtraStudentData(data)
    ]);
    const { errors, ...restOfRequired} = required;
    const { warnings, ...restOfOptional} = optional;
    return {
        ...restOfRequired,
        ...restOfOptional,
        id,
        errors,
        warnings,
    }
}

/**
 * Take data returned from a parsed CSV file and return a list of student data
 * @param {Array<Object>} data the data from a parsed CSV file 
 */
async function translateImportStudentCSV(data) {
    const students =  await Promise.all(data.map(studentData => parseStudentCSVRow(studentData)));
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
 */
async function recheckImport(data) {
    const students =  await Promise.all(data.map(studentData => checkStudentRow(studentData)));
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