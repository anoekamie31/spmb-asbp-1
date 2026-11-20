/* =========================================================================
   shared.js - Utilitas bersama untuk Portal Ortu & Dashboard Panitia
   ========================================================================= */

var API_URL = "https://script.google.com/macros/s/AKfycby7UqTxUAavuTDIx5u9dGyYSfzmg0l4CUiPUnBW0qLt_896N_JPFbSypGltykNogFQ/exec";

var FALLBACK_CFG = {
  sekolah: "SMP Al Azhar Syifa Budi Parahyangan",
  ta: "2027/2028",
  logo: "https://i.ibb.co.com/JWV0Wprs/anyar-deui-wae2.jpg",
  adminWA: "6289696089428"
};

var KARTU_CSS =
  '.kartu{border:2px solid #005a4f;border-radius:8px;padding:16px;background:#fff;color:#222;font-family:Arial,sans-serif;font-size:11px;box-sizing:border-box}' +
  '.kartu-kop{text-align:center;margin-bottom:12px;border-bottom:3px double #005a4f;padding-bottom:8px}' +
  '.kartu-kop img{max-width:100%;height:auto;max-height:80px;display:block;margin:0 auto 6px}' +
  '.kartu-judul{text-align:center;font-size:14px;font-weight:bold;color:#005a4f;margin:10px 0 12px;text-decoration:underline;text-transform:uppercase}' +
  '.kartu-info{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12px}' +
  '.kartu-info td{padding:3px 5px;vertical-align:top;border:none}' +
  '.kartu-info td.lbl{font-weight:bold;width:140px;color:#004d40}' +
  '.kartu-tabel{width:100%;border-collapse:collapse;font-size:11px}' +
  '.kartu-tabel th,.kartu-tabel td{border:1px solid #005a4f;padding:6px 8px;text-align:left;vertical-align:top}' +
  '.kartu-tabel th{background:#e0f2f1;color:#004d40;text-align:center;text-transform:none;white-space:normal;font-size:11px}' +
  '.kartu-tabel tr:hover{background:none}' +
  '.kartu a{color:#0056b3;font-weight:bold;text-decoration:underline;word-break:break-all}' +
  '.kartu-catatan{margin-top:10px;padding:8px 10px;border:1px solid #ef6c00;background:#fff4e5;color:#7c2d12;font-size:11px;border-radius:4px;white-space:pre-line}' +
  '.kartu-note{margin-top:10px;font-size:10px;color:#555;font-style:italic;border-top:1px dashed #ccc;padding-top:5px}' +
  '@media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';

var TOAST_CSS =
  '#toastBox{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:3000;display:flex;flex-direction:column;gap:8px;align-items:center;max-width:92vw}' +
  '.toast{background:#1e293b;color:#fff;padding:10px 16px;border-radius:8px;font:600 13px/1.4 "Segoe UI",system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25)}' +
  '.toast.ok{background:#166534}.toast.err{background:#b91c1c}';

function injectSharedCss() {
  if (document.getElementById('sharedStyleTag')) return;
  var st = document.createElement('style');
  st.id = 'sharedStyleTag';
  st.textContent = KARTU_CSS + TOAST_CSS;
  document.head.appendChild(st);
}

function callBackend(fnName, args, onSuccess, onError) {
  args = args || [];
  if (API_URL) {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: fnName, args: args })
    })
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      })
      .then(function (data) {
        if (onSuccess) onSuccess(data);
      })
      .catch(function (err) {
        if (onError) onError(err);
      });
    return;
  }

  if (window.google && window.google.script && window.google.script.run) {
    var runner = window.google.script.run
      .withSuccessHandler(function (res) { if (onSuccess) onSuccess(res); })
      .withFailureHandler(function (err) { if (onError) onError(err); });
    runner[fnName].apply(runner, args);
  } else if (onError) {
    onError(new Error('API_URL belum dikonfigurasi.'));
  }
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function linkify(text) {
  var s = String(text == null ? '' : text).trim();
  if (!s || s === '-') return '-';
  var re = /(https?:\/\/[^\s<>"']+|(?:meet\.google\.com|zoom\.us)\/[^\s<>"']+)/gi;
  var out = '', last = 0, m;
  while ((m = re.exec(s)) !== null) {
    out += esc(s.slice(last, m.index));
    var raw = m[0], trail = '';
    var t = raw.match(/[.,;:)\]]+$/);
    if (t) { trail = t[0]; raw = raw.slice(0, raw.length - trail.length); }
    var href = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
    out += '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + esc(raw) + '</a>' + esc(trail);
    last = m.index + m[0].length;
  }
  return out + esc(s.slice(last));
}

function kartuHtml(p, cfg) {
  var huruf = 'ABCDEF';
  var h = '<div class="kartu"><div class="kartu-kop">';
  h += '<img src="' + esc(cfg.logo) + '" alt="Kop surat" onerror="this.style.display=\'none\'">';
  h += '</div><div class="kartu-judul">Kartu Tes Seleksi Penerimaan Murid Baru (SPMB)</div>';
  h += '<table class="kartu-info">' +
       '<tr><td class="lbl">No. Calon Murid</td><td>: <b>' + esc(p.no) + '</b></td></tr>' +
       '<tr><td class="lbl">Nama Calon Murid</td><td>: ' + esc(p.nama) + '</td></tr>' +
       '<tr><td class="lbl">Asal Sekolah</td><td>: ' + esc(p.sekolah) + '</td></tr>' +
       '<tr><td class="lbl">Gelombang / Sesi</td><td>: ' + esc(p.gel || '-') + ' / ' + esc(p.sesi || '-') + '</td></tr></table>';
  h += '<table class="kartu-tabel"><thead><tr>' +
       '<th style="width:28%">KEGIATAN</th><th style="width:25%">WAKTU</th><th style="width:28%">TEMPAT / LOKASI</th><th style="width:19%">KETERANGAN</th>' +
       '</tr></thead><tbody>';
  (p.jadwal || []).forEach(function (j, i) {
    h += '<tr><td><b>' + huruf.charAt(i) + '. ' + esc(j.nama) + '</b></td>' +
         '<td>Tgl: ' + esc(j.tgl || '-') + '<br>Pukul: ' + esc(j.jam || '-') + '</td>' +
         '<td>' + linkify(j.tempat) + '</td>' +
         '<td>' + esc(j.ket || '') + '</td></tr>';
  });
  h += '</tbody></table>';
  if (p.catatan) h += '<div class="kartu-catatan"><b>Catatan Panitia:</b> ' + linkify(p.catatan) + '</div>';
  h += '<div class="kartu-note">* Harap membawa kartu tes ini dalam bentuk fisik atau digital saat pelaksanaan tes. Admin SMP: wa.me/' + esc(cfg.adminWA) + '</div></div>';
  return h;
}

function printKartu(p, cfg, onPrinted) {
  var w = window.open('', '_blank', 'width=900,height=900');
  if (!w) {
    toast('Pop-up diblokir browser. Izinkan pop-up untuk situs ini, lalu coba lagi.', 'err');
    return false;
  }
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kartu SPMB - ' + esc(p.no) + '</title><style>' +
    KARTU_CSS + '@page{size:A4 portrait;margin:12mm}body{margin:0;font-family:Arial,sans-serif;background:#fff}' +
    '</style></head><body>' + kartuHtml(p, cfg) +
    '<script>window.addEventListener("load",function(){setTimeout(function(){window.focus();window.print();},250);});' +
    'window.addEventListener("afterprint",function(){window.close();});</' + 'script></body></html>';
  w.document.open();
  w.document.write(html);
  w.document.close();
  if (onPrinted) onPrinted();
  return true;
}

function downloadBase64(dataUrl, filename) {
  try {
    var bin = atob(String(dataUrl).split(',')[1]);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    var url = URL.createObjectURL(new Blob([arr], { type: 'application/pdf' }));
    var a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
    return url;
  } catch (e) {
    return dataUrl;
  }
}

function toast(msg, type) {
  var box = document.getElementById('toastBox');
  if (!box) { box = document.createElement('div'); box.id = 'toastBox'; document.body.appendChild(box); }
  var t = document.createElement('div');
  t.className = 'toast ' + (type || 'info');
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, type === 'err' ? 6000 : 3200);
}