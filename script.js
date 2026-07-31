const BIN_ID = "65ba5c0a1f723d72d2f789ab"; 
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let linksArray = [];

const linkInput = document.getElementById('linkInput');
const linksList = document.getElementById('linksList');
const btnAdd = document.getElementById('btnAdd');
const btnDeleteLatest = document.getElementById('btnDeleteLatest');
const btnDeleteAll = document.getElementById('btnDeleteAll');

// 1. Fetch Links
async function fetchLinks() {
  try {
    const res = await fetch(`${API_URL}/latest`, {
      headers: { 'X-Bin-Meta': 'false' }
    });
    if (res.ok) {
      const data = await res.json();
      linksArray = Array.isArray(data) ? data : [];
      renderLinks();
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

// 2. Save Links
async function saveLinks() {
  renderLinks();
  try {
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linksArray)
    });
  } catch (err) {
    console.error("Save error:", err);
  }
}

// 3. Render List (Explicit Copy & Delete Buttons)
function renderLinks() {
  linksList.innerHTML = '';

  if (!linksArray || linksArray.length === 0) {
    linksList.innerHTML = '<div class="empty-state">No links shared yet.</div>';
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
        <button class="btn-item-del" data-index="${realIndex}">Delete</button>
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
      }).catch(err => {
        // Fallback for older browsers or restricted permissions
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

// Add Link
function addLink() {
  const text = linkInput.value.trim();
  if (!text) return;

  linksArray.push({ text: text, id: Date.now() });
  linkInput.value = '';
  saveLinks();
}

function deleteLinkByIndex(index) {
  linksArray.splice(index, 1);
  saveLinks();
}

function deleteLatestLink() {
  if (linksArray.length > 0) {
    linksArray.pop();
    saveLinks();
  }
}

function deleteAllLinks() {
  if (confirm("Are you sure you want to delete all shared links across all devices?")) {
    linksArray = [];
    saveLinks();
  }
}

btnAdd.addEventListener('click', addLink);
btnDeleteLatest.addEventListener('click', deleteLatestLink);
btnDeleteAll.addEventListener('click', deleteAllLinks);

linkInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addLink();
});

fetchLinks();
setInterval(fetchLinks, 3000);