import { useState, useEffect } from "react";
import { getOrPickDirectory, writeMarkdownFile, clearHandle, getSavedFolderName } from "./utils/fsHandle";
import { toObsidianMarkdown, toFilename } from "./utils/obsidianExport";

function makeColors(dark) {
  if (dark) {
    return {
      bg:"#080B0F",sb:"#0A0F14",sf:"#0E1318",cd:"#111820",
      bd:"#1E2A35",mt:"#2A3A4A",
      ac:"#00D4FF",aBg:"rgba(0,212,255,0.08)",aBd:"rgba(0,212,255,0.22)",
      gd:"#F5C842",em:"#FF6B35",rd:"#FF6B6B",
      t1:"#E8F0F8",t2:"#7A9BB5",t3:"#3D5870",
      hd:"rgba(8,11,15,0.95)",
    };
  }
  return {
    bg:"#F1F5F9",sb:"#FFFFFF",sf:"#FFFFFF",cd:"#F8FAFC",
    bd:"#E2E8F0",mt:"#CBD5E0",
    ac:"#0284C7",aBg:"rgba(2,132,199,0.07)",aBd:"rgba(2,132,199,0.2)",
    gd:"#D97706",em:"#EA580C",rd:"#DC2626",
    t1:"#0F172A",t2:"#475569",t3:"#94A3B8",
    hd:"rgba(241,245,249,0.96)",
  };
}

var LINKS = {
  "AI": [
    { label:"Andrej Karpathy - Intro to LLMs", type:"youtube", url:"https://www.youtube.com/watch?v=zjkBMFhNj_g" },
    { label:"3Blue1Brown - Neural Networks", type:"youtube", url:"https://www.youtube.com/watch?v=aircAruvnKk" },
    { label:"Papers With Code - AI SOTA", type:"web", url:"https://paperswithcode.com" },
    { label:"Google Scholar: AI 2025 trends", type:"scholar", url:"https://scholar.google.com/scholar?q=AI+2025+trends" },
    { label:"Hugging Face Blog", type:"web", url:"https://huggingface.co/blog" },
  ],
  "미래": [
    { label:"TED - The next global superpower", type:"youtube", url:"https://www.youtube.com/watch?v=4Y9V8UHFQkM" },
    { label:"MIT Technology Review", type:"web", url:"https://www.technologyreview.com" },
    { label:"Google Scholar: future of work", type:"scholar", url:"https://scholar.google.com/scholar?q=future+of+work+AI" },
  ],
  "테크": [
    { label:"Fireship - Tech in 100 seconds", type:"youtube", url:"https://www.youtube.com/c/Fireship" },
    { label:"Hacker News", type:"web", url:"https://news.ycombinator.com" },
    { label:"The Verge", type:"web", url:"https://www.theverge.com" },
  ],
  "생산성": [
    { label:"Ali Abdaal - Productivity YouTube", type:"youtube", url:"https://www.youtube.com/@aliabdaal" },
    { label:"Cal Newport - Deep Work talks", type:"youtube", url:"https://www.youtube.com/results?search_query=cal+newport+deep+work" },
    { label:"Ness Labs - Neuroscience of productivity", type:"web", url:"https://nesslabs.com" },
    { label:"Google Scholar: deep work research", type:"scholar", url:"https://scholar.google.com/scholar?q=deep+work+focus+research" },
  ],
  "집중력": [
    { label:"Andrew Huberman - Focus Protocol", type:"youtube", url:"https://www.youtube.com/watch?v=LG53Vxum0as" },
    { label:"Huberman Lab Podcast - Attention", type:"youtube", url:"https://www.youtube.com/results?search_query=huberman+focus+attention" },
    { label:"Google Scholar: attention neuroplasticity", type:"scholar", url:"https://scholar.google.com/scholar?q=attention+neuroplasticity+focus" },
  ],
  "자기계발": [
    { label:"Thomas Frank - Study Tips", type:"youtube", url:"https://www.youtube.com/@ThomasFrankExplains" },
    { label:"Blinkist - Book summaries", type:"web", url:"https://www.blinkist.com" },
  ],
  "논문": [
    { label:"arXiv - Latest preprints", type:"web", url:"https://arxiv.org" },
    { label:"Semantic Scholar", type:"scholar", url:"https://www.semanticscholar.org" },
    { label:"Google Scholar", type:"scholar", url:"https://scholar.google.com" },
    { label:"Two Minute Papers - Paper reviews", type:"youtube", url:"https://www.youtube.com/@TwoMinutePapers" },
  ],
  "멀티모달": [
    { label:"Yannic Kilcher - Paper reviews", type:"youtube", url:"https://www.youtube.com/@YannicKilcher" },
    { label:"arXiv: multimodal learning", type:"scholar", url:"https://arxiv.org/search/?query=multimodal+learning&searchtype=all" },
    { label:"CLIP Paper - OpenAI", type:"web", url:"https://openai.com/research/clip" },
  ],
  "default": [
    { label:"Google Scholar 검색", type:"scholar", url:"https://scholar.google.com" },
    { label:"YouTube 강의 검색", type:"youtube", url:"https://www.youtube.com" },
    { label:"Wikipedia", type:"web", url:"https://ko.wikipedia.org" },
  ],
};
function getLinks(tag) { return LINKS[tag] || LINKS["default"]; }

var linkTypeStyle = {
  youtube: { icon:"▶", color:"#FF4444", label:"YouTube" },
  scholar: { icon:"🎓", color:"#4285F4", label:"Scholar" },
  web:     { icon:"🌐", color:"#00D4FF", label:"Web" },
};

var ARTS = [
  {
    id:"1", url:"https://nature.com/articles/ai-2025",
    title:"AI의 미래와 인간의 역할: 2025년 전망",
    type:"web", tags:["AI","미래","테크"],
    addedAt:new Date(Date.now()-86400000*1).toISOString(),
    status:"archive", memo:"25.03.04\n인간-AI 협업 부분 다시 읽어볼 것.",
    an:{
      purpose:"AI 기술 발전에 따른 인간의 역할 재정의와 미래 사회 변화 방향을 다각도로 제시한다. 단순한 기술 전망을 넘어 개인·조직·사회 차원의 적응 전략까지 포괄적으로 다룬다.",
      agenda:["인간-AI 협업 모델","AGI 전환점 시나리오","노동시장 재편"],
      issues:["AI 윤리와 규제 공백","디지털 양극화 심화 우려","교육 시스템 적응 속도"],
      summary:"2025년 AI는 단순 도구를 넘어 협력자로 전환되고 있다. 핵심은 AI가 인간을 대체하는 것이 아닌 능력을 증폭시키는 방향으로의 설계이다. 선제적으로 적응하는 개인과 조직이 경쟁 우위를 점할 것이다.",
      fw:{
        what:"ChatGPT·Gemini 등 AI 도구를 일상 업무에 1가지 이상 도입하세요. 이메일 초안 작성, 회의록 요약, 브레인스토밍 등 반복 업무부터 시작하는 것이 가장 효과적입니다.",
        who:"직장인·프리랜서·학생 누구든, AI 도구를 아직 적극 활용하지 않는 모든 분",
        when:"이번 주 내로 하나의 AI 도구를 선택해 3일 연속 사용해보기. 30일 후 업무 효율 변화를 체크하세요.",
      },
      overview:"이 보고서는 AI 기술이 2025년을 기점으로 도구에서 협력자로 패러다임이 전환된다는 핵심 주장을 담고 있다.",
      keyPoints:["AGI 도달 가능성: 연구자 65%가 2027~2030년으로 예측","Copilot 모델 주류화: 인간 판단 + AI 실행의 협업 구조가 업무 표준이 됨","재교육 필수: 현 직업의 40%가 AI로 부분 대체될 전망","규제 프레임워크 정비 시급: EU AI Act 이후 각국 법제화 속도 차이 심화"],
      technical:"대형 언어 모델(LLM)의 추론 능력 향상과 멀티모달 처리가 핵심 기술 트렌드다.",
      philosophical:"이 시대의 근본적 질문은 무엇이 인간다움인가이다.",
      practical:"당장 실행 가능한 3가지 전략: 첫째, AI 사용 일지 작성. 둘째, 프롬프트 라이브러리 구축. 셋째, 다양한 AI 도구 비교 테스트.",
      critical:"이 보고서는 AI 전환의 긍정적 측면에 지나치게 편향되어 있다.",
      conclusion:"AI 전환기는 두려워할 위협이 아니라 적극적으로 활용할 기회다.",
      relatedTopics:["머신러닝","디지털 전환","미래 노동","AGI","HCI","AI 윤리"],
    },
  },
  {
    id:"2", url:"https://youtube.com/watch?v=deepwork",
    title:"딥워크(Deep Work): 집중력의 경제학",
    type:"youtube", tags:["생산성","집중력","자기계발"],
    addedAt:new Date(Date.now()-86400000*3).toISOString(),
    status:"archive", memo:"25.03.02\n주 5회 2시간 딥워크 블록 시작해보기.",
    an:{
      purpose:"정보 과잉 시대에 깊은 집중력(Deep Work)이 왜 가장 희귀하고 가치 있는 능력인지를 체계적으로 설명하고, 누구나 실천 가능한 구체적 훈련법을 제시한다.",
      agenda:["딥워크의 정의와 경제적 가치","얕은 작업의 함정과 위험성","집중력 훈련 실전 방법"],
      issues:["스마트폰·SNS 알림으로 인한 집중력 파편화","즉각 응답을 요구하는 직장 문화 압박","딥워크 환경 물리적 조성의 어려움"],
      summary:"컴퓨터 과학자 캘 뉴포트의 저서 기반 영상 강의. 하루 4시간의 진정한 집중이 8시간의 분산된 작업보다 생산성이 높다는 실증 데이터를 제시한다.",
      fw:{
        what:"오늘 저녁, 내일 오전 2시간의 방해금지 집중 블록을 캘린더에 추가하세요.",
        who:"산만한 환경 때문에 중요한 일을 미루고 있는 직장인, 공부 집중이 안 되는 학생",
        when:"당장 내일 오전 첫 2시간을 딥워크 시간으로 확보. 21일 연속 실천 후 효과를 체크하세요.",
      },
      overview:"현대 지식 노동자를 위한 집중력 관리 방법론을 체계적으로 제시하는 교육 콘텐츠다.",
      keyPoints:["딥워크 vs 얕은작업: 하루 4시간 딥워크 = 8시간 분산 작업 이상의 성과","시간 블록 스케줄링: 하루를 90분 단위 블록으로 나눠 집중/휴식 교대","디지털 미니멀리즘: SNS·이메일 확인 시간을 하루 2회로 제한","저녁 셧다운 루틴: 매일 같은 시간에 업무 완전 종료"],
      technical:"신경과학적 근거: 딥워크 중 뇌는 기본 모드 네트워크(DMN)를 억제하고 실행 네트워크를 활성화한다.",
      philosophical:"뉴포트는 딥워크를 단순한 생산성 기술이 아닌 삶의 철학으로 다룬다.",
      practical:"즉시 실행 가능한 3단계: 1단계 매일 오전 첫 25분 집중. 2단계 90분으로 확장. 3단계 하루 2개 딥워크 블록 정착.",
      critical:"딥워크 방법론의 한계: 고립된 개인 작업을 지나치게 이상화하여 팀 협업이 필수인 직군에는 적용이 어렵다.",
      conclusion:"딥워크는 하루아침에 완성되지 않지만 매일 조금씩 쌓이는 습관이다.",
      relatedTopics:["생산성","시간관리","마음챙김","포모도로","뇌과학","디지털 미니멀리즘"],
    },
  },
  {
    id:"3", url:"https://arxiv.org/abs/2024.12345",
    title:"제로샷 러닝과 멀티모달 추론: 최신 연구 동향",
    type:"pdf", tags:["AI","논문","멀티모달"],
    addedAt:new Date(Date.now()-86400000*5).toISOString(),
    status:"archive", memo:"",
    an:{
      purpose:"제로샷 러닝(Zero-Shot Learning) 기법의 최신 발전이 멀티모달 환경에서 어떻게 적용되는지 탐구하고 실용화 가능성을 실증한다.",
      agenda:["제로샷 러닝 핵심 메커니즘","멀티모달 데이터 통합 방법론","실제 벤치마크 성능 비교 분석"],
      issues:["학습 데이터의 도메인 편향 문제","높은 계산 비용 최적화 과제","특수 도메인에서의 일반화 한계"],
      summary:"최신 제로샷 러닝 기법이 멀티모달 태스크에서 기존 파인튜닝 방식을 능가하는 시나리오를 실증적으로 분석한 연구 논문.",
      fw:{
        what:"Google Lens, ChatGPT Vision 같은 멀티모달 AI 도구를 써보며 이 기술의 현재 수준을 체험하세요.",
        who:"AI 기술 동향이 궁금한 일반인, IT 기획자, 비즈니스 의사결정자",
        when:"이번 주 중 Google Lens나 ChatGPT의 이미지 분석 기능을 한 번 사용해보세요.",
      },
      overview:"arXiv에 게재된 이 논문은 AI 학습 방식의 근본적 변화를 다룬다.",
      keyPoints:["제로샷 성능 SOTA 달성: 레이블 데이터 없이 기존 파인튜닝 모델을 능가","크로스 어텐션 개선: 이미지-텍스트 간 상호 참조 메커니즘 혁신","추론 속도 40% 향상","오픈소스 공개: GitHub에 코드 및 모델 가중치 공개"],
      technical:"핵심 기술은 Cross-Modal Attention Mechanism의 개선이다.",
      philosophical:"제로샷 러닝은 인간의 학습 방식을 AI에 적용하려는 근본적 시도다.",
      practical:"비전공자를 위한 실용적 의미: AI 앱 개발 시 방대한 학습 데이터가 필요 없어져 스타트업도 강력한 AI 서비스를 만들 수 있게 된다.",
      critical:"연구의 한계: 의료·법률 등 고위험 도메인에서는 여전히 정확도가 낮아 즉시 실용화는 어렵다.",
      conclusion:"제로샷 멀티모달 러닝은 실용화 단계에 진입했다.",
      relatedTopics:["딥러닝","컴퓨터비전","자연어처리","CLIP","Foundation Model","AGI"],
    },
  },
  {
    id:"t1", url:"https://example.com/old-seo",
    title:"구식 SEO 전략 가이드 2019",
    type:"web", tags:["SEO"],
    addedAt:new Date(Date.now()-86400000*20).toISOString(),
    trashedAt:new Date(Date.now()-86400000*5).toISOString(),
    status:"trash", memo:"", an:null,
  },
];

var TC={web:"#00D4FF",youtube:"#FF4444",pdf:"#F5C842"};
var TI={web:"🌐",youtube:"▶",pdf:"📄"};
var TL={web:"Web",youtube:"YouTube",pdf:"PDF"};
function fmtDate(iso){return new Date(iso).toLocaleDateString("ko-KR",{month:"short",day:"numeric"});}
function fmtYMD(d){return String(d.getFullYear()).slice(2)+"."+String(d.getMonth()+1).padStart(2,"0")+"."+String(d.getDate()).padStart(2,"0");}

function MiniList(props){
  var C=props.C,color=props.color;
  return React.createElement("div",{style:{padding:"13px 15px",background:C.sf,border:"1px solid "+color+"22",borderRadius:12}},
    React.createElement("div",{style:{fontSize:11,fontWeight:700,color:color,marginBottom:8}},props.label),
    React.createElement("ul",{style:{listStyle:"none"}},
      (props.items||[]).map(function(item,i){
        return React.createElement("li",{key:i,style:{fontSize:12,color:C.t2,display:"flex",gap:6,marginBottom:6,lineHeight:1.55}},
          React.createElement("span",{style:{color:color,flexShrink:0}},(i+1)+"."),item);
      })
    )
  );
}
function DetailBlock(props){
  var C=props.C;
  return React.createElement("div",{style:{gridColumn:props.wide?"1/-1":undefined,padding:"15px",background:C.sf,border:"1px solid "+C.bd,borderRadius:12}},
    React.createElement("div",{style:{fontSize:12,fontWeight:700,color:C.t1,marginBottom:11,display:"flex",alignItems:"center",gap:6,borderBottom:"1px solid "+C.bd,paddingBottom:8,fontFamily:"'Syne',sans-serif"}},
      props.icon+" "+props.label),
    props.children
  );
}
function ExpandText(props){
  var C=props.C;
  var text=props.text||"";
  var limit=props.limit||120;
  var [exp,setExp]=useState(false);
  var short=text.length>limit;
  var shown=exp||!short?text:text.slice(0,limit)+"…";
  return React.createElement("div",null,
    React.createElement("p",{style:{fontSize:props.size||12,color:C.t2,lineHeight:1.65,marginBottom:4}},shown),
    short&&React.createElement("button",{
      onClick:function(e){e.stopPropagation();setExp(function(v){return !v;});},
      style:{fontSize:11,color:C.ac,background:"transparent",border:"none",cursor:"pointer",padding:0,fontWeight:500}
    },exp?"접기 ↑":"더보기 →")
  );
}
function LinkChip(props){
  var C=props.C,lk=props.link;
  var ts=linkTypeStyle[lk.type]||linkTypeStyle.web;
  return React.createElement("a",{
    href:lk.url,target:"_blank",rel:"noopener noreferrer",
    style:{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:6,border:"1px solid "+ts.color+"33",background:ts.color+"0D",color:ts.color,fontSize:11,fontWeight:500,textDecoration:"none",cursor:"pointer",flexShrink:0}
  },
    React.createElement("span",{style:{fontSize:10}},ts.icon),
    lk.label
  );
}

function BriefingTab(props){
  var C=props.C,top3=props.top3,catInsights=props.catInsights,conn=props.conn,onOpen=props.onOpen;
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:14}},
    React.createElement("div",{style:{padding:"16px",background:C.sf,border:"1px solid "+C.gd+"22",borderRadius:13}},
      React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.gd,letterSpacing:"0.06em",marginBottom:12}},"⚡ 이번 주 핵심 3가지"),
      top3.map(function(item,i){
        return React.createElement("div",{
          key:i,
          onClick:function(){if(item.id&&onOpen)onOpen(item.id);},
          style:{display:"flex",gap:10,padding:"10px 12px",background:C.cd,borderRadius:9,marginBottom:7,cursor:item.id?"pointer":"default",transition:"opacity 0.15s"}
        },
          React.createElement("span",{style:{fontFamily:"'Syne'",fontWeight:800,fontSize:18,color:C.gd+"55",flexShrink:0,lineHeight:1}},String(i+1).padStart(2,"0")),
          React.createElement("div",{style:{flex:1,minWidth:0}},
            React.createElement("p",{style:{fontSize:13,fontWeight:600,color:item.id?C.ac:C.t1,marginBottom:5}},(item.id?"↗ ":"")+item.title),
            React.createElement(ExpandText,{C:C,text:item.insight,limit:100,size:12}),
            item.id&&React.createElement("span",{style:{fontSize:10,color:C.t3,marginTop:4,display:"block"}},"클릭하면 자료로 이동합니다")
          )
        );
      })
    ),
    React.createElement("div",{style:{padding:"16px",background:C.sf,border:"1px solid "+C.gd+"22",borderRadius:13}},
      React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.gd,letterSpacing:"0.06em",marginBottom:14}},"📂 카테고리별 종합 — 배울점"),
      catInsights.map(function(cat){
        return React.createElement("div",{key:cat.tag,style:{marginBottom:18,paddingBottom:18,borderBottom:"1px solid "+C.bd}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:10}},
            React.createElement("span",{style:{padding:"3px 10px",borderRadius:5,border:"1px solid "+C.aBd,background:C.aBg,color:C.ac,fontSize:11,fontWeight:600}},"#"+cat.tag),
            React.createElement("span",{style:{fontSize:11,color:C.t3}},cat.count+"개 자료")
          ),
          cat.arts.map(function(art,ai){
            return React.createElement("div",{
              key:ai,
              onClick:function(){if(art.id&&onOpen)onOpen(art.id);},
              style:{padding:"10px 12px",background:C.cd,borderRadius:9,marginBottom:8,cursor:art.id?"pointer":"default"}
            },
              React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}},
                React.createElement("p",{style:{fontSize:12,fontWeight:600,color:art.id?C.ac:C.t1}},(art.id?"↗ ":"")+"📄 "+art.title),
                art.id&&React.createElement("span",{style:{fontSize:9,color:C.t3,flexShrink:0,marginLeft:6}},"자료 보기")
              ),
              React.createElement(ExpandText,{C:C,text:art.summary,limit:90,size:11}),
              art.points.length>0&&React.createElement("div",{style:{marginTop:8,display:"flex",flexDirection:"column",gap:5}},
                React.createElement("div",{style:{fontSize:10,fontWeight:700,color:C.t3,letterSpacing:"0.06em",marginBottom:2}},"💡 배울점"),
                art.points.map(function(pt,pi){
                  return React.createElement("div",{key:pi,style:{display:"flex",gap:7,alignItems:"flex-start"}},
                    React.createElement("span",{style:{padding:"1px 6px",borderRadius:4,background:C.gd+"22",color:C.gd,fontSize:9,fontWeight:700,flexShrink:0,marginTop:1}},pt.label),
                    React.createElement(ExpandText,{C:C,text:pt.text,limit:80,size:11})
                  );
                })
              )
            );
          })
        );
      })
    ),
    React.createElement("div",{style:{padding:"14px 16px",background:C.sf,border:"1px solid "+C.gd+"22",borderRadius:13}},
      React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.gd,letterSpacing:"0.06em",marginBottom:8}},"🔗 문서 간 연결"),
      React.createElement("p",{style:{fontSize:13,color:C.t2,lineHeight:1.75}},conn)
    )
  );
}
function RediscoveryTab(props){
  var C=props.C,rediscovery=props.rediscovery,onOpen=props.onOpen;
  if(rediscovery.length===0){
    return React.createElement("div",{style:{textAlign:"center",padding:"60px 0",color:C.t3}},
      React.createElement("div",{style:{fontSize:34,marginBottom:10}},"📭"),
      React.createElement("p",null,"재발견할 이전 자료가 없습니다")
    );
  }
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:12}},
    React.createElement("div",{style:{fontSize:12,color:C.t3,marginBottom:4}},"이번 주 맥락에서 다시 읽으면 새로운 인사이트를 얻을 수 있는 기존 자료들입니다."),
    rediscovery.map(function(item,i){
      return React.createElement("div",{key:i,style:{padding:"16px",background:C.sf,border:"1px solid "+C.ac+"22",borderRadius:13}},
        React.createElement("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}},
          React.createElement("p",{style:{fontSize:13,fontWeight:600,color:C.t1,flex:1}},item.title),
          React.createElement("span",{style:{fontSize:10,color:C.ac,background:C.aBg,border:"1px solid "+C.aBd,borderRadius:5,padding:"2px 7px",flexShrink:0,marginLeft:8}},"재독 추천")
        ),
        React.createElement("div",{style:{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}},
          item.tags.map(function(t){
            return React.createElement("span",{key:t,style:{padding:"2px 6px",borderRadius:4,background:C.cd,color:C.t3,fontSize:10,border:"1px solid "+C.bd}},"#"+t);
          })
        ),
        React.createElement("div",{style:{display:"flex",gap:6,alignItems:"flex-start",marginBottom:12}},
          React.createElement("span",{style:{fontSize:14,flexShrink:0}},"🔄"),
          React.createElement(ExpandText,{C:C,text:item.reason,limit:110,size:12})
        ),
        item.id&&React.createElement("button",{
          onClick:function(){onOpen(item.id);},
          style:{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",background:C.aBg,border:"1px solid "+C.aBd,borderRadius:7,color:C.ac,fontSize:12,fontWeight:600,cursor:"pointer",width:"100%",justifyContent:"center"}
        },"↗ 자료 상세 보기")
      );
    })
  );
}
function RecommendTab(props){
  var C=props.C,recs=props.recs;
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:14}},
    React.createElement("div",{style:{fontSize:12,color:C.t3,marginBottom:2}},"이번 주 수집 자료를 기반으로 AI가 추천하는 다음 탐색 방향과 실제 링크입니다."),
    recs.map(function(item,i){
      var links=getLinks(item.tag);
      return React.createElement("div",{key:i,style:{padding:"16px",background:C.sf,border:"1px solid "+C.em+"22",borderRadius:13}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:10}},
          React.createElement("span",{style:{fontFamily:"'Syne'",fontWeight:800,fontSize:20,color:C.em+"44"}},String(i+1).padStart(2,"0")),
          React.createElement("p",{style:{fontSize:14,fontWeight:700,color:C.t1}},item.topic)
        ),
        React.createElement("div",{style:{padding:"10px 12px",background:C.cd,borderRadius:8,marginBottom:12}},
          React.createElement("p",{style:{fontSize:12,color:C.t2,marginBottom:4}},"📌 "+item.why),
          React.createElement(ExpandText,{C:C,text:item.how,limit:100,size:12})
        ),
        React.createElement("div",null,
          React.createElement("div",{style:{fontSize:10,fontWeight:700,color:C.t3,letterSpacing:"0.06em",marginBottom:8}},"🔗 지금 바로 탐색하기"),
          React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:7}},
            links.map(function(lk,li){
              return React.createElement(LinkChip,{key:li,link:lk,C:C});
            })
          )
        )
      );
    })
  );
}

function Sidebar(props){
  var C=props.C;
  var nav=[
    {id:"archive",icon:"🗄",label:"아카이브",count:props.archivedCount},
    {id:"report", icon:"📊",label:"리포트",  count:null},
    {id:"trash",  icon:"🗑",label:"휴지통",  count:props.trashedCount||null},
  ];
  return React.createElement("div",{style:{width:206,flexShrink:0,background:C.sb,borderRight:"1px solid "+C.bd,display:"flex",flexDirection:"column"}},
    React.createElement("div",{style:{padding:"18px 14px 14px",borderBottom:"1px solid "+C.bd}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:9}},
        React.createElement("div",{style:{width:30,height:30,borderRadius:9,background:C.aBg,border:"1px solid "+C.aBd,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}},"📦"),
        React.createElement("div",null,
          React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:C.t1}},"Archivault"),
          React.createElement("div",{style:{fontSize:10,color:C.t3}},"Personal Archive")
        )
      )
    ),
    React.createElement("nav",{style:{flex:1,padding:"10px 8px"}},
      nav.map(function(item){
        var act=props.page===item.id||(props.page==="document"&&item.id==="archive");
        return React.createElement("button",{
          key:item.id,onClick:function(){props.setPage(item.id);},
          style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"8px 10px",borderRadius:8,border:act?"1px solid "+C.aBd:"1px solid transparent",background:act?C.aBg:"transparent",color:act?C.ac:C.t2,fontSize:13,fontWeight:500,cursor:"pointer",marginBottom:2,textAlign:"left"}
        },
          React.createElement("span",{style:{display:"flex",alignItems:"center",gap:7}},
            React.createElement("span",{style:{fontSize:14}},item.icon),item.label),
          item.count!=null&&React.createElement("span",{style:{fontSize:10,background:act?C.aBg:C.bd,color:act?C.ac:C.t3,padding:"1px 6px",borderRadius:8}},item.count)
        );
      })
    ),
    React.createElement("div",{style:{padding:"12px 12px 14px",borderTop:"1px solid "+C.bd}},
      React.createElement("button",{
        onClick:function(){props.setDark(function(d){return !d;});},
        style:{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid "+C.bd,background:C.cd,cursor:"pointer",marginBottom:10}
      },
        React.createElement("span",{style:{fontSize:13}},props.dark?"☀️":"🌙"),
        React.createElement("span",{style:{fontSize:12,color:C.t2,flex:1}},props.dark?"라이트 모드":"다크 모드"),
        React.createElement("div",{style:{width:30,height:17,borderRadius:9,background:props.dark?C.ac:C.bd,position:"relative",flexShrink:0}},
          React.createElement("div",{style:{position:"absolute",top:2,left:props.dark?14:2,width:13,height:13,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}})
        )
      ),
      React.createElement("div",{style:{fontSize:10,fontWeight:600,color:C.t3,marginBottom:6,letterSpacing:"0.04em"}},"📥 OBSIDIAN 연동"),
      props.obsidianFolder
        ? React.createElement("div",null,
            React.createElement("div",{style:{fontSize:11,color:C.ac,padding:"5px 8px",background:C.aBg,border:"1px solid "+C.aBd,borderRadius:6,marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},
              "✓ "+props.obsidianFolder),
            React.createElement("button",{
              onClick:props.onChangeObsidianFolder,
              style:{fontSize:10,color:C.t3,background:"transparent",border:"1px solid "+C.bd,borderRadius:5,padding:"3px 8px",cursor:"pointer",width:"100%"}
            },"폴더 변경")
          )
        : React.createElement("button",{
            onClick:props.onChangeObsidianFolder,
            style:{display:"flex",alignItems:"center",gap:5,width:"100%",padding:"6px 8px",borderRadius:6,border:"1px dashed "+C.bd,background:"transparent",color:C.t3,fontSize:11,cursor:"pointer"}
          },
            React.createElement("span",null,"📂"),
            "Obsidian 폴더 선택"
          )
    )
  );
}

function ACard(props){
  var art=props.art,C=props.C;
  var [hov,setHov]=useState(false);
  var col=TC[art.type];
  return React.createElement("div",{
    style:{background:C.sf,border:"1px solid "+(hov?C.mt:C.bd),borderRadius:12,padding:"13px 15px",cursor:"pointer",transition:"all 0.18s",transform:hov?"translateY(-2px)":"none",boxShadow:hov?"0 6px 20px rgba(0,0,0,0.18)":"none"},
    onMouseEnter:function(){setHov(true);},onMouseLeave:function(){setHov(false);},
    onClick:function(){props.onOpen(art.id);}
  },
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}},
      React.createElement("span",{style:{display:"flex",alignItems:"center",gap:4,padding:"2px 7px",borderRadius:4,border:"1px solid "+col+"33",background:col+"0D",color:col,fontSize:10,fontWeight:500}},TI[art.type]+" "+TL[art.type]),
      React.createElement("span",{style:{fontSize:10,color:C.t3}},"📅 "+fmtDate(art.addedAt))
    ),
    React.createElement("h3",{style:{fontSize:13,fontWeight:600,color:hov?C.ac:C.t1,marginBottom:7,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}},art.title),
    art.an&&art.an.summary&&React.createElement("p",{style:{fontSize:11,color:C.t2,lineHeight:1.6,marginBottom:9,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}},art.an.summary),
    React.createElement("div",{style:{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}},
      art.tags.slice(0,4).map(function(t){return React.createElement("span",{key:t,style:{padding:"2px 6px",borderRadius:4,border:"1px solid "+C.aBd,background:C.aBg,color:C.ac,fontSize:10}},t);})),
    art.an&&art.an.agenda&&React.createElement("div",{style:{display:"flex",gap:4,flexWrap:"wrap",marginBottom:9}},
      art.an.agenda.map(function(ag,i){return React.createElement("span",{key:i,style:{padding:"2px 6px",borderRadius:4,background:C.cd,color:C.t3,fontSize:10,border:"1px solid "+C.bd}},ag);})),
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:"1px solid "+C.bd}},
      React.createElement("span",{style:{fontSize:11,color:C.ac,opacity:hov?1:0}},"자세히 보기 →"),
      React.createElement("button",{onClick:function(e){e.stopPropagation();props.onTrash(art.id);},style:{fontSize:10,padding:"3px 7px",borderRadius:5,border:"1px solid rgba(255,107,107,0.2)",color:"#FF6B6B",background:"transparent",cursor:"pointer",opacity:hov?1:0}},"버리기")
    )
  );
}

function ArchivePage(props){
  var C=props.C;
  var allTags=Array.from(new Set(props.articles.flatMap(function(a){return a.tags;})));
  var filtered=props.articles.filter(function(a){
    var q=props.search.toLowerCase();
    var ms=!props.search||a.title.toLowerCase().includes(q)||a.tags.some(function(t){return t.toLowerCase().includes(q);});
    var mt=!props.selTag||a.tags.includes(props.selTag);
    return ms&&mt;
  });
  return React.createElement("div",{style:{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}},
    React.createElement("div",{style:{position:"sticky",top:0,zIndex:10,background:C.hd,backdropFilter:"blur(12px)",padding:"12px 18px 10px",borderBottom:"1px solid "+C.bd}},
      React.createElement("div",{style:{display:"flex",gap:8,marginBottom:10,padding:"9px 12px",background:C.sf,border:"1px solid "+C.aBd,borderRadius:10}},
        React.createElement("span",{style:{fontSize:14,color:C.t3,marginTop:1,flexShrink:0}},"🔗"),
        React.createElement("input",{value:props.addUrl,onChange:function(e){props.setAddUrl(e.target.value);},onKeyDown:function(e){if(e.key==="Enter")props.onAdd();},placeholder:"https://... URL을 붙여넣고 Enter",style:{flex:1,background:"transparent",border:"none",color:C.t1,fontSize:13,outline:"none"}}),
        React.createElement("button",{onClick:props.onAdd,disabled:props.analyzing||!props.addUrl.trim(),style:{padding:"5px 14px",background:(props.analyzing||!props.addUrl.trim())?C.mt:C.ac,color:(props.analyzing||!props.addUrl.trim())?C.t3:"#080B0F",border:"none",borderRadius:7,fontSize:12,fontWeight:600,cursor:(props.analyzing||!props.addUrl.trim())?"default":"pointer",flexShrink:0}},props.analyzing?"⟳ 분석 중...":"AI 분석"),
        React.createElement("label",{title:"확장 프로그램에서 내보낸 JSON 가져오기",style:{padding:"5px 10px",background:C.cd,border:"1px solid "+C.bd,borderRadius:7,fontSize:12,color:C.t2,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",gap:4}},
          "📥 가져오기",
          React.createElement("input",{type:"file",accept:".json",onChange:props.onImport,style:{display:"none"}})
        )
      ),
      React.createElement("div",{style:{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}},
        React.createElement("div",{style:{position:"relative",flex:"0 0 200px"}},
          React.createElement("span",{style:{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:C.t3,fontSize:12}},"🔍"),
          React.createElement("input",{value:props.search,onChange:function(e){props.setSearch(e.target.value);},placeholder:"검색...",style:{width:"100%",padding:"5px 9px 5px 28px",background:C.cd,border:"1px solid "+C.bd,borderRadius:7,color:C.t1,fontSize:12,outline:"none"}})
        ),
        React.createElement("button",{onClick:function(){props.setSelTag(null);},style:{padding:"4px 10px",borderRadius:5,border:"1px solid "+(!props.selTag?C.aBd:C.bd),background:!props.selTag?C.aBg:"transparent",color:!props.selTag?C.ac:C.t3,fontSize:11,cursor:"pointer",flexShrink:0}},"전체 "+props.articles.length),
        allTags.map(function(tag){return React.createElement("button",{key:tag,onClick:function(){props.setSelTag(props.selTag===tag?null:tag);},style:{padding:"4px 10px",borderRadius:5,border:"1px solid "+(props.selTag===tag?C.aBd:C.bd),background:props.selTag===tag?C.aBg:"transparent",color:props.selTag===tag?C.ac:C.t3,fontSize:11,cursor:"pointer",flexShrink:0}},"#"+tag);})
      )
    ),
    React.createElement("div",{style:{padding:"14px 18px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))",gap:10}},
      filtered.length===0
        ?React.createElement("div",{style:{gridColumn:"1/-1",textAlign:"center",padding:"60px 0",color:C.t3}},React.createElement("div",{style:{fontSize:36,marginBottom:10}},"🗄"),React.createElement("p",{style:{fontSize:14}},"저장된 자료가 없어요"))
        :filtered.map(function(art,i){return React.createElement(ACard,{key:art.id,art:art,delay:i*0.03,onOpen:props.onOpen,onTrash:props.onTrash,C:C});})
    )
  );
}

function DocPage(props){
  var article=props.article,C=props.C,a=article.an,col=TC[article.type];
  var [memo,setMemo]=useState(article.memo||"");
  var [saved,setSaved]=useState(false);
  var [obsState,setObsState]=useState("idle"); // idle | saving | saved | error
  var [obsFilename,setObsFilename]=useState("");

  function handleFocus(){if(!memo){var d=new Date();setMemo(fmtYMD(d)+"\n");}}
  function saveMemo(){props.onSave(memo);setSaved(true);setTimeout(function(){setSaved(false);},1500);}

  async function handleSaveToObsidian(){
    setObsState("saving");
    try {
      var dir=await getOrPickDirectory();
      var md=toObsidianMarkdown(article);
      var filename=toFilename(article);
      await writeMarkdownFile(dir,filename,md);
      setObsFilename(filename);
      setObsState("saved");
      props.onObsidianFolderChange(dir.name);
      setTimeout(function(){setObsState("idle");},3000);
    } catch(e) {
      if(e.name!=="AbortError") setObsState("error");
      else setObsState("idle");
      setTimeout(function(){setObsState("idle");},2000);
    }
  }

  var sections=[
    {key:"overview",label:"개요",icon:"📋"},
    {key:"keyPoints",label:"핵심 내용",icon:"💡"},
    {key:"technical",label:"기술적 세부사항",icon:"⚙️"},
    {key:"philosophical",label:"철학적 세부사항",icon:"🧠"},
    {key:"practical",label:"실용적 시사점",icon:"🛠"},
    {key:"critical",label:"비판적 관점",icon:"⚠️"},
    {key:"conclusion",label:"결론",icon:"🎯"},
    {key:"relatedTopics",label:"관련 주제",icon:"🔗"},
  ];

  var obsLabel=obsState==="saving"?"⟳ 저장 중...":obsState==="saved"?"✓ Obsidian 저장됨":obsState==="error"?"✕ 저장 실패":"📥 Obsidian에 저장";
  var obsColor=obsState==="saved"?"#4ECCA3":obsState==="error"?"#FF6B6B":C.ac;
  var obsBg=obsState==="saved"?"#1E3A2A":obsState==="error"?"rgba(255,107,107,0.08)":C.aBg;
  var obsBd=obsState==="saved"?"#2D6B47":obsState==="error"?"rgba(255,107,107,0.4)":C.aBd;

  return React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}},
    React.createElement("div",{style:{padding:"10px 18px",borderBottom:"1px solid "+C.bd,display:"flex",alignItems:"center",gap:9,background:C.hd,backdropFilter:"blur(12px)",flexShrink:0}},
      React.createElement("button",{onClick:props.onBack,style:{padding:"5px 10px",background:"transparent",border:"1px solid "+C.bd,borderRadius:7,color:C.t2,cursor:"pointer",fontSize:12}},"← 뒤로"),
      React.createElement("span",{style:{fontSize:11,color:C.t3,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},article.url),
      React.createElement("span",{style:{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:5,border:"1px solid "+col+"33",background:col+"0D",color:col,fontSize:11,flexShrink:0}},TI[article.type]+" "+TL[article.type]),
      article.tags.slice(0,3).map(function(t){return React.createElement("span",{key:t,style:{fontSize:10,padding:"2px 7px",borderRadius:5,border:"1px solid "+C.aBd,background:C.aBg,color:C.ac,flexShrink:0}},t);})
    ),
    React.createElement("div",{style:{flex:1,overflowY:"auto",paddingBottom:185}},
      React.createElement("div",{style:{maxWidth:920,margin:"0 auto",padding:"24px 22px"}},
        React.createElement("h1",{style:{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:700,color:C.t1,marginBottom:4,lineHeight:1.3}},article.title),
        React.createElement("p",{style:{fontSize:11,color:C.t3,marginBottom:20}},fmtDate(article.addedAt)+" 수집"),
        a&&React.createElement("div",null,
          React.createElement("div",{style:{padding:"14px 16px",background:C.aBg,border:"1px solid "+C.aBd,borderRadius:12,marginBottom:14}},
            React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.ac,marginBottom:7}},"📝 요약"),
            React.createElement("p",{style:{fontSize:14,color:C.t1,lineHeight:1.75}},a.summary)
          ),
          React.createElement("div",{style:{padding:"13px 15px",background:C.sf,border:"1px solid "+C.aBd,borderRadius:12,marginBottom:10}},
            React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.ac,marginBottom:7}},"🎯 목적"),
            React.createElement("p",{style:{fontSize:13,color:C.t1,lineHeight:1.7}},a.purpose)
          ),
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}},
            React.createElement(MiniList,{label:"📌 의제",color:C.gd,items:a.agenda,C:C}),
            React.createElement(MiniList,{label:"⚠ 쟁점",color:C.em,items:a.issues,C:C})
          ),
          React.createElement("div",{style:{padding:"14px 16px",background:C.sf,border:"1px solid "+C.bd,borderRadius:12,marginBottom:16}},
            React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.t2,marginBottom:12}},"→ 후속조치 (일반 소비자 관점)"),
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}},
              [["WHAT — 무엇을",a.fw&&a.fw.what],["WHO — 누가",a.fw&&a.fw.who],["WHEN — 언제",a.fw&&a.fw.when]].map(function(pair){
                return React.createElement("div",{key:pair[0]},
                  React.createElement("div",{style:{fontSize:9,fontWeight:700,color:C.t3,letterSpacing:"0.09em",marginBottom:5}},pair[0]),
                  React.createElement("div",{style:{fontSize:12,color:C.t1,lineHeight:1.6}},pair[1]||"—")
                );
              })
            )
          ),
          React.createElement("div",{style:{height:1,background:"linear-gradient(90deg,transparent,"+C.bd+",transparent)",marginBottom:14}}),
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}},
            sections.map(function(sec){
              var content;
              if(sec.key==="keyPoints"){
                content=React.createElement("ul",{style:{listStyle:"none",display:"flex",flexDirection:"column",gap:8}},
                  (a.keyPoints||[]).map(function(p,i){return React.createElement("li",{key:i,style:{display:"flex",gap:8,fontSize:13,color:C.t2,lineHeight:1.65}},React.createElement("span",{style:{color:C.ac,fontWeight:700,flexShrink:0}},(i+1)+"."),p);}));
              }else if(sec.key==="relatedTopics"){
                content=React.createElement("div",{style:{display:"flex",gap:7,flexWrap:"wrap"}},
                  (a.relatedTopics||[]).map(function(t){return React.createElement("span",{key:t,style:{padding:"4px 10px",borderRadius:5,border:"1px solid "+C.bd,color:C.t2,fontSize:12,background:C.cd}},t);}));
              }else{
                content=React.createElement("p",{style:{fontSize:13,color:C.t2,lineHeight:1.82}},a[sec.key]||"");
              }
              return React.createElement(DetailBlock,{key:sec.key,icon:sec.icon,label:sec.label,C:C,wide:sec.key==="conclusion"},content);
            })
          )
        )
      )
    ),
    React.createElement("div",{style:{position:"absolute",bottom:0,left:0,right:0,background:C.hd,backdropFilter:"blur(16px)",borderTop:"1px solid "+C.bd}},
      React.createElement("div",{style:{padding:"11px 18px 7px",maxWidth:920,margin:"0 auto"}},
        React.createElement("div",{style:{display:"flex",gap:9,alignItems:"flex-start"}},
          React.createElement("textarea",{value:memo,onChange:function(e){setMemo(e.target.value);},onFocus:handleFocus,placeholder:"메모를 입력하면 날짜가 자동 기록됩니다...",rows:2,style:{flex:1,padding:"8px 11px",background:C.sf,border:"1px solid "+C.bd,borderRadius:8,color:C.t1,fontSize:12,lineHeight:1.6,fontFamily:"'DM Mono',monospace",outline:"none",resize:"none"}}),
          React.createElement("button",{onClick:saveMemo,style:{padding:"8px 14px",background:saved?"#1E3A2A":C.sf,border:"1px solid "+(saved?"#2D6B47":C.bd),borderRadius:8,color:saved?"#4ECCA3":C.t2,fontSize:12,cursor:"pointer",flexShrink:0,marginTop:1}},saved?"✓ 저장됨":"저장")
        )
      ),
      React.createElement("div",{style:{padding:"6px 18px 12px",maxWidth:920,margin:"0 auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}},
        React.createElement("button",{style:{padding:"7px 13px",background:"transparent",border:"1px solid "+C.bd,borderRadius:7,color:C.t2,fontSize:12,cursor:"pointer"}},"↺ 재분석"),
        React.createElement("button",{onClick:function(){window.open(article.url,"_blank");},style:{padding:"7px 13px",background:"transparent",border:"1px solid "+C.bd,borderRadius:7,color:C.t2,fontSize:12,cursor:"pointer"}},"↗ 원본보기"),
        React.createElement("button",{
          onClick:handleSaveToObsidian,
          disabled:obsState==="saving",
          style:{padding:"7px 14px",background:obsBg,border:"1px solid "+obsBd,borderRadius:7,color:obsColor,fontSize:12,fontWeight:600,cursor:obsState==="saving"?"default":"pointer"}
        },obsLabel),
        obsState==="saved"&&obsFilename&&React.createElement("span",{style:{fontSize:10,color:C.t3}},"→ "+obsFilename),
        React.createElement("button",{onClick:function(){props.onTrash(article.id);},style:{padding:"7px 13px",background:"transparent",border:"1px solid rgba(255,107,107,0.25)",borderRadius:7,color:"#FF6B6B",fontSize:12,cursor:"pointer",marginLeft:"auto"}},"🗑 버리기")
      )
    )
  );
}

function ReportPage(props){
  var C=props.C,weekOff=props.weekOff,setWeekOff=props.setWeekOff,articles=props.articles,onOpen=props.onOpen;
  var [activeTab,setActiveTab]=useState("briefing");
  function getWeek(off){
    var now=new Date(),day=now.getDay();
    var mon=new Date(now);
    mon.setDate(now.getDate()-((day+6)%7)+off*7);
    mon.setHours(0,0,0,0);
    var sun=new Date(mon);
    sun.setDate(mon.getDate()+6);
    return {start:mon,end:sun};
  }
  var week=getWeek(weekOff),start=week.start,end=week.end;
  var wa=articles.filter(function(a){var d=new Date(a.addedAt);return d>=start&&d<=end;});
  var tc={};
  wa.flatMap(function(a){return a.tags;}).forEach(function(t){tc[t]=(tc[t]||0)+1;});
  var top=Object.entries(tc).sort(function(a,b){return b[1]-a[1];}).slice(0,3).map(function(e){return e[0];});
  var top3=wa.slice(0,3).map(function(a){return {id:a.id,title:a.title,insight:(a.an&&a.an.summary)||"분석 없음"};});
  var catInsights=top.map(function(tag){
    var tagArts=wa.filter(function(a){return a.tags.includes(tag);});
    var arts=tagArts.map(function(a){
      if(!a.an) return null;
      var points=[];
      if(a.an.practical) points.push({label:"실용",text:a.an.practical.slice(0,120)+"…"});
      if(a.an.conclusion) points.push({label:"결론",text:a.an.conclusion.slice(0,120)+"…"});
      if(a.an.keyPoints&&a.an.keyPoints[0]) points.push({label:"핵심",text:a.an.keyPoints[0]});
      return {id:a.id,title:a.title,summary:(a.an.summary||"").slice(0,120)+"…",points:points.slice(0,2)};
    }).filter(Boolean);
    return {tag:tag,count:tagArts.length,arts:arts};
  });
  var conn=wa.length>1?"수집된 "+wa.length+"개 자료는 "+top.join(", ")+" 주제로 유기적으로 연결됩니다.":"자료가 적어 연결 분석이 제한적입니다.";
  var rediscovery=articles.filter(function(a){return !wa.find(function(w){return w.id===a.id;});}).slice(0,3).map(function(a){
    var commonTags=(a.tags||[]).filter(function(t){return top.includes(t);});
    return {
      id:a.id,title:a.title,tags:a.tags||[],
      reason:commonTags.length>0
        ?"이번 주 "+commonTags.join(", ")+" 주제와 연결됩니다. "+((a.an&&a.an.conclusion)?a.an.conclusion.slice(0,100)+"…":"")
        :"이번 주 탐색 흐름과 맥락이 연결된 자료입니다."
    };
  });
  var recs=top.slice(0,3).map(function(tag,i){
    var relArts=wa.filter(function(a){return a.tags.includes(tag);});
    var keyPt=relArts[0]&&relArts[0].an&&relArts[0].an.keyPoints&&relArts[0].an.keyPoints[i%4];
    return {
      tag:tag,
      topic:tag+" 심화 탐색",
      why:"이번 주 "+relArts.length+"건의 "+tag+" 자료를 수집했습니다.",
      how:keyPt?"'"+keyPt+"' 관점을 중심으로 탐색해보세요.":"관련 논문·강의·커뮤니티를 통해 지식을 확장해보세요.",
    };
  });
  var tabs=[
    {id:"briefing",label:"⚡ AI 브리핑",color:C.gd},
    {id:"rediscovery",label:"🔄 재발견",color:C.ac},
    {id:"recommend",label:"🧭 탐색 추천",color:C.em},
  ];
  return React.createElement("div",{style:{flex:1,overflowY:"auto"}},
    React.createElement("div",{style:{maxWidth:720,margin:"0 auto",padding:"22px 18px"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}},
        React.createElement("button",{onClick:function(){setWeekOff(function(o){return o-1;});},style:{width:32,height:32,borderRadius:8,border:"1px solid "+C.bd,background:C.sf,color:C.t2,cursor:"pointer",fontSize:15}},"‹"),
        React.createElement("div",{style:{textAlign:"center"}},
          React.createElement("div",{style:{fontSize:26,marginBottom:4}},"📅"),
          React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:C.t1}},fmtYMD(start)+" ~ "+fmtYMD(end)),
          React.createElement("div",{style:{fontSize:11,color:C.t3,marginTop:2}},weekOff===0?"이번 주":weekOff+"주 전")
        ),
        React.createElement("button",{onClick:function(){setWeekOff(function(o){return Math.min(o+1,0);});},disabled:weekOff===0,style:{width:32,height:32,borderRadius:8,border:"1px solid "+C.bd,background:C.sf,color:weekOff===0?C.t3:C.t2,cursor:weekOff===0?"default":"pointer",fontSize:15,opacity:weekOff===0?0.3:1}},"›")
      ),
      wa.length===0
        ?React.createElement("div",{style:{textAlign:"center",padding:"60px 0",color:C.t3}},
            React.createElement("div",{style:{fontSize:34,marginBottom:10}},"📭"),
            React.createElement("p",null,"이번 주 수집된 자료가 없습니다"))
        :React.createElement("div",null,
            React.createElement("div",{style:{display:"flex",gap:6,marginBottom:18,padding:"4px",background:C.cd,borderRadius:12}},
              tabs.map(function(tab){
                var act=activeTab===tab.id;
                return React.createElement("button",{
                  key:tab.id,onClick:function(){setActiveTab(tab.id);},
                  style:{flex:1,padding:"9px 8px",borderRadius:9,border:act?"1px solid "+tab.color+"33":"1px solid transparent",background:act?C.sf:"transparent",color:act?tab.color:C.t3,fontSize:12,fontWeight:act?600:400,cursor:"pointer",transition:"all 0.18s"}
                },tab.label);
              })
            ),
            activeTab==="briefing"&&React.createElement(BriefingTab,{top3:top3,catInsights:catInsights,conn:conn,C:C,onOpen:onOpen}),
            activeTab==="rediscovery"&&React.createElement(RediscoveryTab,{rediscovery:rediscovery,C:C,onOpen:onOpen}),
            activeTab==="recommend"&&React.createElement(RecommendTab,{recs:recs,C:C})
          )
    )
  );
}

function TrashPage(props){
  var C=props.C;
  var [confId,setConfId]=useState(null);
  function daysLeft(t){if(!t)return 30;return Math.max(0,30-Math.floor((Date.now()-new Date(t).getTime())/86400000));}
  return React.createElement("div",{style:{flex:1,overflowY:"auto"}},
    React.createElement("div",{style:{padding:"18px 18px 11px",borderBottom:"1px solid "+C.bd}},
      React.createElement("h1",{style:{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:C.t1}},"🗑 휴지통"),
      React.createElement("p",{style:{fontSize:11,color:C.t3,marginTop:3}},"삭제된 항목은 30일 후 자동 영구 삭제됩니다")
    ),
    React.createElement("div",{style:{padding:"14px 18px",display:"flex",flexDirection:"column",gap:7}},
      props.articles.length===0
        ?React.createElement("div",{style:{textAlign:"center",padding:"70px 0",color:C.t3}},React.createElement("div",{style:{fontSize:34,marginBottom:10}},"🗑"),React.createElement("p",{style:{fontSize:13}},"휴지통이 비어있습니다"))
        :props.articles.map(function(art){
            var d=daysLeft(art.trashedAt),urg=d<=7;
            return React.createElement("div",{key:art.id,style:{background:C.sf,border:"1px solid "+C.bd,borderRadius:10,padding:"11px 15px",opacity:0.75}},
              React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:9}},
                React.createElement("div",{style:{flex:1,minWidth:0}},
                  React.createElement("p",{style:{fontSize:13,fontWeight:500,color:C.t2,textDecoration:"line-through",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},art.title),
                  React.createElement("p",{style:{fontSize:10,color:urg?"#FF6B6B":C.t3,marginTop:2}},(urg?"⚠ ":"")+d+"일 후 영구삭제"+(art.trashedAt?" · "+fmtDate(art.trashedAt)+" 삭제됨":""))
                ),
                React.createElement("div",{style:{display:"flex",gap:5,alignItems:"center",flexShrink:0}},
                  React.createElement("button",{onClick:function(){props.onRestore(art.id);},style:{padding:"5px 10px",background:"transparent",border:"1px solid "+C.bd,borderRadius:6,color:C.t2,fontSize:11,cursor:"pointer"}},"↺ 복원"),
                  confId===art.id
                    ?React.createElement("div",{style:{display:"flex",alignItems:"center",gap:5}},
                        React.createElement("span",{style:{fontSize:10,color:"#FF6B6B"}},"정말요?"),
                        React.createElement("button",{onClick:function(){props.onDelete(art.id);setConfId(null);},style:{padding:"5px 9px",background:"transparent",border:"1px solid rgba(255,107,107,0.3)",borderRadius:6,color:"#FF6B6B",fontSize:11,cursor:"pointer"}},"영구삭제"),
                        React.createElement("button",{onClick:function(){setConfId(null);},style:{padding:"5px 7px",background:"transparent",border:"1px solid "+C.bd,borderRadius:6,color:C.t3,fontSize:11,cursor:"pointer"}},"✕")
                      )
                    :React.createElement("button",{onClick:function(){setConfId(art.id);},style:{padding:"5px 10px",background:"transparent",border:"1px solid rgba(255,107,107,0.25)",borderRadius:6,color:"#FF6B6B",fontSize:11,cursor:"pointer"}},"삭제")
                )
              )
            );
          })
    )
  );
}

export default function App(){
  var [dark,setDark]=useState(true);
  var C=makeColors(dark);
  var [page,setPage]=useState("archive");
  var [articles,setArticles]=useState(ARTS);
  var [activeId,setActiveId]=useState(null);
  var [addUrl,setAddUrl]=useState("");
  var [analyzing,setAnalyzing]=useState(false);
  var [search,setSearch]=useState("");
  var [selTag,setSelTag]=useState(null);
  var [weekOff,setWeekOff]=useState(0);
  var [obsidianFolder,setObsidianFolder]=useState(null);

  useEffect(function(){
    getSavedFolderName().then(function(name){if(name)setObsidianFolder(name);});
  },[]);

  var archived=articles.filter(function(a){return a.status==="archive";});
  var trashed=articles.filter(function(a){return a.status==="trash";});
  var active=articles.find(function(a){return a.id===activeId;});

  function goDoc(id){setActiveId(id);setPage("document");}
  function trashArt(id){setArticles(function(p){return p.map(function(a){return a.id===id?Object.assign({},a,{status:"trash",trashedAt:new Date().toISOString()}):a;});});if(page==="document")setPage("archive");}
  function restoreArt(id){setArticles(function(p){return p.map(function(a){return a.id===id?Object.assign({},a,{status:"archive",trashedAt:undefined}):a;});});}
  function deleteForever(id){setArticles(function(p){return p.filter(function(a){return a.id!==id;});});}

  async function handleChangeObsidianFolder(){
    try {
      await clearHandle();
      var dir=await getOrPickDirectory();
      setObsidianFolder(dir.name);
    } catch(e) {
      if(e.name!=="AbortError") console.error(e);
    }
  }

  function importFromJson(e){
    var file=e.target.files[0];
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      try{
        var imported=JSON.parse(ev.target.result);
        if(!Array.isArray(imported))return;
        setArticles(function(prev){
          var ids=new Set(prev.map(function(a){return a.id;}));
          var newOnes=imported.filter(function(a){return !ids.has(a.id);});
          return newOnes.concat(prev);
        });
      }catch(err){console.error("JSON 파싱 오류",err);}
    };
    reader.readAsText(file);
    e.target.value="";
  }

  function simulateAdd(){
    if(!addUrl.trim())return;
    setAnalyzing(true);
    setTimeout(function(){
      var n={id:String(Date.now()),url:addUrl,title:"새 자료: "+addUrl.replace(/https?:\/\//,"").split("/")[0],type:addUrl.includes("youtube")?"youtube":addUrl.endsWith(".pdf")?"pdf":"web",tags:["신규"],addedAt:new Date().toISOString(),status:"archive",memo:"",an:{purpose:"Gemini AI 분석 중 (데모)",agenda:["콘텐츠 분석","인사이트 추출","지식 체계화"],issues:["접근성","신뢰도","연관성"],summary:"실제 서비스에서는 Gemini 2.0 Flash가 URL을 실시간 분석합니다.",fw:{what:"내용 검토",who:"본인",when:"오늘 중"},overview:"Gemini API 배포 후 자동 생성됩니다.",keyPoints:["AI 자동 분석","태그 생성","구조화 인사이트","후속조치 제안"],technical:"Gemini 2.0 Flash + Google Search Grounding",philosophical:"정보 큐레이션의 가치",practical:"즉시 구조화된 인사이트 제공",critical:"URL 접근 가능성에 따라 정확도 차이",conclusion:"지식 아카이브로 생산성 향상",relatedTopics:["PKM","AI","지식관리"]}};
      setArticles(function(p){return [n].concat(p);});
      setAddUrl("");setAnalyzing(false);goDoc(n.id);
    },2000);
  }

  var gs=[
    "@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');",
    "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}",
    "body{background:"+C.bg+";color:"+C.t1+";font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;}",
    "::-webkit-scrollbar{width:4px;height:4px;}",
    "::-webkit-scrollbar-thumb{background:"+C.bd+";border-radius:2px;}",
    "input,textarea,button{font-family:'DM Sans',sans-serif;}textarea{resize:none;}",
  ].join("");

  return React.createElement("div",null,
    React.createElement("style",null,gs),
    React.createElement("div",{style:{display:"flex",height:"100vh",overflow:"hidden",background:C.bg}},
      React.createElement(Sidebar,{
        page:page,
        setPage:function(p){setPage(p);setActiveId(null);},
        archivedCount:archived.length,
        trashedCount:trashed.length,
        dark:dark,setDark:setDark,C:C,
        obsidianFolder:obsidianFolder,
        onChangeObsidianFolder:handleChangeObsidianFolder,
      }),
      React.createElement("div",{style:{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",position:"relative"}},
        page==="archive"&&React.createElement(ArchivePage,{articles:archived,search:search,setSearch:setSearch,selTag:selTag,setSelTag:setSelTag,addUrl:addUrl,setAddUrl:setAddUrl,analyzing:analyzing,onAdd:simulateAdd,onImport:importFromJson,onTrash:trashArt,onOpen:goDoc,C:C}),
        page==="document"&&active&&React.createElement(DocPage,{article:active,onBack:function(){setPage("archive");},onTrash:trashArt,onSave:function(m){setArticles(function(p){return p.map(function(a){return a.id===active.id?Object.assign({},a,{memo:m}):a;});});},onObsidianFolderChange:setObsidianFolder,C:C}),
        page==="report"&&React.createElement(ReportPage,{articles:archived,weekOff:weekOff,setWeekOff:setWeekOff,onOpen:goDoc,C:C}),
        page==="trash"&&React.createElement(TrashPage,{articles:trashed,onRestore:restoreArt,onDelete:deleteForever,C:C})
      )
    )
  );
}
