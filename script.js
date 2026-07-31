const STORAGE_KEY = "eyad_local_links_store";
let linksArray = [];

const linkInput = document.getElementById('linkInput');
const linksList = document.getElementById('linksList');
const btnAdd = document.getElementById('btnAdd');
const btnDeleteLatest = document.getElementById('btnDeleteLatest');
const btnDeleteAll = document.getElementById('btnDeleteAll');

// 1. Load Links from Local Storage on Startup
function loadLocalLinks() {
  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData) {
    try {
      linksArray = JSON.parse(localData);
    } catch (e) {
      linksArray = [];
    }
  } else {
    linksArray = [];
  }
  renderLinks();
}

// 2. Save Links to Local Storage
function saveLocalLinks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(linksArray));
  renderLinks();
}

// 3. Render Items to the DOM with Copy and Delete Actions
function renderLinks() {
  linksList.innerHTML = '';

  if (!linksArray || linksArray.length === 0) {
    linksList.innerHTML = '<div class="empty-state">No links saved locally.</div>';
    return;
  }

  // Display newest links first
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
        // Fallback copy method
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
  saveLocalLinks();
}

// Delete Single Link by Index
function deleteLinkByIndex(index) {
  linksArray.splice(index, 1);
  saveLocalLinks();
}

// Delete Latest Link
function deleteLatestLink() {
  if (linksArray.length > 0) {
    linksArray.pop();
    saveLocalLinks();
  }
}

// Delete All Links
function deleteAllLinks() {
  if (confirm("Are you sure you want to delete all locally saved links?")) {
    linksArray = [];
    saveLocalLinks();
  }
}

// Event Listeners
btnAdd.addEventListener('click', addLink);
btnDeleteLatest.addEventListener('click', deleteLatestLink);
btnDeleteAll.addEventListener('click', deleteAllLinks);

linkInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addLink();
});

// Initial Load
loadLocalLinks();
