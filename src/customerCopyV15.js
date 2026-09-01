const CUSTOMER_COPY = [
  ["#productos .catalog-entry-heading h2", "Compara 12 sistemas según tu luz, privacidad y tipo de ventana."],
  ["#papel-tapiz .wallpaper-heading h2", "Dale carácter a tus paredes."],
];

function applyCustomerCopy() {
  for (const [selector, copy] of CUSTOMER_COPY) {
    const node = document.querySelector(selector);
    if (node && node.textContent !== copy) node.textContent = copy;
  }
}

export function initCustomerCopyV15() {
  applyCustomerCopy();
  const root = document.getElementById("root");
  if (!root || typeof MutationObserver !== "function") return;
  const observer = new MutationObserver(() => applyCustomerCopy());
  observer.observe(root, { childList: true, subtree: true });
}
