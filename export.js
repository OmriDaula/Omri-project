// export.js - גרסה סופית לפתרון בעיית הג'יבריש בעברית

function safeGetExpenses() {
  if (typeof getExpenses === 'function') return getExpenses();
  const key = (typeof LOCAL_STORAGE_KEY === 'string') ? LOCAL_STORAGE_KEY : 'expenses';
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function exportCSV() {
  const data = safeGetExpenses();
  if (!data.length) {
    alert("אין נתונים לייצוא");
    return;
  }

  const SEP = ','; // במק בדרך כלל פסיק עובד הכי טוב

  const esc = (v) => {
    const s = String(v ?? '');
    return `"${s.replace(/"/g, '""')}"`;
  };

  const lines = [];
  lines.push(['id', 'date', 'category', 'description', 'amount'].join(SEP));

  for (const e of data) {
    lines.push([
      esc(e.id),
      esc(e.date),
      esc(e.category),
      esc(e.description || ''),
      esc(e.amount)
    ].join(SEP));
  }

  // BOM עוזר גם במק בחלק מהמקרים (לא מזיק)
  const csvText = '\uFEFF' + lines.join('\n');

  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'expenses.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}


function exportPDF() {
  const data = safeGetExpenses();
  if (data.length === 0) {
    alert("אין נתונים לייצוא");
    return;
  }

  const escapeHtml = (s) =>
    String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const rowsHtml = data.map(e => `
    <tr>
      <td>${escapeHtml(e.date)}</td>
      <td>${escapeHtml(e.category)}</td>
      <td>${escapeHtml(e.description || '-')}</td>
      <td class="num">${escapeHtml(e.amount)} ₪</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>דוח הוצאות</title>
  <style>
    body { font-family: Arial, sans-serif; direction: rtl; margin: 24px; color:#111; }
    h1 { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: right; vertical-align: top; }
    th { background: #f3f4f6; }
    .num { direction: ltr; text-align: left; white-space: nowrap; }
  </style>
</head>
<body>
  <h1>דוח הוצאות</h1>
  <p>סה"כ רשומות: ${data.length}</p>
  <table>
    <thead>
      <tr>
        <th>תאריך</th>
        <th>קטגוריה</th>
        <th>תיאור</th>
        <th>סכום</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 1000);
  };
}


// פונקציית ייצוא ל-PDF (ללא אזכור שמות חיצוניים)
function exportPDF() {
  const data = safeGetExpenses();
  if (data.length === 0) {
    alert("אין נתונים לייצוא");
    return;
  }

  const rowsHtml = data.map(e => `
    <tr>
      <td>${e.date}</td>
      <td>${e.category}</td>
      <td>${e.description || '-'}</td>
      <td class="num">${e.amount} ₪</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>דוח הוצאות</title>
  <style>
    body { font-family: Arial, sans-serif; direction: rtl; margin: 24px; color:#111; }
    h1 { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
    th { background: #f3f4f6; }
    .num { direction: ltr; text-align: left; }
  </style>
</head>
<body>
  <h1>דוח הוצאות</h1>
  <p>סה"כ רשומות: ${data.length}</p>
  <table>
    <thead>
      <tr>
        <th>תאריך</th>
        <th>קטגוריה</th>
        <th>תיאור</th>
        <th>סכום</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  setTimeout(() => document.body.removeChild(iframe), 1000);
}