function renderMainNav(activePage) {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  const links = [
    { href: './index.html', label: 'בית', key: 'home' },
    { href: './filters.html', label: 'פילטרים', key: 'filters' },
    { href: './reports.html', label: 'דוחות', key: 'reports' },
    { href: './about.html', label: 'אודות', key: 'about' }
  ];

  nav.className = 'navbar';

  nav.innerHTML = links.map(l => {
    const isActive = l.key === activePage;
    return `<a class="nav-link ${isActive ? 'active' : ''}" href="${l.href}">${l.label}</a>`;
  }).join('');
}
