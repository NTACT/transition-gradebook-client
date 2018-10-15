export default function formatGrade(gradeType, grade) {
  if(gradeType == null || grade == null) return null;

  if(gradeType === 'letter') return grade;
  if(gradeType === 'percent') return Number.parseFloat(grade).toPrecision(3) + '%';
  return Number.parseFloat(grade).toPrecision(3);
}
