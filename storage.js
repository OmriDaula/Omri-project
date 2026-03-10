// storage.js
// אחראי רק על עבודה מול LocalStorage (CRUD)

const LOCAL_STORAGE_KEY = 'expenses';

function getExpenses() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveExpenses(data) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

function addExpense(expense) {
  const data = getExpenses();
  data.push(expense);
  saveExpenses(data);
}

function updateExpense(updated) {
  const data = getExpenses();
  const idx = data.findIndex(e => e.id === updated.id);
  if (idx === -1) return false;

  data[idx] = updated;
  saveExpenses(data);
  return true;
}

function deleteExpense(id) {
  if (!confirm('בטוח למחוק את ההוצאה?')) return false;

  const data = getExpenses();
  const idx = data.findIndex(e => e.id === id);
  if (idx === -1) return false;

  data.splice(idx, 1);
  saveExpenses(data);
  return true;
}
