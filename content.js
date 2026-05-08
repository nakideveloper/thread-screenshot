(async function() {
  if (window.__isCapturingThread) return;
  window.__isCapturingThread = true;
  window.__captureAborted = false;

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const checkAbort = () => { if (window.__captureAborted) throw new Error('ABORTED'); };

  const escListener = (e) => { if (e.key === 'Escape') window.__captureAborted = true; };
  document.addEventListener('keydown', escListener);

  function showToast(msg, err = false) {
    let t = document.getElementById('thread-capture-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'thread-capture-toast';
      Object.assign(t.style, {
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        zIndex: '9999999',
        transition: 'opacity 0.25s ease',
        backgroundColor: '#18181b',
        borderRadius: '10px',
        borderLeft: '3px solid #3b82f6',
        boxShadow: '0 8px 32px rgba(0,0,0,0.32), 0 1px 4px rgba(0,0,0,0.16)',
        padding: '12px 18px 12px 15px',
        minWidth: '200px',
        maxWidth: '300px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      });
      document.body.appendChild(t);
    }
    const isDone = !err && (msg.includes('完了') || msg.includes('complete'));
    const isRunning = !err && !isDone;
    const accentColor = err ? '#ef4444' : isDone ? '#22c55e' : '#3b82f6';
    const label = err ? 'ERROR' : isDone ? 'DONE' : 'RUNNING';
    t.style.borderLeft = `3px solid ${accentColor}`;
    t.style.pointerEvents = isRunning ? 'auto' : 'none';
    t.style.display = 'block';
    t.style.opacity = '1';
    t.innerHTML =
      `<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;color:${accentColor};margin-bottom:5px;">${label}</div>` +
      `<div style="font-size:13px;font-weight:500;color:#e4e4e7;line-height:1.5;">${msg}</div>` +
      (isRunning ? `<button id="thread-capture-cancel-btn" style="margin-top:9px;padding:4px 12px;border:1px solid #3f3f46;background:transparent;color:#a1a1aa;border-radius:5px;font-size:11px;cursor:pointer;font-family:inherit;display:block;">中止 (Esc)</button>` : '');
    if (isRunning) {
      const btn = document.getElementById('thread-capture-cancel-btn');
      if (btn) {
        btn.onclick = () => { window.__captureAborted = true; };
        btn.onmouseover = () => { btn.style.background = '#27272a'; btn.style.color = '#e4e4e7'; };
        btn.onmouseout  = () => { btn.style.background = 'transparent'; btn.style.color = '#a1a1aa'; };
      }
    }
  }

  function hideToast() {
    const t = document.getElementById('thread-capture-toast');
    if (t) {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 300);
    }
  }

  const abort = (msg) => {
    showToast(msg, true);
    window.__isCapturingThread = false;
    const s = document.getElementById('thread-capture-style');
    if (s) s.remove();
    document.removeEventListener('keydown', escListener);
    setTimeout(hideToast, 4000);
  };

  showToast('準備中...');

  if (document.activeElement) {
    document.activeElement.blur();
  }

  let el = null;
  let originalScrollTop = 0;

  try {
    const selectors = [
      '.c-scrollbar__hider',
      '.c-virtual_list__scroll_container',
      '[data-qa="message_pane"]',
      '.p-workspace__secondary_view .c-virtual_list',
      'main div[class*="overflow-y-auto"]',
      'div[class*="group/scroll-root"][class*="overflow-y-auto"]',
      'main .flex-col.grow.flex',
      'div[data-testid*="scroll-root"]',
      'div.flex-1.overflow-y-auto',
      'div[data-testid="chat-scroll-container"]',
      'infinite-scroller',
      'div.chat-history'
    ];

    for (const sel of selectors) {
      const found = Array.from(document.querySelectorAll(sel)).filter(e => {
        const r = e.getBoundingClientRect();
        return r.width > 150 && r.height > 200 && e.scrollHeight > e.clientHeight;
      });
      if (found.length > 0) {
        found.sort((a, b) => b.getBoundingClientRect().left - a.getBoundingClientRect().left);
        el = found[0];
        break;
      }
    }

    if (!el) {
      return abort('エラー：スレッド（返信欄）が見つかりません。');
    }

    originalScrollTop = el.scrollTop;

    const style = document.createElement('style');
    style.id = 'thread-capture-style';
    style.textContent = `
      * { scrollbar-width: none !important; caret-color: transparent !important; }
      *::-webkit-scrollbar { display: none !important; }
      *:focus, *:focus-visible, *:focus-within { outline: none !important; box-shadow: none !important; }
      [data-qa="message_input"], [data-qa="reply_input"], [data-qa="threads_builder"],
      .p-message_input_container, .p-reply_pane__footer, .p-threads_footer,
      .c-wysiwyg_container, .p-message_pane__input, .p-thread_input { display: none !important; }
      [data-qa="channel_search_bar"], [data-qa="search_input_container"],
      .c-search__input_box, .c-search_autocomplete, .c-message_list__unread_banner,
      .p-threads_flexpane__unread_banner, [role="search"], .p-search_modal { display: none !important; }
      .p-workspace__secondary_view, [data-qa="secondary_view"], [data-qa="threads_flexpane"],
      .c-virtual_list__scroll_container, .c-message_list__default_control {
        border: none !important; box-shadow: none !important; outline: none !important;
      }
      .c-virtual_list__scroll_container, .c-scrollbar__hider, [data-qa="message_pane"] {
        padding-bottom: 0 !important; margin-bottom: 0 !important;
      }
      form:has(#prompt-textarea), #prompt-textarea, #thread-bottom-container, #page-header, header { display: none !important; }
      fieldset, .bg-bg-000 { display: none !important; }
      user-input, .input-area-container, chat-window [role="region"], .bottom-container { display: none !important; }
    `;
    document.head.appendChild(style);

    showToast('一番上までスクロールしています...');
    let topStrikes = 0;
    while (topStrikes < 3) {
      if (el.scrollTop === 0) {
        el.scrollTop = 10;
        await wait(50);
      }
      el.scrollTop = 0;
      await wait(800);
      if (el.scrollTop === 0) {
        topStrikes++;
      } else {
        topStrikes = 0;
      }
    }
    await wait(800);

    const capture = () => new Promise(resolve => {
      chrome.runtime.sendMessage({ action: 'capture_visible_tab' }, res => {
        if (chrome.runtime.lastError || !res?.dataUrl) return resolve(null);
        resolve(res.dataUrl);
      });
    });

    function dataUrlToBlob(dataUrl) {
      const [header, base64] = dataUrl.split(',');
      const mime = header.match(/:(.*?);/)[1];
      const bytes = atob(base64);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      return new Blob([arr], { type: mime });
    }

    async function getPixels(source, px, py, pw, ph) {
      const blob = (source instanceof Blob) ? source : dataUrlToBlob(source);
      const bmp = await createImageBitmap(blob, px, py, pw, ph);
      const oc = new OffscreenCanvas(pw, ph);
      const ctx = oc.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(bmp, 0, 0);
      bmp.close();
      return ctx.getImageData(0, 0, pw, ph).data;
    }

    async function loadImg(dataUrl) {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = dataUrl; });
      return img;
    }

    const toastEl = document.getElementById('thread-capture-toast');
    if (toastEl) toastEl.style.display = 'none';
    await wait(100);

    let calibDataUrl = await capture();
    if (!calibDataUrl) {
      style.remove();
      el.scrollTop = originalScrollTop;
      return abort('エラー：キャプチャできません。タブをアクティブにしてください。');
    }

    const calibImgEl = await loadImg(calibDataUrl);
    const sx = calibImgEl.naturalWidth / window.innerWidth;
    const sy = calibImgEl.naturalHeight / window.innerHeight;
    const rect = el.getBoundingClientRect();
    const viewHeight = el.clientHeight;

    const startX = Math.round(rect.right * sx);
    const searchWidth = Math.round(200 * sx);
    let foundBorderX = startX;

    if (window.location.hostname.includes('slack.com')) {
      const yLines = [0.3, 0.5, 0.7].map(f => Math.round(rect.top * sy + viewHeight * sy * f));
      const minY = Math.min(...yLines);
      const maxY = Math.max(...yLines);
      const boxHeight = maxY - minY + 1;
      const imgDataAll = await getPixels(calibDataUrl, startX - searchWidth, minY, searchWidth, boxHeight);

      for (const y of yLines) {
        const localY = y - minY;
        for (let x = searchWidth - 1; x >= 0; x--) {
          const i = (localY * searchWidth + x) * 4;
          const r = imgDataAll[i], g = imgDataAll[i+1], b = imgDataAll[i+2];
          const isGray = Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && Math.abs(r - b) < 25;
          const isWhite = r > 240 && g > 240 && b > 240;
          if (!isGray && !isWhite) {
            let leftEdge = x;
            while (leftEdge >= 0) {
              const li = (localY * searchWidth + leftEdge) * 4;
              const lr = imgDataAll[li], lg = imgDataAll[li+1], lb = imgDataAll[li+2];
              const lIsGray = Math.abs(lr - lg) < 25 && Math.abs(lg - lb) < 25 && Math.abs(lr - lb) < 25;
              const lIsWhite = lr > 240 && lg > 240 && lb > 240;
              if (lIsWhite || lIsGray) break;
              leftEdge--;
            }
            const absoluteX = (startX - searchWidth) + leftEdge;
            if (absoluteX < foundBorderX) foundBorderX = absoluteX;
            break;
          }
        }
      }
      if (foundBorderX < startX) {
        foundBorderX -= Math.round(10 * sx);
      } else {
        foundBorderX = startX - Math.round(30 * sx);
      }
    } else {
      foundBorderX = startX - Math.round(20 * sx);
    }

    calibDataUrl = null;

    const imgX = Math.round(rect.left * sx);
    const imgW = foundBorderX - imgX;

    showToast('撮影中...');
    await wait(50);
    if (toastEl) toastEl.style.display = 'none';
    await wait(100);

    const mainCanvas = document.createElement('canvas');
    mainCanvas.width = imgW;
    mainCanvas.height = Math.ceil(el.scrollHeight * sy * 1.3);
    const mainCtx = mainCanvas.getContext('2d', { willReadFrequently: true });

    let img0DataUrl = await capture();
    if (!img0DataUrl) return abort('エラー：最初のキャプチャに失敗しました。');
    const img0 = await loadImg(img0DataUrl);

    const isInitiallyAtBottom = (el.scrollTop + el.clientHeight >= el.scrollHeight - 5);
    const initialYMargin = isInitiallyAtBottom ? 0 : Math.round(60 * sy);
    const initialH = Math.round(viewHeight * sy) - initialYMargin;
    mainCtx.drawImage(img0, imgX, Math.round(rect.top * sy), imgW, initialH, 0, 0, imgW, initialH);
    img0DataUrl = null;

    let currentDstY = initialH;

    function getTrackingItem() {
      const items = Array.from(el.querySelectorAll('*')).filter(e => {
        const r = e.getBoundingClientRect();
        if (r.height < 20 || r.top <= rect.top + (rect.height / 2) || r.bottom >= rect.bottom - 60) return false;
        const s = getComputedStyle(e);
        return s.position !== 'sticky' && s.position !== 'fixed' && s.opacity !== '0';
      });
      if (items.length > 0) {
        items.sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom);
        for (const e of items) {
          let key = e.getAttribute('data-capture-track-id');
          if (!key) {
            key = 'trk_' + Math.random().toString(36).slice(2, 11);
            e.setAttribute('data-capture-track-id', key);
          }
          return { key, top: e.getBoundingClientRect().top };
        }
      }
      return null;
    }

    let track = getTrackingItem();
    let lastST = el.scrollTop;

    while (true) {
      const scrollAmount = Math.floor(viewHeight * 0.5);
      el.scrollTop = lastST + scrollAmount;
      await wait(800);
      checkAbort();

      const currentST = el.scrollTop;
      if (currentST <= lastST) break;

      const isAtBottom = (currentST + el.clientHeight >= el.scrollHeight - 5);

      let pixelShift = 0;
      if (track) {
        const trackedEl = document.querySelector(`[data-capture-track-id="${track.key}"]`);
        if (trackedEl) {
          const newTop = trackedEl.getBoundingClientRect().top;
          pixelShift = track.top - newTop;
        }
      }

      if (pixelShift <= 0) pixelShift = currentST - lastST;
      if (pixelShift <= 0) break;

      let imgDataUrl = null;
      for (let r = 0; r < 3; r++) { imgDataUrl = await capture(); if (imgDataUrl) break; await wait(500); }
      if (!imgDataUrl) return abort('エラー：キャプチャに失敗しました。');

      let srcH_px = Math.round(pixelShift * sy);
      let yMargin_px = Math.round(60 * sy);
      if (isAtBottom) { srcH_px += yMargin_px; yMargin_px = 0; }

      const bottomOfContainer = Math.min(rect.bottom, window.innerHeight);
      const rawSrcY_px = Math.round(bottomOfContainer * sy) - yMargin_px - srcH_px;
      const searchRange = Math.floor(viewHeight * 0.4 * sy);

      const imgData = await getPixels(imgDataUrl, imgX, rawSrcY_px - searchRange, imgW, searchRange);
      const rowBytes = imgW * 4;
      let localBlankY = searchRange;
      for (let offset = searchRange - 1; offset >= 0; offset--) {
        let changes = 0;
        let prevR = imgData[offset * rowBytes], prevG = imgData[offset * rowBytes + 1], prevB = imgData[offset * rowBytes + 2];
        for (let x = Math.floor(imgW * 0.15); x < Math.floor(imgW * 0.85); x++) {
          const i = offset * rowBytes + x * 4;
          const diff = Math.abs(imgData[i] - prevR) + Math.abs(imgData[i+1] - prevG) + Math.abs(imgData[i+2] - prevB);
          if (diff > 15 && ++changes > 2) { break; }
          prevR = imgData[i]; prevG = imgData[i+1]; prevB = imgData[i+2];
        }
        if (changes <= 2) { localBlankY = offset; break; }
      }
      const overlap = searchRange - localBlankY;
      const blankY = currentDstY - overlap;
      const newSrcY = rawSrcY_px - overlap;
      const newSrcH = srcH_px + overlap;

      const img = await loadImg(imgDataUrl);
      imgDataUrl = null;
      mainCtx.drawImage(img, imgX, newSrcY, imgW, newSrcH, 0, blankY, imgW, newSrcH);

      currentDstY = blankY + newSrcH;
      lastST = currentST;
      track = getTrackingItem();
    }

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = imgW;
    finalCanvas.height = currentDstY;
    finalCanvas.getContext('2d', { willReadFrequently: true }).drawImage(mainCanvas, 0, 0);

    if (toastEl) toastEl.style.display = 'block';
    showToast('画像を処理中...');

    const CHUNK = Math.round(1800 * sy);
    const chunks = [];
    let cy = 0;

    const finalOC = new OffscreenCanvas(finalCanvas.width, finalCanvas.height);
    const finalOCCtx = finalOC.getContext('2d', { willReadFrequently: true });
    finalOCCtx.drawImage(finalCanvas, 0, 0);
    function getStripData(y, h) {
      return finalOCCtx.getImageData(0, y, finalCanvas.width, h).data;
    }

    function findSafeSplitY(ideal, range) {
      const s = Math.max(0, ideal - range), e = Math.min(finalCanvas.height, ideal + range), h = e - s;
      if (h <= 0) return ideal;
      const d = getStripData(s, h);
      const rb = finalCanvas.width * 4;
      let best = ideal, minC = Infinity;
      for (let off = 0; off < range; off++) for (const sg of [-1,1]) {
        if (off===0&&sg===1) continue;
        const ly = (ideal-s) + off*sg;
        if (ly < 0 || ly >= h) continue;
        const x0 = Math.floor(finalCanvas.width*.15), x1 = Math.floor(finalCanvas.width*.85);
        let ch=0, pr=d[ly*rb+x0*4], pg=d[ly*rb+x0*4+1], pb=d[ly*rb+x0*4+2];
        for (let x=x0+1;x<x1;x++){const i=ly*rb+x*4;const df=Math.abs(d[i]-pr)+Math.abs(d[i+1]-pg)+Math.abs(d[i+2]-pb);if(df>15)ch++;pr=d[i];pg=d[i+1];pb=d[i+2];}
        if (ch<=2) return s+ly;
        if (ch<minC){minC=ch;best=s+ly;}
      }
      return best;
    }

    let effectiveHeight = finalCanvas.height;
    {
      const scanH = Math.min(finalCanvas.height, Math.round(300 * sy));
      const scanData = finalOCCtx.getImageData(0, finalCanvas.height - scanH, finalCanvas.width, scanH).data;
      const rb = finalCanvas.width * 4;
      const x0 = Math.floor(finalCanvas.width * 0.1), x1 = Math.floor(finalCanvas.width * 0.9);
      for (let row = scanH - 1; row >= 0; row--) {
        let pr = scanData[row*rb + x0*4], pg = scanData[row*rb + x0*4+1], pb = scanData[row*rb + x0*4+2];
        let hasContent = false;
        for (let x = x0+1; x < x1; x++) {
          const i = row*rb + x*4;
          if (Math.abs(scanData[i]-pr)+Math.abs(scanData[i+1]-pg)+Math.abs(scanData[i+2]-pb) > 15) { hasContent = true; break; }
          pr = scanData[i]; pg = scanData[i+1]; pb = scanData[i+2];
        }
        if (hasContent) {
          effectiveHeight = Math.min(finalCanvas.height, (finalCanvas.height - scanH) + row + Math.round(8 * sy));
          break;
        }
      }
    }

    while (cy < effectiveHeight) {
      const splitRange = Math.round(400 * sy);
      const sh = (cy+CHUNK < effectiveHeight) ? findSafeSplitY(cy+CHUNK, splitRange)-cy : effectiveHeight-cy;

      const cc = document.createElement('canvas'); cc.width=finalCanvas.width; cc.height=sh;
      cc.getContext('2d').drawImage(finalCanvas, 0, cy, finalCanvas.width, sh, 0, 0, finalCanvas.width, sh);
      chunks.push({ url: cc.toDataURL('image/jpeg', 0.92), w: Math.round(imgW/sx), h: Math.round(sh/sy) });
      cy += sh;
    }

    const html = `<html><body>${chunks.map(c=>`<p style="margin:0;padding:0;"><img src="${c.url}" width="${c.w}" height="${c.h}" style="max-width:100%; display:block;"></p>`).join('')}</body></html>`;

    try {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html],{type:'text/html'}),
        'text/plain': new Blob(['Thread Screenshot'],{type:'text/plain'})
      })]);
      showToast('コピー完了！Googleドキュメントなどにペーストしてください。');
    } catch(e) {
      showToast('コピー失敗：画面内をクリックしてから再試行してください。', true);
    }
    window.__isCapturingThread = false;
    setTimeout(hideToast, 4000);

  } catch (err) {
    if (err.message === 'ABORTED') {
      abort('キャプチャを中止しました。');
    } else {
      console.error(err);
      abort('エラーが発生しました: ' + err.message);
    }
  } finally {
    const s = document.getElementById('thread-capture-style');
    if (s) s.remove();
    if (el) el.scrollTop = originalScrollTop;
    window.__isCapturingThread = false;
    window.__captureAborted = false;
    document.removeEventListener('keydown', escListener);
  }
})();
