(() => {
  const button = document.querySelector("[data-share]");
  const status = document.querySelector("[data-share-status]");
  if (!button || !status) return;

  let statusTimeout;
  const setStatus = (message) => {
    window.clearTimeout(statusTimeout);
    status.textContent = message;
    statusTimeout = window.setTimeout(() => {
      status.textContent = "";
    }, 4200);
  };

  const copyLink = async (url) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return;
    }

    const input = document.createElement("textarea");
    input.value = url;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    if (!copied) throw new Error("Copy command unavailable");
  };

  button.addEventListener("click", async () => {
    const shareData = {
      title: button.dataset.shareTitle,
      text: button.dataset.shareText,
      url: window.location.href.split("#")[0],
    };

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        setStatus("Opciones para compartir abiertas.");
        return;
      }

      await copyLink(shareData.url);
      setStatus("Enlace copiado. Ya puedes enviarlo.");
    } catch (error) {
      if (error?.name === "AbortError") return;
      try {
        await copyLink(shareData.url);
        setStatus("Enlace copiado. Ya puedes enviarlo.");
      } catch {
        setStatus("No pudimos copiarlo automáticamente. Copia la dirección del navegador.");
      }
    }
  });
})();
