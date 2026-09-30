/* Creative Youth Awards Summary Block plugin. Generated from plugin-source.html. */
(function () {
  if (typeof document === 'undefined' || document.getElementById('cya-summary-plugin-styles')) return;
  const style = document.createElement('style');
  style.id = 'cya-summary-plugin-styles';
  style.textContent = "\n  #block-yui_3_17_2_1_1790711577628_798[data-cya-summary-ready=\"1\"] .summary-item-list{\n    display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:60px;\n    height:auto!important;margin:0!important;overflow:visible!important\n  }\n  #block-yui_3_17_2_1_1790711577628_798[data-cya-summary-ready=\"1\"] .summary-item-list::after{content:none!important}\n  #block-yui_3_17_2_1_1790711577628_798[data-cya-summary-ready=\"1\"] .summary-item{\n    float:none!important;position:static!important;left:auto!important;top:auto!important;\n    width:auto!important;height:auto!important;margin:0!important;transform:none!important\n  }\n  #block-yui_3_17_2_1_1790711577628_798 .cya-summary-clone .summary-thumbnail img{\n    position:absolute!important;inset:0!important;width:100%!important;height:100%!important;\n    object-fit:cover!important;opacity:1!important\n  }\n  #block-yui_3_17_2_1_1790711577628_798 .cya-summary-placeholder{\n    display:grid;place-items:center;position:absolute;inset:0;padding:12px;\n    background:#eee;color:#555;text-align:center;font-size:14px\n  }\n  #block-yui_3_17_2_1_1790711577628_798 .cya-summary-controls{\n    display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;\n    clear:both;padding:28px 10px;color:inherit;font:inherit\n  }\n  #block-yui_3_17_2_1_1790711577628_798 .cya-summary-controls button{\n    border:1px solid currentColor;border-radius:5px;padding:10px 16px;background:transparent;\n    color:inherit;font:inherit;cursor:pointer\n  }\n  #block-yui_3_17_2_1_1790711577628_798 .cya-summary-controls button:disabled{opacity:.45;cursor:default}\n  #block-yui_3_17_2_1_1790711577628_798 .cya-summary-controls button:focus-visible{\n    outline:3px solid currentColor;outline-offset:3px\n  }\n  #cya-summary-plugin-message:not(:empty){padding:12px 0;color:#8b253a}\n  @media(max-width:900px){\n    #block-yui_3_17_2_1_1790711577628_798[data-cya-summary-ready=\"1\"] .summary-item-list{\n      grid-template-columns:repeat(2,minmax(0,1fr));gap:30px\n    }\n  }\n  @media(max-width:550px){\n    #block-yui_3_17_2_1_1790711577628_798[data-cya-summary-ready=\"1\"] .summary-item-list{\n      grid-template-columns:repeat(1,minmax(0,1fr));gap:25px\n    }\n  }\n";
  document.head.append(style);
})();

/* Original CYA implementation; no Squarewebsites source code is included. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root.document) {
    let attempts = 0;
    function start() {
      const block = root.document.getElementById(api.blockId);
      if (block?.querySelector('.summary-item-list .summary-item')) api.mount(root.document, root);
      else if (attempts++ < 40) root.setTimeout(start, 250);
    }
    if (root.document.readyState === 'loading')
      root.document.addEventListener('DOMContentLoaded', start, {once:true});
    else start();
  }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';

  const SETTINGS = {
    blockId: 'block-yui_3_17_2_1_1790711577628_798',
    collectionUrl: 'https://www.creativeyouthawards.org/2026',
    mode: 'collection', // 'collection' for scrolling test; 'sheet' for editorial row order.
    sheetUrl: '', // https://docs.google.com/spreadsheets/d/ID/edit?gid=123
    loadBatch: 20,
    minimumRows: 1, // Set near 2,000 before replacing a full live index.
    timeoutMs: 15000,
    maxItems: 5000
  };
  const COLUMNS = new Set(['post_url','title','category','award','image_url','excerpt','sort_order']);
  const MOVE_DEMO = '/2026/traveling-man-alec-y';

  function validatedPath(raw, config = SETTINGS) {
    const base = new URL(config.collectionUrl);
    let url;
    try { url = new URL(String(raw || '').trim(), base); }
    catch (_) { throw new Error('Invalid post URL.'); }
    if (url.origin !== base.origin || url.search || url.hash ||
        !new RegExp('^' + base.pathname.replace(/\/$/, '') + '/[^/]+$').test(url.pathname.replace(/\/$/, ''))) {
      throw new Error('A post URL is outside this blog collection.');
    }
    return url.pathname.replace(/\/$/, '');
  }

  function imageUrl(raw) {
    if (!raw) return '';
    let url;
    try { url = new URL(raw); } catch (_) { return ''; }
    if (url.protocol === 'http:' && url.hostname === 'static1.squarespace.com') url.protocol = 'https:';
    if (url.protocol !== 'https:' || !['images.squarespace-cdn.com','static1.squarespace.com'].includes(url.hostname)) return '';
    return url.href;
  }

  function thumbnailUrl(raw) {
    const safe = imageUrl(raw);
    if (!safe) return '';
    const url = new URL(safe);
    url.searchParams.set('format', '500w');
    return url.href;
  }

  function collectionOnCurrentOrigin(config, browser) {
    const archive = new URL(config.collectionUrl);
    return new URL(archive.pathname, browser.location.origin).href;
  }

  function sheetEndpoint(raw) {
    let url;
    try { url = new URL(raw); } catch (_) { throw new Error('Set sheetUrl to the public-only Google Sheet URL.'); }
    const match = url.pathname.match(/^\/spreadsheets\/d\/([A-Za-z0-9_-]+)(?:\/|$)/);
    const gid = url.searchParams.get('gid') || url.hash.match(/(?:^|[&#])gid=(\d+)/)?.[1] || '0';
    if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || !match || !/^\d+$/.test(gid)) {
      throw new Error('Expected a Google Sheet edit URL with a numeric gid.');
    }
    const endpoint = new URL('https://docs.google.com/spreadsheets/d/' + match[1] + '/gviz/tq');
    endpoint.searchParams.set('gid', gid);
    endpoint.searchParams.set('headers', '1');
    return endpoint;
  }

  function sheetRows(response, config = SETTINGS) {
    if (response.status !== 'ok' || !response.table || !Array.isArray(response.table.cols) ||
        !Array.isArray(response.table.rows)) throw new Error('Google Sheet did not return a gallery table.');
    const headers = response.table.cols.map(col => String(col.label || '').trim().toLowerCase());
    if (new Set(headers).size !== headers.length || headers.some(h => !COLUMNS.has(h)) ||
        ['post_url','title','category'].some(h => !headers.includes(h))) {
      throw new Error('The Sheet needs public gallery columns only: post_url, title, category, award, image_url.');
    }
    const seen = new Set();
    const rows = response.table.rows.map((row, index) => {
      const cells = row.c || [];
      const data = {};
      headers.forEach((h, i) => { data[h] = String(cells[i]?.v ?? '').trim(); });
      if (headers.every(h => !data[h])) return null;
      let path;
      try { path = validatedPath(data.post_url, config); }
      catch (_) { throw new Error('Invalid post URL in Sheet row ' + (index + 2)); }
      if (seen.has(path)) throw new Error('Duplicate post URL in Sheet row ' + (index + 2));
      seen.add(path);
      if (!data.title || !data.category) throw new Error('Missing title or category in Sheet row ' + (index + 2));
      if (data.image_url && !imageUrl(data.image_url)) throw new Error('Unexpected image URL in Sheet row ' + (index + 2));
      return {path, title:data.title, category:data.category, award:data.award || '',
        image:imageUrl(data.image_url), excerpt:data.excerpt || ''};
    }).filter(Boolean);
    if (rows.length < config.minimumRows || rows.length > config.maxItems) {
      throw new Error('The Sheet has an unexpected number of gallery rows.');
    }
    return rows; // Physical row order is the display order; sort_order is deliberately ignored.
  }

  function loadSheet(document, browser, config = SETTINGS) {
    const endpoint = sheetEndpoint(config.sheetUrl);
    const callback = '__cyaSummaryFeed_' + Math.random().toString(36).slice(2);
    endpoint.searchParams.set('tqx', 'out:json;responseHandler:' + callback);
    endpoint.searchParams.set('cache', String(Date.now()));
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      let timer, done = false;
      function finish(error, rows) {
        if (done) return;
        done = true; clearTimeout(timer); script.remove(); delete browser[callback];
        if (error) reject(error); else resolve(rows);
      }
      browser[callback] = response => {
        try { finish(null, sheetRows(response, config)); } catch (error) { finish(error); }
      };
      script.onerror = () => finish(new Error('Could not load the public-only Sheet.'));
      script.src = endpoint.href;
      timer = setTimeout(() => finish(new Error('Google Sheet timed out; check view access and gid.')), config.timeoutMs);
      document.head.append(script);
    });
  }

  function parseCollectionPage(html, pageUrl, config = SETTINGS) {
    const document = new DOMParser().parseFromString(html, 'text/html');
    const base = new URL(config.collectionUrl);
    const items = [...document.querySelectorAll('article.blog-item')].map(article => {
      const titleLink = article.querySelector('h1 a, h2 a, .blog-title a');
      const href = titleLink?.getAttribute('href') || article.querySelector('a.image-wrapper')?.getAttribute('href');
      if (!href) return null;
      let path;
      try { path = validatedPath(new URL(href, base).href, config); } catch (_) { return null; }
      return {path, title:titleLink?.textContent.trim() || article.querySelector('img')?.alt || path.split('/').at(-1),
        category:article.querySelector('.blog-categories')?.textContent.trim() || '',
        award:'', image:imageUrl(article.querySelector('a.image-wrapper img')?.getAttribute('data-image') ||
          article.querySelector('a.image-wrapper img')?.getAttribute('src') || '')};
    }).filter(Boolean);
    // Squarespace's server HTML labels this link "Older Posts". Site code
    // changes the visible label to "Next" only after the page has loaded;
    // DOMParser does not execute that script when we fetch an archive page.
    const next = [...document.querySelectorAll('a[href*="offset="]')].find(a =>
      a.getAttribute('rel')?.split(/\s+/).includes('next') ||
      a.getAttribute('data-cya-pager') === 'next' ||
      /^(?:next|older(?: posts)?|see more)\b/i.test(a.textContent.trim()));
    let nextUrl = null;
    if (next) {
      const candidate = new URL(next.getAttribute('href'), base);
      if (candidate.origin === base.origin && candidate.pathname.replace(/\/$/, '') === base.pathname.replace(/\/$/, '') &&
          /^\d+$/.test(candidate.searchParams.get('offset') || '') &&
          [...candidate.searchParams.keys()].every(key => key === 'offset')) nextUrl = candidate.href;
    }
    return {items, nextUrl, pageUrl};
  }

  function nativeCardData(card, config = SETTINGS) {
    const anchor = card.querySelector('.summary-title-link');
    if (!anchor) return null;
    try {
      const path = validatedPath(anchor.getAttribute('href'), config);
      return {path, title:anchor.textContent.trim(), image:imageUrl(
        card.querySelector('.summary-thumbnail img')?.getAttribute('data-image') ||
        card.querySelector('.summary-thumbnail img')?.getAttribute('src') || '')};
    } catch (_) { return null; }
  }

  function makeCard(data, template, document) {
    const card = template.cloneNode(true);
    card.classList.add('cya-summary-clone');
    card.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    card.removeAttribute('id');
    card.querySelectorAll('.summary-excerpt,.summary-read-more-link,.summary-metadata-container').forEach(node => node.remove());
    const title = card.querySelector('.summary-title-link');
    const thumbnail = card.querySelector('.summary-thumbnail-container');
    if (!title || !thumbnail) throw new Error('Squarespace Summary Block markup has changed.');
    title.href = data.path; title.textContent = data.title;
    thumbnail.href = data.path;
    thumbnail.setAttribute('aria-label', data.title);
    thumbnail.setAttribute('data-title', data.title);
    thumbnail.removeAttribute('data-description');
    const frame = card.querySelector('.summary-thumbnail');
    if (!frame) throw new Error('Summary Block thumbnail markup has changed.');
    frame.style.position = 'relative'; frame.style.paddingBottom = '100%'; frame.style.overflow = 'hidden';
    frame.replaceChildren();
    if (data.image) {
      const img = document.createElement('img');
      img.className = 'summary-thumbnail-image loaded'; img.alt = '';
      img.src = thumbnailUrl(data.image); img.loading = 'lazy'; img.decoding = 'async';
      frame.append(img);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'cya-summary-placeholder';
      placeholder.textContent = data.category || 'Gallery entry';
      frame.append(placeholder);
    }
    return card;
  }

  function mount(document, browser, config = SETTINGS) {
    if (new URLSearchParams(browser.location.search).get('cya-sheet-test') === '1') {
      config = {...config, mode:'sheet',
        sheetUrl:'https://docs.google.com/spreadsheets/d/1nJKIBBEJp12m66648PUsGo0mKa_2ayKh04P1cmfd5nw/edit?gid=1857378834',
        minimumRows:25};
    }
    // Request the archive on this page's host, including Squarespace preview
    // domains when they serve both pages, so the fetch stays same-origin.
    config = {...config, collectionUrl:collectionOnCurrentOrigin(config, browser)};
    const block = document.getElementById(config.blockId);
    let message = document.getElementById('cya-summary-plugin-message');
    if (!message && block) {
      message = document.createElement('div');
      message.id = 'cya-summary-plugin-message';
      message.setAttribute('role', 'status');
      message.setAttribute('aria-live', 'polite');
      block.after(message);
    }
    if (!message) return;
    if (!block) { message.textContent = 'Target Summary Block not found on this page; check blockId.'; return; }
    if (block.dataset.cyaSummaryReady) return;
    const list = block.querySelector('.summary-item-list');
    if (!list) { message.textContent = 'Summary Block not ready; refresh the page.'; return; }
    const originals = [...list.querySelectorAll(':scope > .summary-item')];
    if (!originals.length || originals.some(card => !nativeCardData(card, config))) {
      message.textContent = 'The Summary Block structure has changed; no cards were modified.'; return;
    }
    const template = originals[0];
    const native = new Map(originals.map(card => [nativeCardData(card, config).path, card]));
    const loaded = new Map(native);
    const originalOrder = [...native.keys()];
    const controls = document.createElement('div');
    controls.className = 'cya-summary-controls';
    const status = document.createElement('span'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const more = document.createElement('button'); more.type = 'button'; more.textContent = 'Load more';
    const move = document.createElement('button'); move.type = 'button'; move.textContent = 'Move “Traveling man” (entry 39) to first';
    const reset = document.createElement('button'); reset.type = 'button'; reset.textContent = 'Reset demo order';
    if (config.mode !== 'collection') { move.hidden = true; reset.hidden = true; }
    controls.append(status, more, move, reset);
    block.append(controls);
    let rows = [], visible = 0, nextUrl = config.collectionUrl, busy = false;
    let failed = false, observer = null;
    let autoSupported = typeof browser.IntersectionObserver === 'function';
    const seenPages = new Set();
    const pending = [];
    const imageJobs = [];
    const imageCache = new Map();
    let imageRequests = 0;

    function hydrateImage(item, card) {
      if (item.image || native.has(item.path)) return;
      imageJobs.push({item, card});
      runImageJobs();
    }
    function runImageJobs() {
      while (imageRequests < 4 && imageJobs.length) {
        const {item, card} = imageJobs.shift();
        imageRequests++;
        (async () => {
          let url = imageCache.get(item.path);
          if (url === undefined) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), config.timeoutMs);
            try {
              const response = await browser.fetch(new URL(item.path, config.collectionUrl),
                {credentials:'same-origin', signal:controller.signal});
              if (response.ok) {
                const post = new DOMParser().parseFromString(await response.text(), 'text/html');
                url = imageUrl(post.querySelector('meta[property="og:image"]')?.getAttribute('content') || '');
              }
            } catch (_) { /* Keep the placeholder if this post cannot be read. */ }
            finally { clearTimeout(timer); }
            imageCache.set(item.path, url || '');
          }
          if (url) {
            const frame = card.querySelector('.summary-thumbnail');
            if (frame) {
              const img = document.createElement('img');
              img.className = 'summary-thumbnail-image loaded'; img.alt = '';
              img.src = thumbnailUrl(url); img.loading = 'lazy'; img.decoding = 'async';
              frame.replaceChildren(img);
            }
          }
        })().finally(() => { imageRequests--; runImageJobs(); });
      }
    }

    function hasMore() {
      return config.mode === 'sheet' ? visible < rows.length :
        loaded.size < config.maxItems && Boolean(nextUrl || pending.length);
    }
    function count() {
      status.textContent = config.mode === 'sheet'
        ? `Showing ${visible} of ${rows.length} entries`
        : `Showing ${loaded.size} entries`;
      more.hidden = !hasMore() || (autoSupported && !failed);
      if (!hasMore()) observer?.disconnect();
      move.disabled = !loaded.has(MOVE_DEMO);
    }
    function setError(error) {
      console.error('[CYA Summary Block]', error);
      message.textContent = error.message || 'Could not load more entries.';
      failed = true;
      more.textContent = 'Retry loading';
      more.disabled = false;
      busy = false;
      count();
    }
    function appendSheetBatch() {
      const end = Math.min(rows.length, visible + config.loadBatch);
      const fragment = document.createDocumentFragment();
      const added = [];
      for (let i = visible; i < end; i++) {
        const item = rows[i];
        const existing = native.get(item.path);
        const card = existing ? existing.cloneNode(true) : makeCard(item, template, document);
        fragment.append(card); added.push({item, card});
      }
      list.append(fragment);
      added.forEach(({item,card}) => hydrateImage(item,card));
      visible = end; count();
    }
    async function loadCollectionBatch() {
      if (busy || (!nextUrl && !pending.length)) return;
      busy = true; more.disabled = true; message.textContent = '';
      status.textContent = 'Loading more entries…';
      const target = Math.min(config.maxItems, loaded.size + config.loadBatch);
      const before = loaded.size;
      try {
        while (loaded.size < target && (nextUrl || pending.length)) {
          if (!pending.length) {
            if (seenPages.has(nextUrl)) throw new Error('The blog pagination repeated a page.');
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), config.timeoutMs);
            let response;
            try { response = await browser.fetch(nextUrl, {credentials:'same-origin',signal:controller.signal}); }
            catch (error) {
              if (error.name === 'AbortError') throw new Error('The blog request timed out. Please try again.');
              throw new Error('Could not request the blog archive from this page. Check that /new-page and /2026 open on the same site address.');
            }
            finally { clearTimeout(timer); }
            if (!response.ok) throw new Error('Could not load the next blog page.');
            const page = parseCollectionPage(await response.text(), nextUrl, config);
            if (!page.items.length) throw new Error('The next blog page had no entries.');
            seenPages.add(nextUrl);
            nextUrl = page.nextUrl;
            pending.push(...page.items);
          }
          const fragment = document.createDocumentFragment();
          while (pending.length && loaded.size < target) {
            const item = pending.shift();
            if (loaded.has(item.path)) continue;
            const card = makeCard(item, template, document);
            loaded.set(item.path, card); originalOrder.push(item.path); fragment.append(card);
          }
          list.append(fragment);
        }
        if (loaded.size === before && loaded.size < config.maxItems)
          throw new Error('No new entries were found. Check the blog archive pagination.');
        busy = false; more.disabled = false; count(); scheduleAutoLoad();
      } catch (error) { setError(error); }
    }

    function loadNext() {
      if (busy || !hasMore()) return;
      failed = false; more.textContent = 'Load more';
      more.hidden = autoSupported;
      message.textContent = '';
      if (config.mode === 'sheet') {
        try { appendSheetBatch(); scheduleAutoLoad(); }
        catch (error) { setError(error); }
      } else loadCollectionBatch();
    }
    function maybeAutoLoad() {
      if (busy || failed || !hasMore()) return;
      const rect = controls.getBoundingClientRect();
      if (rect.top <= browser.innerHeight + 600 && rect.bottom >= -200) loadNext();
    }
    function scheduleAutoLoad() {
      if (autoSupported && !failed && hasMore()) browser.requestAnimationFrame(maybeAutoLoad);
    }
    function startAutoLoad() {
      if (!autoSupported || observer) return;
      try {
        observer = new browser.IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) maybeAutoLoad();
        }, {rootMargin:'0px 0px 600px 0px'});
        observer.observe(controls);
      } catch (error) {
        autoSupported = false; observer = null; count();
      }
    }

    more.addEventListener('click', loadNext);
    move.addEventListener('click', () => {
      const card = loaded.get(MOVE_DEMO);
      if (card) list.prepend(card);
    });
    reset.addEventListener('click', () => {
      const fragment = document.createDocumentFragment();
      originalOrder.forEach(path => { const card = loaded.get(path); if (card) fragment.append(card); });
      list.append(fragment);
    });

    if (config.mode === 'sheet') {
      more.disabled = true; status.textContent = 'Loading order Sheet…';
      loadSheet(document, browser, config).then(data => {
        rows = data;
        // Render the first batch before replacing Squarespace's original cards.
        const fragment = document.createDocumentFragment();
        const added = [];
        const end = Math.min(rows.length, Math.max(originals.length, config.loadBatch));
        for (let i = 0; i < end; i++) {
          const item = rows[i];
          const existing = native.get(item.path);
          const card = existing ? existing.cloneNode(true) : makeCard(item, template, document);
          fragment.append(card); added.push({item, card});
        }
        list.replaceChildren(fragment);
        block.dataset.cyaSummaryReady = '1';
        added.forEach(({item,card}) => hydrateImage(item,card));
        visible = end; more.disabled = false; count(); startAutoLoad();
      }).catch(error => {
        // Leave the original 30 cards in place if the feed cannot be used.
        more.hidden = true; setError(error);
      });
    } else {
      block.dataset.cyaSummaryReady = '1';
      count(); startAutoLoad();
    }
  }

  return {blockId:SETTINGS.blockId,validatedPath,imageUrl,thumbnailUrl,collectionOnCurrentOrigin,sheetEndpoint,sheetRows,
    parseCollectionPage,nativeCardData,makeCard,mount};
});

