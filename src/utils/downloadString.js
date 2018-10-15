export default function downloadString(string, type, filename='download') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([string], {type}));
  a.download = filename;
  a.style.display = 'none';
  a.style.position = 'absolute';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}