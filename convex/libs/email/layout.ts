// Keep email markup independent of React, CSS tooling, and external assets.
// These colors inherit the public landing's field-journal identity.
const paper = '#f7f1e5'
const ink = '#263f30'
const copy = '#4e5547'
const rule = '#c8caba'
const sans = 'Arial, Helvetica, sans-serif'
const serif = 'Georgia, Times New Roman, serif'

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[character]!,
  )

export const paragraph = (text: string) =>
  `<p style="margin:0 0 20px;font-family:${sans};font-size:16px;line-height:26px;color:${copy};">${escapeHtml(text)}</p>`

export const detailList = (items: Array<string>) =>
  items.length
    ? `<ul style="margin:0 0 24px;padding-left:22px;font-family:${sans};font-size:16px;line-height:26px;color:${ink};">${items.map((item) => `<li style="padding:0 0 8px;">${escapeHtml(item)}</li>`).join('')}</ul>`
    : ''

export const renderEmailLayout = (input: {
  preheader: string
  heading: string
  body: string
  action?: { label: string; url: string }
  note?: string
}) => {
  const action = input.action
  const actionHtml = action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr><td bgcolor="${ink}" style="border-radius:4px;text-align:center;mso-padding-alt:16px 24px;">
<a href="${escapeHtml(action.url)}" style="display:inline-block;background-color:${ink};border:1px solid ${ink};border-radius:4px;padding:16px 24px;font-family:${sans};font-size:16px;font-weight:bold;line-height:22px;text-decoration:none;color:${paper};mso-padding-alt:0;">${escapeHtml(action.label)}</a>
</td></tr></table>`
    : ''
  const fallback = action
    ? `<p style="margin:24px 0 0;font-family:${sans};font-size:12px;line-height:19px;color:${copy};">If the button does not work, copy this link into your browser:<br><a href="${escapeHtml(action.url)}" style="color:${ink};text-decoration:underline;overflow-wrap:anywhere;word-break:break-all;">${escapeHtml(action.url)}</a></p>`
    : ''

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(input.heading)}</title>
<style>
body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
a:focus-visible { outline:2px solid #aa563e; outline-offset:4px; }
@media only screen and (max-width:480px) {
  .email-content { padding:28px 24px !important; }
  .email-heading { font-size:32px !important; line-height:38px !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:${paper};color:${ink};">
<div aria-hidden="true" style="display:none;font-size:1px;line-height:1px;color:${paper};max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(input.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${paper}"><tr><td align="center">
<!--[if mso]><table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;table-layout:fixed;"><tr><td class="email-content" style="padding:40px 40px 32px;overflow-wrap:anywhere;word-wrap:break-word;">
<p style="margin:0 0 32px;padding:0 0 24px;border-bottom:1px solid ${rule};font-family:${serif};font-size:26px;line-height:32px;font-weight:bold;color:${ink};">Paddock Pilot<span style="color:#aa563e;">.</span></p>
<h1 class="email-heading" style="margin:0 0 24px;font-family:${serif};font-size:38px;line-height:44px;font-weight:normal;letter-spacing:-0.5px;color:${ink};">${escapeHtml(input.heading)}</h1>
${input.body}
${actionHtml}
${input.note ? `<p style="margin:0 0 24px;font-family:${sans};font-size:14px;line-height:22px;color:${copy};">${escapeHtml(input.note)}</p>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-top:24px;border-top:1px solid ${rule};">
<p style="margin:0;font-family:${serif};font-size:18px;line-height:26px;color:${ink};">Good care is a shared effort.</p>
<p style="margin:8px 0 0;font-family:${sans};font-size:12px;line-height:19px;color:${copy};">An account or stable update from Paddock Pilot.</p>
${fallback}
</td></tr></table>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body>
</html>`
}
