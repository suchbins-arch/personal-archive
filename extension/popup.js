// Archivault Collector - popup.js

const ALL_TAGS = ["AI","미래","테크","생산성","집중력","자기계발","논문","멀티모달"];
const ARCHIVAULT_URL = "http://localhost:3001"; // 배포 후 변경

let pageInfo = null;
let tags = [];

const typeLabel = {
  web:     { icon: "🌐", label: "웹",     cls: "type-web" },
  youtube: { icon: "▶",  label: "YouTube", cls: "type-youtube" },
  pdf:     { icon: "📄", label: "PDF",     cls: "type-pdf" },
};

// DOM refs
const $badge  = document.getElementById("type-badge");
const $title  = document.getElementById("page-title");
const $url    = document.getElementById("page-url");
const $wrap   = document.getElementById("tags-wrap");
const $input  = document.getElementById("tag-input");
const $suggest= document.getElementById("tag-suggest");
const $memo   = document.getElementById("memo");
const $save   = document.getElementById("save-btn");
const $toast  = document.getElementById("toast");
const $count  = document.getElementById("count-badge");
const $open   = document.getElementById("open-btn");
const $export = document.getElementById("export-btn");

// ── 초기화 ──────────────────────────────────────────────
async function init() {
  updateCount();
  renderSuggest();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  try {
    const info = await chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_INFO" });
    pageInfo = info;
    renderPageInfo(info);
  } catch {
    // content script 아직 미삽입 (새 탭 등) - fallback
    pageInfo = { url: tab.url, title: tab.title, type: detectTypeFromUrl(tab.url) };
    renderPageInfo(pageInfo);
  }
}

function detectTypeFromUrl(url = "") {
  if (/youtube\.com\/watch|youtu\.be\//.test(url)) return "youtube";
  if (/\.pdf($|\?)/.test(url)) return "pdf";
  return "web";
}

function renderPageInfo(info) {
  const t = typeLabel[info.type] || typeLabel.web;
  $badge.textContent = t.icon + " " + t.label;
  $badge.className = "type-badge " + t.cls;
  $title.textContent = info.title || info.url;
  $url.textContent   = info.url;
}

// ── 태그 ──────────────────────────────────────────────
function renderTags() {
  // chip들 제거 후 재렌더
  $wrap.querySelectorAll(".tag-chip").forEach(el => el.remove());
  tags.forEach(tag => {
    const chip = document.createElement("span");
    chip.className = "tag-chip";
    chip.innerHTML = `${tag}<span class="rm" data-tag="${tag}">×</span>`;
    chip.querySelector(".rm").addEventListener("click", () => removeTag(tag));
    $wrap.insertBefore(chip, $input);
  });
}

function addTag(tag) {
  tag = tag.trim().replace(/,/g, "");
  if (!tag || tags.includes(tag)) return;
  tags.push(tag);
  renderTags();
  renderSuggest();
}

function removeTag(tag) {
  tags = tags.filter(t => t !== tag);
  renderTags();
  renderSuggest();
}

function renderSuggest() {
  $suggest.innerHTML = "";
  ALL_TAGS.filter(t => !tags.includes(t)).forEach(t => {
    const btn = document.createElement("button");
    btn.textContent = "# " + t;
    btn.addEventListener("click", () => addTag(t));
    $suggest.appendChild(btn);
  });
}

$input.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    addTag($input.value);
    $input.value = "";
  }
  if (e.key === "Backspace" && !$input.value && tags.length) {
    removeTag(tags[tags.length - 1]);
  }
});

$wrap.addEventListener("click", () => $input.focus());

// ── 저장 ──────────────────────────────────────────────
$save.addEventListener("click", async () => {
  if (!pageInfo) return;
  $save.disabled = true;

  const article = {
    id: Date.now().toString(),
    url:     pageInfo.url,
    title:   pageInfo.title || pageInfo.url,
    type:    pageInfo.type || "web",
    tags:    tags.length ? tags : ["미분류"],
    addedAt: new Date().toISOString(),
    status:  "archive",
    memo:    $memo.value.trim(),
    an: null,  // AI 분석은 웹앱에서 추가
    _description: pageInfo.description || "",
  };

  const { archivault_articles = [] } = await chrome.storage.local.get("archivault_articles");
  archivault_articles.unshift(article);
  await chrome.storage.local.set({ archivault_articles });

  updateCount();
  showToast("✓ 저장 완료!");
  $save.disabled = false;
});

// ── 카운트 ──────────────────────────────────────────────
async function updateCount() {
  const { archivault_articles = [] } = await chrome.storage.local.get("archivault_articles");
  $count.textContent = archivault_articles.length;
}

// ── 토스트 ──────────────────────────────────────────────
function showToast(msg) {
  $toast.textContent = msg;
  $toast.style.display = "block";
  setTimeout(() => { $toast.style.display = "none"; }, 2000);
}

// ── 아카이브 열기 ──────────────────────────────────────────────
$open.addEventListener("click", () => {
  chrome.tabs.create({ url: ARCHIVAULT_URL });
});

// ── JSON 내보내기 ──────────────────────────────────────────────
$export.addEventListener("click", async () => {
  const { archivault_articles = [] } = await chrome.storage.local.get("archivault_articles");
  const json = JSON.stringify(archivault_articles, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `archivault_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("📤 JSON 내보내기 완료");
});

init();
