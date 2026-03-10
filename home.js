// home.js (לא Standalone) - משתמש ב-storage.js וב-utils.js

function syncTable() {
  const tbody = document.getElementById('expensesTbody');
  const totalCount = document.getElementById('totalCount');
  const data = getExpenses();

  totalCount.textContent = String(data.length);

  let html = '';
  for (const exp of data) {
    html += `
      <tr class="border-b last:border-b-0">
        <td class="py-2 px-2 whitespace-nowrap">${exp.date}</td>
        <td class="py-2 px-2">${exp.category}</td>
        <td class="py-2 px-2">${exp.description || ''}</td>
        <td class="py-2 px-2 whitespace-nowrap">${formatILS(exp.amount)}</td>
        <td class="py-2 px-2">
          <div class="flex gap-2">
            <button class="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300"
                    data-action="edit" data-id="${exp.id}">עדכון</button>
            <button class="px-3 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                    data-action="delete" data-id="${exp.id}">מחיקה</button>
          </div>
        </td>
      </tr>
    `;
  }
  tbody.innerHTML = html;
}

function setMode(isEdit) {
  document.getElementById('modeBadge').textContent = isEdit ? 'עדכון' : 'הוספה';
}

function resetForm() {
  document.getElementById('expenseForm').reset();
  document.getElementById('expenseId').value = '';
  setMode(false);

  const dateInput = document.getElementById('date');
  dateInput.value = todayISO();
}

function startEdit(id) {
  const exp = getExpenses().find(e => e.id === id);
  if (!exp) return;

  document.getElementById('expenseId').value = exp.id;
  document.getElementById('category').value = exp.category;
  document.getElementById('amount').value = String(exp.amount);
  document.getElementById('description').value = exp.description || '';
  document.getElementById('date').value = exp.date;

  setMode(true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDelete(id) {
  const ok = deleteExpense(id);
  if (ok) syncTable();
}

function handleSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('expenseId').value.trim();
  const category = document.getElementById('category').value;
  const amount = document.getElementById('amount').value;
  const description = document.getElementById('description').value;
  const date = document.getElementById('date').value;

  const validation = validateExpense({ category, description, amount, date });
  if (!validation.ok) {
    alert(validation.message);
    return;
  }

  const expenseObj = {
    id: id || makeId(),
    category,
    description: description.trim(),
    amount: Number(amount),
    date
  };

  if (id) {
    const ok = updateExpense(expenseObj);
    if (!ok) {
      alert('שגיאה: לא נמצאה הוצאה לעדכון');
      return;
    }
  } else {
    addExpense(expenseObj);
  }

  syncTable();
  resetForm();
}

(function initHome() {
  if (typeof renderMainNav === 'function') renderMainNav('home');

  const dateInput = document.getElementById('date');
  dateInput.max = todayISO();      // חוסם תאריך עתידי
  dateInput.value = todayISO();    // ברירת מחדל היום

  document.getElementById('expenseForm').addEventListener('submit', handleSubmit);
  document.getElementById('resetBtn').addEventListener('click', resetForm);

  document.getElementById('expensesTbody').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!action || !id) return;

    if (action === 'edit') startEdit(id);
    if (action === 'delete') handleDelete(id);
  });

  syncTable();
})();
