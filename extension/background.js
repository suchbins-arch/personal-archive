// Archivault Collector - background service worker

// 확장 설치/업데이트 시 초기화
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("archivault_articles", (result) => {
    if (!result.archivault_articles) {
      chrome.storage.local.set({ archivault_articles: [] });
    }
  });
});

// 웹앱 탭에서 "import 요청" 메시지 수신
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_ARTICLES") {
    chrome.storage.local.get("archivault_articles", (result) => {
      sendResponse({ articles: result.archivault_articles || [] });
    });
    return true; // async response
  }

  if (msg.type === "CLEAR_ARTICLES") {
    chrome.storage.local.set({ archivault_articles: [] }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});
