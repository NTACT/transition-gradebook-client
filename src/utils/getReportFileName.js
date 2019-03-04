
export default function getReportFileName(reportName, {startYear, startTerm, endYear, endTerm, student, filtered}) {
  try {
    const startTermLabel = (!startTerm || startYear.termType === 'annual')
      ? '' 
      : `-${startYear.termType[0].toUpperCase()}${startTerm.index + 1}`;

    const endTermLabel = (!endYear || !endTerm || endYear.termType === 'annual') 
      ? ''
      : `-${endYear.termType[0].toUpperCase()}${endTerm.index + 1}`;

    const endYearLabel = endYear
      ? `${endYear.id === startYear.id ? '-to' : '-to-' + endYear.yearRange}${endTermLabel}`
      : '';

    let fileName = `${reportName}-report${startYear ? '-'+startYear.yearRange : ''}${startTermLabel}${endYearLabel}`;

    if(student) fileName += `-${student.firstName}-${student.lastName}`;
    if(filtered) fileName += '-filtered';
    return fileName;
  } catch(error) {
    console.log(error);
    return reportName;
  }
}
