const { translateImportStudentCSV, recheckImport } = require('../src/utils/translateImportStudentCSV');
const { csvDataHelper } = require('tgb-shared');
const moment = require('moment');

// Minimum amount of data required for the import to succeed
const validStudentCSV = {
    'Id Number': 'test-123',
    'First Name': 'Test',
    'Last Name': 'User',
    'Gender': 'Male',
    'Is Student ELL?': 'No',
    'Date of Birth': moment(new Date()).format('MM/DD/YYYY'),
    'Disabilities': 'AU ID',
    'Race': 'WH7',
}

const invalidBasicData = {
    ...validStudentCSV,
    gender: '404',
}

const studentWithAdditionalData = {
    ...validStudentCSV,
    'Retained one or more years?': 'Yes',
    '# of schools enrolled in through present': '3',
}

const studentWithAdditionalDataAndInvalid = {
    ...validStudentCSV,
    'Retained one or more years?': 'nope',
}

const testDisabilities = [{ name: 'AU', fullName: 'Autism'}, { name: 'ID', fullName: 'Intellectual Disability'}];

const testExistingStudent = {
    studentId: 'test-123',
    firstName: 'Existing',
    lastName: 'User',
    gender: 'Male',
    ell: true,
    birthday: moment(new Date()).subtract(1, 'year').format('MM/DD/YYYY'),
    race: 'WH7',
}

describe('translateStudentImportCSV tests', () => {
    test('translateImportStudentCSV, all basic data', async ()=> {
        const result = await translateImportStudentCSV([validStudentCSV], [], testDisabilities);
        const { students, errors, warnings} = result;
        expect(errors.length).toEqual(0);
        expect(warnings.length).toEqual(0);
        const student = students[0];
        expect(student.studentId.value).toEqual(validStudentCSV['Id Number']);
        expect(student.firstName.value).toEqual(validStudentCSV['First Name']);
        expect(student.lastName.value).toEqual(validStudentCSV['Last Name']);
        expect(student.gender.value).toEqual(validStudentCSV['Gender']);
        expect(student.ell.value.toString()).toEqual(validStudentCSV['Is Student ELL?']);
        expect(student.birthday.value).toEqual(validStudentCSV['Date of Birth']);
        expect(student.disabilities.value).toEqual(validStudentCSV['Disabilities']);
        expect(student.race.value).toEqual(validStudentCSV['Race']);
    });

    test('translateImportStudentCSV, finds error in required data', async () => {
        const result = await translateImportStudentCSV([invalidBasicData], [], testDisabilities);
        const { errors, warnings} = result;
        expect(errors.length).toEqual(1);
        expect(warnings.length).toEqual(0);
    });

    test('translateImportStudentCSV, all basic data plus optional', async ()=> {
        const result = await translateImportStudentCSV([studentWithAdditionalData], [], testDisabilities);
        const { students, errors, warnings} = result;
        expect(errors.length).toEqual(0);
        expect(warnings.length).toEqual(0);
        const student = students[0];
        expect(student.studentId.value).toEqual(studentWithAdditionalData['Id Number']);
        expect(student.firstName.value).toEqual(studentWithAdditionalData['First Name']);
        expect(student.lastName.value).toEqual(studentWithAdditionalData['Last Name']);
        expect(student.gender.value).toEqual(studentWithAdditionalData['Gender']);
        expect(student.ell.value.toString()).toEqual(studentWithAdditionalData['Is Student ELL?']);
        expect(student.birthday.value).toEqual(studentWithAdditionalData['Date of Birth']);
        expect(student.disabilities.value).toEqual(studentWithAdditionalData['Disabilities']);
        expect(student.race.value).toEqual(studentWithAdditionalData['Race']);
        expect(student.retained.value.toString()).toEqual(studentWithAdditionalData['Retained one or more years?']);
        expect(student.schoolsAttended.value).toEqual(studentWithAdditionalData['# of schools enrolled in through present']);
    });

    test('translateImportStudentCSV, all basic data plus optional invalid', async ()=> {
        const result = await translateImportStudentCSV([studentWithAdditionalDataAndInvalid], [], testDisabilities);
        const { students, errors, warnings} = result;
        expect(errors.length).toEqual(0);
        expect(warnings.length).toEqual(1);
    });

    test('translateImportStudentCSV, duped importing studentId', async () => {
        const result = await translateImportStudentCSV([validStudentCSV, validStudentCSV], [], testDisabilities);
        const { students, errors, warnings} = result;
        expect(errors.length).toEqual(1);
        expect(warnings.length).toEqual(0);
    });

    test('translateImportStudentCSV, warns importing studentId that exists', async () => {
        const result = await translateImportStudentCSV([validStudentCSV], [testExistingStudent], testDisabilities);
        const { students, errors, warnings} = result;
        expect(errors.length).toEqual(0);
        // first name, ell, and birthday
        expect(warnings.length).toEqual(3);
        const student = students[0];
        expect(student.currentStudent).toEqual(true);
        expect(student.firstName.warning).toBeDefined();
        expect(student.ell.warning).toBeDefined();
        expect(student.birthday.warning).toBeDefined();
    });

    test('recheckImport, basic data', async () => {
        const oldValues = await translateImportStudentCSV([validStudentCSV], [], testDisabilities);
        const changedStudent = oldValues.students[0];
        changedStudent.firstName.value = 'Changed';
        const result = await recheckImport([changedStudent], [], testDisabilities);
        const { students, errors, warnings} = result;
        expect(errors.length).toEqual(0);
        expect(warnings.length).toEqual(0);
        const student = students[0];
        expect(student.studentId.value).toEqual(validStudentCSV['Id Number']);
        expect(student.firstName.value).toEqual('Changed');
        expect(student.lastName.value).toEqual(validStudentCSV['Last Name']);
        expect(student.gender.value).toEqual(validStudentCSV['Gender']);
        expect(student.ell.value.toString()).toEqual(validStudentCSV['Is Student ELL?']);
        expect(student.birthday.value).toEqual(validStudentCSV['Date of Birth']);
        expect(student.disabilities.value).toEqual(validStudentCSV['Disabilities']);
        expect(student.race.value).toEqual(validStudentCSV['Race']);
    });

    test('recheckImport, finds error in required data', async () => {
        const oldValues = await translateImportStudentCSV([validStudentCSV], [], testDisabilities);
        const changedStudent = oldValues.students[0];
        changedStudent.gender.value = '404';
        const result = await recheckImport([changedStudent], [], testDisabilities);
        const { errors, warnings} = result;
        expect(errors.length).toEqual(1);
        expect(warnings.length).toEqual(0);
    });
});