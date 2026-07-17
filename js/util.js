export const $  = (s, el) => (el || document).querySelector(s);
export const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));

export const esc = s => String(s == null ? '' : s)
  .replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const nowHM = () => {
  const d = new Date();
  return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
};

export const maskPhone = p => p ? p.slice(0,4) + '••••' + p.slice(-2) : '';
export const maskNik   = n => n ? n.slice(0,4) + '••••••••' + n.slice(-4) : '';
export const rupiah    = n => 'Rp' + Number(n).toLocaleString('id-ID');
