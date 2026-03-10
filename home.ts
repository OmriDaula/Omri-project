function syncTable(): void {
    const tbody = document.getElementById('expensesTbody');
    const totalCount = document.getElementById('totalCount');
    const data = getExpenses();

    if (totalCount) totalCount.textContent = String(data.length);

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
    if (tbody) tbody.innerHTML = html;
}

function setMode(isEdit: boolean): void {
    const badge = document.getElementById('modeBadge');
    if (badge) badge.textContent = isEdit ? 'עדכון' : 'הוספה';
}

function resetForm(): void {
    (document.getElementById('expenseForm') as HTMLFormElement)?.reset();
    const expId = document.getElementById('expenseId') as HTMLInputElement;
    if (expId) expId.value = '';
    setMode(false);

    const dateInput = document.getElementById('date') as HTMLInputElement;
    if (dateInput) dateInput.value = todayISO();
}

function startEdit(id: string): void {
    const exp = getExpenses().find(e => e.id === id);
    if (!exp) return;

    (document.getElementById('expenseId') as HTMLInputElement).value = exp.id;
    (document.getElementById('category') as HTMLSelectElement).value = exp.category;
    (document.getElementById('amount') as HTMLInputElement).value = String(exp.amount);
    (document.getElementById('description') as HTMLInputElement).value = exp.description || '';
    (document.getElementById('date') as HTMLInputElement).value = exp.date;

    setMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDelete(id: string): void {
    const ok = deleteExpense(id);
    if (ok) syncTable();
}

function handleSubmit(event: Event): void {
    event.preventDefault();

    const id = (document.getElementById('expenseId') as HTMLInputElement).value.trim();
    const category = (document.getElementById('category') as HTMLSelectElement).value;
    const amount = (document.getElementById('amount') as HTMLInputElement).value;
    const description = (document.getElementById('description') as HTMLInputElement).value;
    const date = (document.getElementById('date') as HTMLInputElement).value;

    const validation = validateExpense({ category, description, amount, date });
    if (!validation.ok) {
        alert(validation.message);
        return;
    }

    const expenseObj: Expense = {
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

    const dateInput = document.getElementById('date') as HTMLInputElement;
    if (dateInput) {
        dateInput.max = todayISO();
        dateInput.value = todayISO();
    }

    document.getElementById('expenseForm')?.addEventListener('submit', handleSubmit);
    document.getElementById('resetBtn')?.addEventListener('click', resetForm);

    document.getElementById('expensesTbody')?.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('button');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (!action || !id) return;

        if (action === 'edit') startEdit(id);
        if (action === 'delete') handleDelete(id);
    });

    syncTable();
})();
