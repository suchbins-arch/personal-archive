// 페이지 정보 추출 content script

function detectType(url) {
  if (/youtube\.com\/watch|youtu\.be\//.test(url)) return "youtube";
  if (/\.pdf($|\?)/.test(url) || document.contentType === "application/pdf") return "pdf";
  return "web";
}

function extractYouTubeMeta() {
  const title = document.querySelector('meta[name="title"]')?.content
    || document.querySelector('yt-formatted-string.ytd-video-primary-info-renderer')?.textContent
    || document.title.replace(/ - YouTube$/, "");
  const description = document.querySelector('meta[name="description"]')?.content || "";
  const channel = document.querySelector('ytd-channel-name a')?.textContent?.trim() || "";
  return { title, description, channel };
}

function extractWebMeta() {
  const title = document.querySelector('meta[property="og:title"]')?.content
    || document.querySelector('meta[name="title"]')?.content
    || document.title;
  const description = document.querySelector('meta[property="og:description"]')?.content
    || document.querySelector('meta[name="description"]')?.content
    || "";
  // 본문 텍스트 (처음 500자)
  const body = document.querySelector('article, main, [role="main"]')
    || document.body;
  const text = body.innerText.replace(/\s+/g, " ").trim().slice(0, 500);
  return { title, description, text };
}

function getPageInfo() {
  const url = location.href;
  const type = detectType(url);
  let info = { url, type };

  if (type === "youtube") {
    const meta = extractYouTubeMeta();
    Object.assign(info, meta);
  } else {
    const meta = extractWebMeta();
    Object.assign(info, meta);
  }
  return info;
}

// popup.js 로부터 메시지 수신
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_PAGE_INFO") {
    sendResponse(getPageInfo());
  }
});
