export interface DigestHabit {
  title: string
  emoji: string | null
}

export interface DigestTask {
  title: string
  due_date: string | null
  priority: string
}

export function buildDigestEmail(opts: {
  habits: DigestHabit[]
  tasks: DigestTask[]
  date: string
}): string {
  const { habits, tasks, date } = opts

  const habitRows = habits.length
    ? habits
        .map(
          (h) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f5f5f4;font-size:14px;color:#1c1917;">
            ${h.emoji ? `<span style="margin-right:8px;">${h.emoji}</span>` : ''}${escHtml(h.title)}
          </td>
        </tr>`,
        )
        .join('')
    : `<tr><td style="padding:8px 0;font-size:13px;color:#a8a29e;">Geen habits voor vandaag.</td></tr>`

  const priorityDot: Record<string, string> = {
    high: '#ef4444',
    normal: '#f59e0b',
    low: '#a8a29e',
  }

  const taskRows = tasks.length
    ? tasks
        .map(
          (t) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f5f5f4;font-size:14px;color:#1c1917;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${priorityDot[t.priority] ?? '#a8a29e'};margin-right:8px;vertical-align:middle;"></span>${escHtml(t.title)}
          </td>
        </tr>`,
        )
        .join('')
    : `<tr><td style="padding:8px 0;font-size:13px;color:#a8a29e;">Geen taken voor vandaag.</td></tr>`

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://habit-tracker.app'

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Jouw dagelijkse overzicht</title>
</head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0;font-size:13px;color:#a8a29e;text-transform:capitalize;">${escHtml(date)}</p>
              <h1 style="margin:4px 0 0;font-size:22px;font-weight:600;color:#1c1917;letter-spacing:-0.3px;">
                Goedemorgen! &#x1F31E;
              </h1>
              <p style="margin:6px 0 0;font-size:14px;color:#78716c;">Hier is je overzicht voor vandaag.</p>
            </td>
          </tr>

          <!-- Habits kaart -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:20px 24px;margin-bottom:12px;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#a8a29e;">
                Habits voor vandaag
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${habitRows}
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height:10px;"></td></tr>

          <!-- Taken kaart -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:20px 24px;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#a8a29e;">
                Taken voor vandaag
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${taskRows}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 0 8px;text-align:center;">
              <a href="${appUrl}/today"
                 style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:12px;">
                Open app
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:16px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a8a29e;">
                Je ontvangt deze e-mail omdat je dagelijkse digest hebt ingeschakeld. &nbsp;
                <a href="${appUrl}/settings" style="color:#a8a29e;text-decoration:underline;">Uitschakelen</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
