function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isFutureDate(dateISO) {
  return dateISO > todayISO();
}

function isValidAmount(amount) {
  if (Number.isNaN(amount)) return false;
  if (amount <= 0) return false;
  if (amount > 100000) return false;
  return true;
}

function validateExpense({ category, description, amount, date }) {
  if (!category) return { ok: false, message: 'חובה לבחור קטגוריה' };
  if (!date) return { ok: false, message: 'חובה לבחור תאריך' };

  const numAmount = Number(amount);
  if (!isValidAmount(numAmount)) {
    return { ok: false, message: 'גובה ההוצאה חייב להיות חיובי ועד 100,000' };
  }

  if (isFutureDate(date)) {
    return { ok: false, message: 'תאריך ההוצאה לא יכול להיות עתידי' };
  }

  if (category === 'אחר' && (!description || !description.trim())) {
    return { ok: false, message: 'כשבוחרים "אחר" חובה למלא תיאור' };
  }

  return { ok: true };
}

function formatILS(amount) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
}

function makeId() {
  if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
