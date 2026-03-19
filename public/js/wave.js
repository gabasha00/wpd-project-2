document.addEventListener('DOMContentLoaded', () => {
    const h1 = document.querySelector('h1.wavy');
    if (!h1) return;

    h1.innerHTML = h1.textContent
        .split('')
        .map((char, i) => {
            if (char === ' ') char = '&nbsp;'; //if function that makes sure to include the spaces between words
            return `<span style="animation-delay:${i * 0.1}s">${char}</span>`
        })
        .join('');
});