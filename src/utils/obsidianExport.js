export function toObsidianMarkdown(article) {
  const a = article.an;
  const date = new Date(article.addedAt).toISOString().slice(0, 10);
  const tagsYaml = (article.tags || []).map(t => `"${t}"`).join(", ");

  const list = (arr) => (arr || []).map(i => `- ${i}`).join("\n") || "—";
  const numbered = (arr) => (arr || []).map((p, i) => `${i + 1}. ${p}`).join("\n") || "—";
  const chips = (arr) => (arr || []).map(t => `[[${t}]]`).join(" ") || "";
  const text = (s) => s || "—";

  const memo = article.memo ? `\n---\n\n## 메모\n${article.memo}` : "";

  return `---
title: "${article.title.replace(/"/g, "'")}"
url: ${article.url}
type: ${article.type}
tags: [${tagsYaml}]
date: ${date}
status: archive
source: Archivault
---

# ${article.title}

> 수집일: ${date} | [원본 링크](${article.url})

---

## 요약
${text(a?.summary)}

## 목적
${text(a?.purpose)}

## 의제
${list(a?.agenda)}

## 쟁점
${list(a?.issues)}

---

## 후속조치

| 항목 | 내용 |
|------|------|
| **무엇을** | ${text(a?.fw?.what)} |
| **누가** | ${text(a?.fw?.who)} |
| **언제** | ${text(a?.fw?.when)} |

---

## 개요
${text(a?.overview)}

## 핵심 내용
${numbered(a?.keyPoints)}

## 기술적 세부사항
${text(a?.technical)}

## 철학적 세부사항
${text(a?.philosophical)}

## 실용적 시사점
${text(a?.practical)}

## 비판적 관점
${text(a?.critical)}

## 결론
${text(a?.conclusion)}

---

## 관련 주제
${chips(a?.relatedTopics)}
${memo}
`.trim();
}

export function toFilename(article) {
  const d = new Date(article.addedAt);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const safe = article.title
    .replace(/[\\/:*?"<>|]/g, "")
    .trim()
    .slice(0, 60);
  return `${yy}.${mm}.${dd} - ${safe}.md`;
}
