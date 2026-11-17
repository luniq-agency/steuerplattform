import JSZip from 'jszip';

function speichern(blob: Blob, dateiname: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dateiname;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function dateienHerunterladen(
  dateien: { name: string; url: string }[],
  zipName = 'Dokumente.zip',
  onFortschritt?: (fertig: number, gesamt: number) => void
) {
  if (dateien.length === 1) {
    window.location.assign(dateien[0].url); // signierter Link mit Download-Header
    return;
  }

  const zip = new JSZip();
  const vergeben = new Map<string, number>();
  let fertig = 0;

  for (const d of dateien) {
    const res = await fetch(d.url);
    if (!res.ok) throw new Error(`„${d.name}“ konnte nicht geladen werden.`);

    // doppelte Namen: "Datei.pdf", "Datei (2).pdf", …
    const n = (vergeben.get(d.name) ?? 0) + 1;
    vergeben.set(d.name, n);
    const name = n === 1 ? d.name : d.name.replace(/(\.[^.]+)?$/, ` (${n})$1`);

    zip.file(name, await res.blob());
    onFortschritt?.(++fertig, dateien.length);
  }

  speichern(await zip.generateAsync({ type: 'blob' }), zipName);
}