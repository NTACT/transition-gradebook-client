jest.setTimeout(60000);
const {
  headlessTest,
  login,
  user,
  tapLink,
  tapComponent,
  waitForComponent,
  fillCheckbox,
  getInputValue,
  faker,
  dateToInputFormat,
  selectByName,
  nameSelector,
  componentSelector,
  clearAndType,
  componentEl,
  enums,
  sample,
} = require('./testUtils');

describe('Students screen', () => {
  headlessTest('Should be able to view the students page', '/Students', async page => {
    await login(page, user);
    await tapLink(page, '#/Students');
    await waitForComponent(page, 'Students');
  });

  headlessTest('Should be able to open the new student form', async page => {
    await login(page, user);
    await tapLink(page, '#/Students');
    await waitForComponent(page, 'Students');
    await tapComponent(page, 'Students__AddStudentButton');
    await waitForComponent(page, 'EditStudentForm');
  });

  headlessTest('Should be able to create a new student', async page => {
    await login(page, user);
    await tapLink(page, '#/Students');
    await waitForComponent(page, 'Students');
    await tapComponent(page, 'Students__AddStudentButton');
    await waitForComponent(page, 'EditStudentForm');

    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const birthday = faker.date.past();
    const birthdayString = dateToInputFormat(birthday);

    await page.type('[name="firstName"]', firstName);
    await page.type('[name="lastName"]', lastName);
    await page.type('[name="studentId"]', faker.random.uuid());
    await page.type('[type="date"]', birthdayString); 
    await page.select('[name="gradeLevel"]', sample(enums.grades));
    await fillCheckbox(page, `[name="gender__${sample(enums.genders)}"]`);
    await fillCheckbox(page, `[name="ell__${sample(['yes', 'no'])}"]`);
    await tapComponent(page, 'EditStudentForm__SaveButton');
    await page.waitForSelector('.swal2-container', {timeout: 5000});
    console.log(`Created ${firstName} ${lastName}`);
  });

  headlessTest('Should be able to edit a student', async page => {
    await login(page, user);
    await tapLink(page, '#/Students');
    await waitForComponent(page, 'Students__StudentEditButton');
    await tapComponent(page, 'Students__StudentEditButton');
    await waitForComponent(page, 'EditStudentForm');

    const originalFirstName = await getInputValue(page, '[name="firstName"]');
    const originalLastName = await getInputValue(page, '[name="lastName"]');

    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();

    const firstNameInput = await page.$('[name="firstName"]');
    const lastNameInput = await page.$('[name="lastName"]');

    await firstNameInput.click({clickCount: 3});
    await firstNameInput.type(firstName);

    await lastNameInput.click({clickCount: 3});
    await lastNameInput.type(lastName);

    await page.select('[name="gradeLevel"]', sample(enums.grades));

    await tapComponent(page, 'EditStudentForm__SaveButton');
    await page.waitForSelector('.swal2-container', {timeout: 5000});
    console.log(`Edited ${originalFirstName} ${originalLastName}. Now: ${firstName} ${lastName}`);
  });

  headlessTest('Should be able to delete a student', async page => {
    await login(page, user);
    await tapLink(page, '#/Students');
    await waitForComponent(page, 'Students__StudentEditButton');
    await tapComponent(page, 'Students__StudentEditButton');
    await waitForComponent(page, 'EditStudentForm');

    const firstName = await getInputValue(page, '[name="firstName"]');
    const lastName = await getInputValue(page, '[name="lastName"]');

    await tapComponent(page, 'EditStudentForm__RemoveButton');
    await page.waitForSelector('.swal2-confirm', {timeout: 5000});
    await page.tap('.swal2-confirm');
    await page.waitForFunction(() => {
      const el = document.querySelector('.swal2-confirm');
      return el && el.innerText === 'OK';
    });

    console.log(`Deleted ${firstName} ${lastName}.`);
  });

  headlessTest(`Should be able to view a student's activities`, async page => {
    await login(page, user);
    await tapLink(page, '#/Students');
    await waitForComponent(page, 'StudentListItem__StudentText');
    await tapComponent(page, 'StudentListItem__StudentText');
    await waitForComponent(page, 'StudentActivityList');
  });

  headlessTest(`Should be able to view a student's risk factors and skills`, async page => {
    await login(page, user);
    await tapLink(page, '#/Students');
    await waitForComponent(page, 'StudentListItem__StudentText');
    await tapComponent(page, 'StudentListItem__StudentText');
    await waitForComponent(page, 'StudentInfoView__StudentTabs');

    await page.waitForSelector('[data-risk-tab]');
  });
});
