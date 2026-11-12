export async function inZwischenablage(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback (z. B. http oder ältere Browser)
    const feld = document.createElement('textarea');
    feld.value = text;
    feld.style.position = 'fixed';
    feld.style.opacity = '0';
    document.body.appendChild(feld);
    feld.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(feld);
    return ok;
  }
}
