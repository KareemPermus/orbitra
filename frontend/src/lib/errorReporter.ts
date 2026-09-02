export function initErrorReporter() {
  if (typeof window === 'undefined') return;

  const reportUrl = process.env.NEXT_PUBLIC_RUNTIME_ERROR_REPORT_URL;
  const appId = process.env.NEXT_PUBLIC_APP_ID || deriveAppId();

  function deriveAppId(): string {
    try {
      const match = window.location.hostname.match(/^preview-([^.]+)/);
      return match ? match[1] : window.location.hostname;
    } catch { return 'unknown'; }
  }

  function send(message: string, stack?: string) {
    if (!reportUrl) return;
    try {
      fetch(reportUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: appId, message, stack, url: window.location.href, user_agent: navigator.userAgent }),
      }).catch(() => {});
    } catch {}
  }

  window.onerror = (msg, _src, _line, _col, err) => { send(String(msg), err?.stack); };
  window.onunhandledrejection = (e) => { send(String(e.reason), e.reason?.stack); };

  const origError = console.error;
  console.error = (...args: any[]) => { send(args.map(String).join(' ')); origError.apply(console, args); };
}