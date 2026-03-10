// @ts-ignore
const FILTERS_STORAGE_KEY = (typeof LOCAL_STORAGE_KEY === 'string') ? LOCAL_STORAGE_KEY : 'expenses';

function safeGetExpensesFilters(): Expense[] {
    if (typeof getExpenses === 'function') return getExpenses(); // אם storage.js נטען
    try {
        return JSON.parse(localStorage.getItem(FILTERS_STORAGE_KEY) || '[]') as Expense[];
    } catch {
        return [];
    }
}

function uniqueYears(expenses: Expense[]): string[] {
    const set = new Set<string>();
    for (const e of expenses) {
        if (e?.date && e.date.length >= 4) set.add(e.date.slice(0, 4));
    }
    return Array.from(set).sort();
}

function fillYearSelect(): void {
    const select = document.getElementById('yearSelect') as HTMLSelectElement | null;
    if (!select) return;
    const years = uniqueYears(safeGetExpensesFilters());

    let html = '<option value="">ללא</option>';
    for (const y of years) html += `<option value="${y}">${y}</option>`;
    select.innerHTML = html;
}

function filterExpenses(): Expense[] {
    const expenses = safeGetExpensesFilters();

    const year = (document.getElementById('yearSelect') as HTMLSelectElement)?.value;
    const yearMonth = (document.getElementById('yearMonthInput') as HTMLInputElement)?.value;
    const date = (document.getElementById('dateInput') as HTMLInputElement)?.value;
    const maxAmountRaw = (document.getElementById('maxAmountInput') as HTMLInputElement)?.value;

    let result = expenses;

    if (date) result = result.filter(e => e.date === date);
    else if (yearMonth) result = result.filter(e => e.date.slice(0, 7) === yearMonth);
    else if (year) result = result.filter(e => e.date.slice(0, 4) === year);

    if (maxAmountRaw !== '') {
        const maxAmount = Number(maxAmountRaw);
        if (!Number.isNaN(maxAmount)) result = result.filter(e => e.amount <= maxAmount);
    }

    return result;
}

function renderFilteredTable(): void {
    const data = filterExpenses();
    const countSpan = document.getElementById('filteredCount');
    if (countSpan) countSpan.textContent = String(data.length);

    const tbody = document.getElementById('filteredTbody');
    if (!tbody) return;
    let html = '';

    const format = (typeof formatILS === 'function') ? formatILS : (n: number) => String(n);

    for (const exp of data) {
        html += `
      <tr class="border-b last:border-b-0">
        <td class="py-2 px-2 whitespace-nowrap">${exp.date}</td>
        <td class="py-2 px-2">${exp.category}</td>
        <td class="py-2 px-2">${exp.description || ''}</td>
        <td class="py-2 px-2 whitespace-nowrap">${format(exp.amount)}</td>
      </tr>
    `;
    }

    tbody.innerHTML = html;
}

function applyFilters(): void {
    renderFilteredTable();
}

function clearFilters(): void {
    const els = ['yearSelect', 'yearMonthInput', 'dateInput', 'maxAmountInput'];
    els.forEach(id => {
        const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
        if (el) el.value = '';
    });
    applyFilters();
}

(function initFilters() {
    if (typeof renderMainNav === 'function') renderMainNav('filters');

    console.log('getExpenses:', typeof getExpenses);
    console.log('safeGetExpensesFilters length:', safeGetExpensesFilters().length);

    fillYearSelect();
    renderFilteredTable();

    document.getElementById('yearSelect')?.addEventListener('change', applyFilters);
    document.getElementById('yearMonthInput')?.addEventListener('change', applyFilters);
    document.getElementById('dateInput')?.addEventListener('change', applyFilters);
    document.getElementById('maxAmountInput')?.addEventListener('input', applyFilters);
    document.getElementById('clearFiltersBtn')?.addEventListener('click', clearFilters);
})();
