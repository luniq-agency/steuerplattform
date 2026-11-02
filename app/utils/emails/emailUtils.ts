export function wrapEmailTemplate(bodyHtml: string): string {
  return `
<div style="background-color: #f6f6f4; padding: 40px 20px; font-family: Arial, Helvetica, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto;">
    <img
      src="https://advact.de/advact-logo-black.png"
      alt="ADVACT"
      style="height: 48px; margin-bottom: 24px;"
    />
    <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; color: #333333; font-size: 15px; line-height: 1.6;">
      ${bodyHtml}
    </div>
    <div style="text-align: center; color: #9aa5b1; font-size: 13px; margin-top: 24px;">
      <strong>ADVACT</strong> | Klaus-Groth-Straße 9 | 30655 Hannover<br />
      Tel: 0178 - 8590234 | E-Mail: info@advact.de
    </div>
  </div>
</div>`;
}
