export type ToastKind = 'info'|'success'|'error';

export function toast(msg: string, kind: ToastKind = 'info') {
  const el = document.createElement('div');
  el.className = `msocj-toast ${kind}`;
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed', right: '16px', bottom: '16px',
    background: kind==='error' ? '#c62828' : kind==='success' ? '#2e7d32' : '#424242',
    color: 'white', padding: '10px 14px', borderRadius: '8px', zIndex: 99999,
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
  });
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 3000);
}
