declare function renderMainNav(page: string): void;

(function initAbout() {
    if (typeof renderMainNav === 'function') renderMainNav('about');
})();
