// ==UserScript==
// @name         X "Under the Hood" Report Viewer
// @namespace    x-uth-viewer
// @version      1.0.0
// @description  Parses X's "Under the Hood" JSON export into a clean, readable reach report
// @match        https://x.com/*
// @match        https://*.x.com/*
// @match        https://twitter.com/*
// @match        https://*.twitter.com/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  'use strict';
  if (window.__uthViewerLoaded) return;
  window.__uthViewerLoaded = true;

  /* ================================================================
     Label metadata — colors / names for known labels.
     Unknown labels fall back gracefully.
     ================================================================ */
  const LABEL_META = {
    FOSNR_VIOLENT_SPEECH: { title: 'Violent Speech (FOSNR)', color: '#f4212e', icon: '🗣️', tag: 'Freedom of Speech, Not Reach' },
    NSFW_HIGH_PRECISION:  { title: 'Adult Content — High Confidence', color: '#f91880', icon: '🔞', tag: 'Sensitive content' },
    NSFW_HIGH_RECALL:     { title: 'Adult Content — Possible', color: '#ff7a00', icon: '🔞', tag: 'Sensitive content' },
    SPAM_HIGH_RECALL:     { title: 'Possible Spam', color: '#ffd400', icon: '🤖', tag: 'Platform manipulation' },
    SPAM_HIGH_PRECISION:  { title: 'Spam — High Confidence', color: '#ffd400', icon: '🤖', tag: 'Platform manipulation' },
  };
  const FALLBACK_META = { title: null, color: '#7856ff', icon: '🏷️', tag: 'Label' };

  /* ================================================================
     Embedded sample (the July 2026 report) so you can preview
     the UI instantly without re-uploading the file.
     ================================================================ */
  const SAMPLE = {
    notes: "You can learn more about instances when a post's reach may be limited by reading our open-source code at https://github.com/xai-org/x-algorithm and the guide at https://help.x.com/rules-and-policies/x-reach-limited. Learn more about account and post-level enforcement options here https://help.x.com/rules-and-policies/enforcement-options. This report is provided on a best-effort basis — the code that generates it is open-source: https://github.com/xai-org/x-algorithm/tree/main/under-the-hood",
    period: { startDate: '2026-07-01', endDate: '2026-07-31', timezone: 'UTC' },
    generatedAt: '2026-08-08T23:59:59Z',
    postCount: '593',
    postLabels: [
      { label: 'FOSNR_VIOLENT_SPEECH', about: "Post detected in response to a user report to contain content in violation of X's Violent Content policy.", effect: "Post discoverability is restricted to the author's profile. All users can see a label explaining that the post has limited visibility.", posts: '1', totalPostsInMonth: '593', percentageOfPosts: '0.16%' },
      { label: 'NSFW_HIGH_PRECISION', about: "Post detected by automated systems or in response to a user report as likely to contain content subject to X's Adult Content policy.", effect: 'Post shown behind content warning, hidden from recommendations to non-followers and hidden from underage users, users without a stated age, and logged out users.', posts: '1', totalPostsInMonth: '593', percentageOfPosts: '0.16%' },
      { label: 'NSFW_HIGH_RECALL', about: "Post detected by automated systems as one that may contain content subject to X's Adult Content policy.", effect: 'Post hidden from recommendations to non-followers and from underage users, users without a stated age, and logged out users.', posts: '1', totalPostsInMonth: '593', percentageOfPosts: '0.16%' },
      { label: 'SPAM_HIGH_RECALL', about: 'Post detected by automated systems as one that may contain spam.', effect: 'Post hidden from recommendations to non-followers.', posts: '2', totalPostsInMonth: '593', percentageOfPosts: '0.33%' },
    ],
    accountLabels: [],
    totalAccountLabels: 0,
  };

  /* ================================================================
     Styles
     ================================================================ */
  const CSS = `
    :host {
      position: fixed; inset: 0; z-index: 2147483647; pointer-events: none;
      --bg: #000; --card: #16181c; --border: #2f3336;
      --text: #e7e9ea; --muted: #71767b;
      --blue: #1d9bf0; --green: #00ba7c; --red: #f4212e;
      --amber: #ffd400; --orange: #ff7a00; --pink: #f91880; --purple: #7856ff;
      font-family: "TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: var(--text);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    button { font: inherit; cursor: pointer; }

    .fab {
      position: fixed; right: 20px; bottom: 20px; pointer-events: auto;
      width: 52px; height: 52px; border-radius: 50%; border: none;
      background: var(--blue); color: #fff;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 18px rgba(29,155,240,.45);
      transition: transform .15s ease;
    }
    .fab:hover { transform: scale(1.08); }

    .overlay {
      position: fixed; inset: 0; pointer-events: none;
      background: rgba(91,112,131,.4); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; padding: 24px;
      opacity: 0; visibility: hidden; transition: opacity .18s ease, visibility .18s;
    }
    .overlay.open { opacity: 1; visibility: visible; pointer-events: auto; }

    .modal {
      width: 100%; max-width: 780px; max-height: 88vh; overflow-y: auto;
      background: var(--bg); border: 1px solid var(--border); border-radius: 16px;
      transform: translateY(10px) scale(.98); transition: transform .18s ease;
    }
    .overlay.open .modal { transform: none; }
    .modal::-webkit-scrollbar { width: 10px; }
    .modal::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }

    .mhead {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
      padding: 18px 20px 14px; border-bottom: 1px solid var(--border);
      position: sticky; top: 0; background: var(--bg); z-index: 2;
      border-radius: 16px 16px 0 0;
    }
    .mtitle { font-size: 18px; font-weight: 800; }
    .msub { font-size: 12.5px; color: var(--muted); margin-top: 3px; }
    .head-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
    .x { background: none; border: none; color: var(--muted); font-size: 16px; padding: 4px 8px; border-radius: 8px; }
    .x:hover { background: rgba(231,233,234,.1); color: var(--text); }

    .mbody { padding: 18px 20px 24px; }
    .mbody h3 { font-size: 14px; margin: 22px 0 10px; }
    .mbody h3 .count { color: var(--muted); font-weight: 400; font-size: 12.5px; margin-left: 6px; }

    .btn {
      background: var(--blue); color: #fff; border: none; border-radius: 999px;
      padding: 8px 18px; font-weight: 700; font-size: 13.5px;
    }
    .btn:hover { filter: brightness(1.1); }
    .btn.ghost { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn.ghost:hover { background: rgba(231,233,234,.08); }
    .btn.sm { padding: 5px 12px; font-size: 12.5px; }

    .drop {
      border: 2px dashed var(--border); border-radius: 14px;
      padding: 42px 20px; text-align: center; cursor: pointer;
      transition: border-color .15s, background .15s;
    }
    .drop.drag { border-color: var(--blue); background: rgba(29,155,240,.07); }
    .drop-ico { font-size: 34px; margin-bottom: 10px; }
    .drop-t { font-size: 15px; font-weight: 700; }
    .drop-s { font-size: 12.5px; color: var(--muted); margin-top: 6px; }
    .alt-actions { display: flex; gap: 10px; margin-top: 14px; justify-content: center; }

    #pasteWrap { margin-top: 14px; }
    #pasteArea {
      width: 100%; height: 130px; resize: vertical;
      background: var(--card); color: var(--text);
      border: 1px solid var(--border); border-radius: 10px; padding: 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11.5px;
    }
    #parseBtn { margin-top: 10px; width: 100%; }

    .err {
      margin-top: 14px; padding: 12px 14px; border-radius: 10px; font-size: 13.5px;
      background: rgba(244,33,46,.1); border: 1px solid rgba(244,33,46,.4); color: #ff8a90;
    }

    .verdict {
      display: flex; gap: 14px; align-items: center;
      padding: 14px 16px; border-radius: 12px; border: 1px solid;
    }
    .v-ico { font-size: 26px; }
    .v-title { font-weight: 800; font-size: 15px; }
    .v-sub { font-size: 13px; color: var(--muted); margin-top: 3px; line-height: 1.4; }
    .verdict.ok   { background: rgba(0,186,124,.07); border-color: rgba(0,186,124,.4); }
    .verdict.warn { background: rgba(255,212,0,.06); border-color: rgba(255,212,0,.35); }
    .verdict.bad  { background: rgba(244,33,46,.08); border-color: rgba(244,33,46,.45); }

    .stats { display: flex; align-items: center; gap: 20px; margin-top: 18px; flex-wrap: wrap; }
    .stat-cards { display: flex; gap: 10px; flex: 1; min-width: 280px; }
    .stat {
      flex: 1; background: var(--card); border: 1px solid var(--border);
      border-radius: 12px; padding: 14px 12px; text-align: center;
    }
    .s-num { font-size: 22px; font-weight: 800; }
    .s-lbl { font-size: 11.5px; color: var(--muted); margin-top: 4px; }
    .uth-donut { width: 132px; height: 132px; flex-shrink: 0; }
    .donut-num { fill: var(--text); font-size: 21px; font-weight: 800; }
    .donut-lbl { fill: var(--muted); font-size: 8.5px; letter-spacing: .5px; }

    .lcard {
      background: var(--card); border: 1px solid var(--border);
      border-left: 4px solid var(--lc, var(--purple));
      border-radius: 12px; padding: 14px 16px; margin-bottom: 10px;
    }
    .lrow { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .l-name { font-weight: 700; font-size: 14.5px; display: flex; align-items: center; gap: 8px; }
    .l-tag { font-size: 11px; color: var(--muted); margin-top: 3px; letter-spacing: .3px; }
    .l-count { font-size: 13px; margin-top: 10px; color: var(--text); }
    .l-count b { font-size: 15px; }
    .badge {
      font-size: 10.5px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase;
      padding: 3px 9px; border-radius: 999px; white-space: nowrap;
    }
    .bar { height: 6px; background: var(--border); border-radius: 999px; overflow: hidden; margin: 8px 0 12px; }
    .bar > i { display: block; height: 100%; background: var(--lc); border-radius: 999px; }
    .l-desc { font-size: 12.5px; color: var(--muted); line-height: 1.45; margin-top: 5px; }
    .l-desc b { color: var(--text); }

    .empty-ok {
      background: rgba(0,186,124,.07); border: 1px solid rgba(0,186,124,.35);
      border-radius: 12px; padding: 13px 16px; font-size: 13.5px;
    }

    .ins {
      display: flex; gap: 10px; align-items: flex-start;
      background: var(--card); border: 1px solid var(--border);
      border-radius: 10px; padding: 11px 13px; margin-bottom: 8px;
      font-size: 13.5px; line-height: 1.5;
    }
    .ins-ico { flex-shrink: 0; }

    .notes {
      margin-top: 20px; font-size: 11.5px; color: var(--muted); line-height: 1.5;
      border-top: 1px solid var(--border); padding-top: 14px; word-break: break-word;
    }
    .notes a { color: var(--blue); text-decoration: none; }
    .notes a:hover { text-decoration: underline; }

    details.raw { margin-top: 16px; }
    details.raw summary { cursor: pointer; font-size: 12.5px; color: var(--muted); }
    details.raw pre {
      margin-top: 10px; background: var(--card); border: 1px solid var(--border);
      border-radius: 10px; padding: 12px; overflow: auto; max-height: 300px;
      font-size: 11px; line-height: 1.5;
    }

    .toast {
      position: fixed; left: 50%; bottom: 90px; pointer-events: none;
      transform: translateX(-50%) translateY(10px);
      background: var(--text); color: #0f1419; padding: 8px 18px;
      border-radius: 999px; font-weight: 700; font-size: 13px;
      opacity: 0; transition: .2s ease;
    }
    .toast.show { opacity: 1; transform: translateX(-50%); }

    @media (max-width: 580px) {
      .stats { flex-direction: column; }
      .stat-cards { width: 100%; }
    }
  `;

  /* ================================================================
     Helpers
     ================================================================ */
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const humanize = (s) => String(s || 'Unknown label').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  const num = (v) => parseInt(String(v).replace(/[^0-9]/g, ''), 10) || 0;

  // X's export sometimes ships keys/values with stray whitespace — trim everything.
  function normalize(o) {
    if (Array.isArray(o)) return o.map(normalize);
    if (o && typeof o === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(o)) out[String(k).trim()] = normalize(v);
      return out;
    }
    if (typeof o === 'string') return o.trim();
    return o;
  }

  function fmtDate(s) {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  function linkify(s) {
    return escapeHtml(s).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }

  /* ================================================================
     Analysis
     ================================================================ */
  function analyze(data) {
    const d = normalize(data);
    const total = num(d.postCount);
    const postLabels = Array.isArray(d.postLabels) ? d.postLabels : [];
    const accountLabels = Array.isArray(d.accountLabels) ? d.accountLabels : [];

    let flagged = 0;
    const items = postLabels.map((l) => {
      const n = num(l.posts);
      flagged += n;
      return Object.assign({}, l, { _n: n });
    });

    return {
      total, flagged,
      clean: Math.max(total - flagged, 0),
      items, accountLabels,
      period: d.period || {},
      generatedAt: d.generatedAt || '',
      notes: d.notes || '',
      raw: d,
    };
  }

  function severityOf(effect) {
    const e = (effect || '').toLowerCase();
    if (e.includes("author's profile") || e.includes('removed')) return { name: 'High', bg: 'rgba(244,33,46,.15)', fg: '#ff7b82' };
    if (e.includes('content warning')) return { name: 'Medium', bg: 'rgba(249,24,128,.15)', fg: '#f973b1' };
    if (e.includes('hidden')) return { name: 'Reach limited', bg: 'rgba(255,212,0,.12)', fg: '#ffd400' };
    return { name: 'Info', bg: 'rgba(120,86,255,.15)', fg: '#a58bff' };
  }

  function verdict(r) {
    if (r.accountLabels.length) return {
      cls: 'bad', icon: '🚨',
      title: 'Account-level penalties detected',
      sub: r.accountLabels.length + ' label(s) affect your whole account — review the account section below.',
    };
    if (r.flagged) {
      const ratio = r.total ? r.flagged / r.total : 0;
      return ratio >= 0.1
        ? { cls: 'warn', icon: '⚠️', title: 'No account penalties — but notable post-level limits', sub: r.flagged + ' of ' + r.total + ' posts had limited reach. Details below.' }
        : { cls: 'ok', icon: '✅', title: 'No account-level penalties', sub: 'Your account is in good standing. Only ' + r.flagged + ' individual post' + (r.flagged === 1 ? '' : 's') + ' had limited out-of-network reach.' };
    }
    return { cls: 'ok', icon: '🎉', title: 'All clear', sub: 'No labels were applied to your account or posts in this period.' };
  }

  function buildInsights(r) {
    const out = [];
    if (!r.accountLabels.length) {
      out.push({ icon: '✅', text: 'No account-level labels — your profile itself is not throttled. Baseline distribution to your followers is intact.' });
    } else {
      out.push({ icon: '🚨', text: r.accountLabels.length + ' account-level label(s) detected — this affects your entire account\u2019s visibility.' });
    }
    let oon = 0, profileOnly = 0, warn = 0;
    for (const it of r.items) {
      const eff = (it.effect || '').toLowerCase();
      if (eff.includes("author's profile")) profileOnly += it._n;
      if (eff.includes('content warning')) warn += it._n;
      if (eff.includes('non-followers')) oon += it._n;
    }
    if (profileOnly) out.push({ icon: '⛔', text: profileOnly + ' post(s) were removed from recommendations entirely and only appear on your profile \u2014 the \u201CFreedom of Speech, Not Reach\u201D treatment.' });
    if (oon) out.push({ icon: '📉', text: oon + ' post(s) were hidden from the For You feeds of people who don\u2019t follow you. This caps viral (out-of-network) reach, but followers still see them.' });
    if (warn) out.push({ icon: '⚠️', text: warn + ' post(s) sit behind a sensitive-content warning, which suppresses the engagement signals (dwell time, likes, replies) the ranking system needs to amplify a post.' });
    if (r.flagged === 0) out.push({ icon: '🎉', text: 'Every post in this period passed all automated checks.' });
    else {
      const p = r.total ? ((r.flagged / r.total) * 100).toFixed(2) : '0';
      out.push({ icon: '🧮', text: 'Overall: ' + r.flagged + ' of ' + r.total + ' posts (' + p + '%) had limited reach. The remaining ' + r.clean + ' posts were fully eligible for recommendation.' });
    }
    return out;
  }

  function summaryText(r) {
    const lines = [
      'X "Under the Hood" report — ' + periodStr(r),
      'Posts analyzed: ' + r.total,
      'Posts limited: ' + r.flagged + ' (' + (r.total ? ((r.flagged / r.total) * 100).toFixed(2) : 0) + '%)',
      'Account labels: ' + (r.accountLabels.length ? r.accountLabels.length : 'none'),
      '',
    ];
    r.items.forEach((it) => lines.push('- ' + it.label + ': ' + it._n + ' post(s) — ' + (it.effect || '')));
    return lines.join('\n');
  }

  /* ================================================================
     Rendering
     ================================================================ */
  function periodStr(r) {
    const p = r.period || {};
    if (!p.startDate) return '';
    return fmtDate(p.startDate) + ' → ' + fmtDate(p.endDate) + (p.timezone ? ' · ' + p.timezone : '');
  }

  function donutSVG(cleanPct) {
    const rad = 44, c = 2 * Math.PI * rad;
    const greenLen = (c * cleanPct) / 100;
    return '' +
      '<svg class="uth-donut" viewBox="0 0 120 120">' +
      '<circle cx="60" cy="60" r="' + rad + '" fill="none" stroke="#f4212e" stroke-width="12"/>' +
      '<circle cx="60" cy="60" r="' + rad + '" fill="none" stroke="#00ba7c" stroke-width="12" ' +
      'stroke-dasharray="' + greenLen + ' ' + (c - greenLen) + '" stroke-dashoffset="' + (c / 4) + '"/>' +
      '<text x="60" y="58" text-anchor="middle" class="donut-num">' + cleanPct.toFixed(1) + '%</text>' +
      '<text x="60" y="74" text-anchor="middle" class="donut-lbl">FULLY VISIBLE</text>' +
      '</svg>';
  }

  function postLabelCard(it) {
    const m = LABEL_META[it.label] || Object.assign({}, FALLBACK_META, { title: humanize(it.label) });
    const sev = severityOf(it.effect);
    const pctv = it._total ? (it._n / it._total) * 100 : 0;
    const barW = Math.max(pctv, 1.2); // keep tiny slices visible
    return '' +
      '<div class="lcard" style="--lc:' + m.color + '">' +
      '<div class="lrow">' +
      '<div class="l-name"><span>' + m.icon + '</span>' + escapeHtml(m.title) + '</div>' +
      '<span class="badge" style="background:' + sev.bg + ';color:' + sev.fg + '">' + sev.name + '</span>' +
      '</div>' +
      '<div class="l-tag">' + escapeHtml(it.label || '') + ' · ' + escapeHtml(m.tag) + '</div>' +
      '<div class="l-count"><b>' + it._n + '</b> of ' + it._total.toLocaleString() + ' posts · ' + pctv.toFixed(2) + '%</div>' +
      '<div class="bar" title="' + pctv.toFixed(2) + '% of monthly posts"><i style="width:' + barW + '%"></i></div>' +
      '<div class="l-desc"><b>About:</b> ' + escapeHtml(it.about || '—') + '</div>' +
      '<div class="l-desc"><b>Effect:</b> ' + escapeHtml(it.effect || '—') + '</div>' +
      '</div>';
  }

  function accountLabelCard(a) {
    const label = typeof a === 'string' ? a : (a.label || 'UNKNOWN');
    const m = LABEL_META[label] || Object.assign({}, FALLBACK_META, { title: humanize(label) });
    return '' +
      '<div class="lcard" style="--lc:var(--red)">' +
      '<div class="lrow">' +
      '<div class="l-name"><span>' + m.icon + '</span>' + escapeHtml(m.title) + '</div>' +
      '<span class="badge" style="background:rgba(244,33,46,.15);color:#ff7b82">Critical</span>' +
      '</div>' +
      '<div class="l-tag">' + escapeHtml(label) + '</div>' +
      (typeof a === 'object' && a.about ? '<div class="l-desc" style="margin-top:8px"><b>About:</b> ' + escapeHtml(a.about) + '</div>' : '') +
      (typeof a === 'object' && a.effect ? '<div class="l-desc"><b>Effect:</b> ' + escapeHtml(a.effect) + '</div>' : '') +
      '</div>';
  }

  function reportHTML(r) {
    const v = verdict(r);
    const cleanPct = r.total ? (r.clean / r.total) * 100 : 100;
    const items = r.items.map((it) => Object.assign({}, it, { _total: r.total }));
    return '' +
      '<div class="mhead">' +
      '<div><div class="mtitle">Under the Hood Report</div>' +
      '<div class="msub">' + escapeHtml(periodStr(r)) + (r.generatedAt ? ' · generated ' + escapeHtml(fmtDate(r.generatedAt)) : '') + '</div></div>' +
      '<div class="head-actions">' +
      '<button class="btn ghost sm" id="copyBtn">Copy summary</button>' +
      '<button class="btn ghost sm" id="resetBtn">↺ New</button>' +
      '<button class="x" id="closeBtn">✕</button>' +
      '</div></div>' +
      '<div class="mbody">' +

      '<div class="verdict ' + v.cls + '">' +
      '<div class="v-ico">' + v.icon + '</div>' +
      '<div><div class="v-title">' + v.title + '</div><div class="v-sub">' + v.sub + '</div></div>' +
      '</div>' +

      '<div class="stats">' +
      '<div class="stat-cards">' +
      '<div class="stat"><div class="s-num">' + r.total.toLocaleString() + '</div><div class="s-lbl">Posts analyzed</div></div>' +
      '<div class="stat"><div class="s-num" style="color:' + (r.flagged ? 'var(--red)' : 'var(--green)') + '">' + r.flagged + '</div><div class="s-lbl">Posts limited</div></div>' +
      '<div class="stat"><div class="s-num" style="color:var(--green)">' + cleanPct.toFixed(1) + '%</div><div class="s-lbl">Fully visible</div></div>' +
      '</div>' +
      donutSVG(cleanPct) +
      '</div>' +

      '<h3>Post-level labels <span class="count">' + r.flagged + ' post' + (r.flagged === 1 ? '' : 's') + ' affected</span></h3>' +
      (items.length ? items.map(postLabelCard).join('') : '<div class="empty-ok">✅ No post-level labels in this period.</div>') +

      '<h3>Account-level labels</h3>' +
      (r.accountLabels.length ? r.accountLabels.map(accountLabelCard).join('') : '<div class="empty-ok">✅ No account labels — your profile is not throttled.</div>') +

      '<h3>What this means for your reach</h3>' +
      '<div class="insights">' + buildInsights(r).map((i) => '<div class="ins"><span class="ins-ico">' + i.icon + '</span><span>' + i.text + '</span></div>').join('') + '</div>' +

      (r.notes ? '<div class="notes">' + linkify(r.notes) + '</div>' : '') +
      '<details class="raw"><summary>Raw JSON (normalized)</summary><pre>' + escapeHtml(JSON.stringify(r.raw, null, 2)) + '</pre></details>' +
      '</div>';
  }

  function inputHTML() {
    return '' +
      '<div class="mhead">' +
      '<div><div class="mtitle">Under the Hood · Report Viewer</div>' +
      '<div class="msub">Turns your raw JSON export into a readable reach report — everything stays on your device</div></div>' +
      '<button class="x" id="closeBtn">✕</button>' +
      '</div>' +
      '<div class="mbody">' +
      '<div class="drop" id="drop">' +
      '<div class="drop-ico">📂</div>' +
      '<div class="drop-t">Drop your <b>under-the-hood.json</b> here</div>' +
      '<div class="drop-s">or click to browse · Settings → Under the Hood → Download JSON</div>' +
      '<input type="file" id="file" accept=".json,application/json" hidden>' +
      '</div>' +
      '<div class="alt-actions">' +
      '<button class="btn ghost" id="pasteToggle">Paste JSON instead</button>' +
      '<button class="btn ghost" id="sampleBtn">Load sample report</button>' +
      '</div>' +
      '<div id="pasteWrap" hidden>' +
      '<textarea id="pasteArea" spellcheck="false" placeholder=\'{"postCount":"593","postLabels":[...],"accountLabels":[]}\'></textarea>' +
      '<button class="btn" id="parseBtn">Analyze</button>' +
      '</div>' +
      '<div class="err" id="err" hidden></div>' +
      '</div>';
  }

  /* ================================================================
     Mount UI (shadow DOM so X's CSS can't touch it)
     ================================================================ */
  const hostEl = document.createElement('div');
  (document.body || document.documentElement).appendChild(hostEl);
  const root = hostEl.attachShadow({ mode: 'open' });
  root.innerHTML =
    '<style>' + CSS + '</style>' +
    '<button class="fab" id="fab" title="Parse X Under-the-Hood report (Alt+U)">' +
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M4 20h3V9H4v11zm6.5 0h3V4h-3v16zM17 20h3v-7h-3v7z"/></svg>' +
    '</button>' +
    '<div class="overlay" id="overlay"><div class="modal" id="modal"></div></div>' +
    '<div class="toast" id="toast"></div>';

  const $ = (s) => root.querySelector(s);
  const modal = $('#modal');
  const overlay = $('#overlay');
  let lastReport = null;

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 1800);
  }

  function open() { overlay.classList.add('open'); }
  function close() { overlay.classList.remove('open'); }

  function showInput() {
    modal.innerHTML = inputHTML();
    const q = (s) => modal.querySelector(s);
    const drop = q('#drop'), file = q('#file');

    drop.addEventListener('click', () => file.click());
    file.addEventListener('change', () => { if (file.files[0]) readFile(file.files[0]); });
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('drag'); }));
    drop.addEventListener('drop', (e) => {
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) readFile(f);
    });
    q('#pasteToggle').addEventListener('click', () => { const w = q('#pasteWrap'); w.hidden = !w.hidden; });
    q('#parseBtn').addEventListener('click', () => tryParse(q('#pasteArea').value));
    q('#sampleBtn').addEventListener('click', () => tryParse(SAMPLE));
    q('#closeBtn').addEventListener('click', close);
  }

  function showReport(r) {
    modal.innerHTML = reportHTML(r);
    const q = (s) => modal.querySelector(s);
    q('#closeBtn').addEventListener('click', close);
    q('#resetBtn').addEventListener('click', showInput);
    q('#copyBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(summaryText(lastReport))
        .then(() => toast('Summary copied to clipboard'))
        .catch(() => toast('Copy failed'));
    });
    modal.scrollTop = 0;
  }

  function showErr(msg) {
    const e = modal.querySelector('#err');
    if (e) { e.textContent = '⚠️ ' + msg; e.hidden = false; }
  }

  function tryParse(src) {
    let data = src;
    if (typeof src === 'string') {
      try { data = JSON.parse(src); }
      catch (e) { return showErr('That is not valid JSON — ' + e.message); }
    }
    try {
      const norm = normalize(data);
      if (norm.postLabels === undefined && norm.accountLabels === undefined) {
        return showErr('This JSON does not look like an Under the Hood export (missing postLabels / accountLabels).');
      }
      lastReport = analyze(norm);
      showReport(lastReport);
    } catch (e) {
      showErr('Could not analyze this report: ' + e.message);
    }
  }

  function readFile(f) {
    const fr = new FileReader();
    fr.onload = () => tryParse(String(fr.result));
    fr.onerror = () => showErr('Could not read that file.');
    fr.readAsText(f);
  }

  $('#fab').addEventListener('click', () => { if (!overlay.classList.contains('open')) showInput(); open(); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); if (!overlay.classList.contains('open')) showInput(); open(); }
    if (e.key === 'Escape') close();
  });
})();// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2026-08-15
// @description  try to take over the world!
// @author       You
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
})();
