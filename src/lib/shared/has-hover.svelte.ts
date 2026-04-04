const mediaQuery = window.matchMedia('(hover: hover)');

export const hover = $state({ present: mediaQuery.matches });

mediaQuery.addEventListener('change', (e) => {
    hover.present = e.matches;
});