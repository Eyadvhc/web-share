// Public Shared Relay Storage Endpoint (Allows open write/read for all visitors)
const PUBLIC_ROOM = "public_web_share_room_8899";
const API_URL = `https://kvdb.io/shared_app_data/${PUBLIC_ROOM}`;

let linksArray = [];

const linkInput = document.getElementById('linkInput');
const linksList = document.getElementById('linksList');
const btnAdd = document.getElementById('btnAdd');
const btnDeleteLatest = document.getElementById('btnDeleteLatest');
const btnDeleteAll = document.getElementById('btnDeleteAll');

// 1. Fetch Links from Public Relay
async function fetchPublicLinks() {
  try {
    const res = await fetch(`${API_URL}?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      linksArray = Array.isArray(data) ? data : [];
      renderLinks();
    }
  } catch (err) {
    console.error("Sync error:", err);
  }
}

// 2. Publish Updated List to Public Relay for Everyone
async function publishLinksToAll() {
  renderLinks(); // Instant local UI update
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linksArray)
    });
  } catch (err) {
    console.error("Publish error:", err);
  }
}

// 3. Render Links Feed with Copy & Delete Features
function renderLinks() {
  linksList.innerHTML = '';

  if (!linksArray || linksArray.length === 0) {
    linksList.innerHTML = '<div class="empty-state">No public links shared yet. Be the first!</div>';
    return;
  }

  [...linksArray].reverse().forEach((item, originalIndex) => {
    const realIndex = linksArray.length - 1 - originalIndex;
    const div = document.createElement('div');
    div.className = 'link-item';

    const safeText = document.createTextNode(item.text).textContent;

    div.innerHTML = `
      <span class="plain-text-link">${safeText}</span>
      <div class="action-btns">
        <button class="btn-item-copy">Copy</button>
        <button class="btn-item-del">Delete</button>
      </div>
    `;

    // Copy Handler
    const copyBtn = div.querySelector('.btn-item-copy');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(item.text).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.style.backgroundColor = '#16a34a';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.style.backgroundColor = '#0284c7';
        }, 1500);
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = item.text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
      });
    });

    // Delete Handler
    div.querySelector('.btn-item-del').addEventListener('click', () => {
      deleteLinkByIndex(realIndex);
    });

    linksList.appendChild(div);
  });
}

// Actions
function addLink() {
  const text = linkInput.value.trim();
  if (!text) return;

  linksArray.push({ text: text, id: Date.now() });
  linkInput.value = '';
  publishLinksToAll();
}

function deleteLinkByIndex(index) {
  linksArray.splice(index, 1);
  publishLinksToAll();
}

function deleteLatestLink() {
  if (linksArray.length > 0) {
    linksArray.pop();
    publishLinksToAll();
  }
}

function deleteAllLinks() {
  if (confirm("Are you sure you want to delete all public links for everyone?")) {
    linksArray = [];
    publishLinksToAll();
  }
}

btnAdd.addEventListener('click', addLink);
btnDeleteLatest.addEventListener('click', deleteLatestLink);
btnDeleteAll.addEventListener('click', deleteAllLinks);

linkInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addLink();
});

// Auto-sync: Load immediately and poll every 3 seconds so new posts from any user appear live!
fetchPublicLinks();
setInterval(fetchPublicLinks, 3000);