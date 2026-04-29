const tabsEl = document.getElementById("tabs");
const viewsEl = document.getElementById("views");
const input = document.getElementById("url");
const goBtn = document.getElementById("go");
const newTabBtn = document.getElementById("newTab");
const historyBtn = document.getElementById("historyBtn");
const historyPanel = document.getElementById("historyPanel");

let tabs = [];
let activeTab = null;
let history = JSON.parse(localStorage.getItem("history") || "[]");

/* ---------------- HISTORY ---------------- */

function saveHistory(url) {
  history.unshift(url);
  history = history.slice(0, 50);
  localStorage.setItem("history", JSON.stringify(history));
}

function renderHistory() {
  historyPanel.innerHTML = "";

  history.forEach(url => {
    const item = document.createElement("div");
    item.className = "histItem";
    item.textContent = url;

    item.onclick = () => loadURL(url);

    historyPanel.appendChild(item);
  });
}

/* ---------------- TABS ---------------- */

function setActiveTab(id) {
  tabs.forEach(t => {
    t.webview.style.display = "none";
    t.tab.classList.remove("active");
  });

  const t = tabs.find(t => t.id === id);
  if (!t) return;

  t.webview.style.display = "block";
  t.tab.classList.add("active");

  activeTab = t;
  input.value = t.webview.src;
}

function createTab(url = "https://example.com") {
  const id = crypto.randomUUID();

  const tab = document.createElement("div");
  tab.className = "tab";

  const title = document.createElement("span");
  title.textContent = "New Tab";

  const close = document.createElement("span");
  close.textContent = "✕";
  close.className = "close";

  tab.appendChild(title);
  tab.appendChild(close);

  const webview = document.createElement("webview");
  webview.src = url;

  webview.addEventListener("did-navigate", (e) => {
    const clean = e.url.replace("https://", "").slice(0, 20);
    title.textContent = clean;

    input.value = e.url;
    saveHistory(e.url);
  });

  tab.addEventListener("click", () => {
    setActiveTab(id);
  });

  close.addEventListener("click", (e) => {
    e.stopPropagation();
    closeTab(id);
  });

  tabsEl.appendChild(tab);
  viewsEl.appendChild(webview);

  tabs.push({ id, tab, webview });

  setActiveTab(id);
}

function closeTab(id) {
  const index = tabs.findIndex(t => t.id === id);
  if (index === -1) return;

  const t = tabs[index];

  t.tab.remove();
  t.webview.remove();

  tabs.splice(index, 1);

  if (tabs.length > 0) {
    const newActive = tabs[Math.max(0, index - 1)];
    setActiveTab(newActive.id);
  } else {
    activeTab = null;
  }
}

/* ---------------- NAVIGATION ---------------- */

function loadURL(url) {
  if (!activeTab) return;

  if (!url.startsWith("http")) {
    url = "https://" + url;
  }

  activeTab.webview.src = url;
}

/* ---------------- EVENTS ---------------- */

goBtn.onclick = () => loadURL(input.value);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadURL(input.value);
});

newTabBtn.onclick = () => createTab();

historyBtn.onclick = () => {
  historyPanel.classList.toggle("hidden");
  renderHistory();
};

/* ---------------- INIT ---------------- */

createTab();