// Crop image to match the reveal window from artworks page
(function() {
  const params = new URLSearchParams(window.location.search);
  const cl = parseFloat(params.get('cl'));
  const ct = parseFloat(params.get('ct'));
  const cr = parseFloat(params.get('cr'));
  const cb = parseFloat(params.get('cb'));

  if (isNaN(cl) || isNaN(ct) || isNaN(cr) || isNaN(cb)) return;

  const img = document.getElementById('artwork-img');
  const cvs = document.getElementById('artwork-canvas');

  function applyCrop() {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const sx = Math.round(cl * nw);
    const sy = Math.round(ct * nh);
    const sw = Math.round((cr - cl) * nw);
    const sh = Math.round((cb - ct) * nh);

    if (sw <= 0 || sh <= 0) return;

    cvs.width = sw;
    cvs.height = sh;
    cvs.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    cvs.style.display = 'block';
    img.style.display = 'none';
  }

  if (img.complete && img.naturalWidth > 0) {
    applyCrop();
  } else {
    img.onload = applyCrop;
  }
})();
