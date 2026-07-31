const STORAGE_KEY = "eyad_shared_links_store";
let linksArray = [];

const linkInput = document.getElementById('linkInput');
const linksList = document.getElementById('linksList');
const btnAdd = document.getElementById('btnAdd');
const btnDeleteLatest = document.getElementById('btnDeleteLatest');
const btnDeleteAll = document.getElementById('btnDeleteAll');

// 1. Fetch Links from storage API
async function fetchLinks() {
  try {
    const res = await fetch(`https://kvdb.io/shared_app_data/${STORAGE_KEY}`);
    if (res.ok) {
      linksArray = await res.json();
    } else {
      linksArray = [];
    }
    renderLinks();
  } catch (err) {
    const local = localStorage.getItem(STORAGE_KEY);
    linksArray = local ? JSON.parse(local) : [];
    renderLinks();
  }
}

// 2. Save Links to storage API
async function saveLinks() {
  renderLinks();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(linksArray));
  try {
    await fetch(`https://kvdb.io/shared_app_data/${STORAGE_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linksArray)
    });
  } catch (err) {
    console.log("Offline mode: saved locally.");
  }
}

// 3. Render items into DOM & hide after 1 second
function renderLinks() {
  linksList.innerHTML = '';

  if (!linksArray || linksArray.length === 0) {
    linksList.innerHTML = '<div class="empty-state">No links shared yet.</div>';
    return;
  }

  // Display newest links first
  [...linksArray].reverse().forEach((item, originalIndex) => {
    const realIndex = linksArray.length - 1 - originalIndex;
    const div = document.createElement('div');
    div.className = 'link-item';

    const safeText = document.createTextNode(item.text).textContent;

    div.innerHTML = `
      <span class="plain-text-link" id="link-text-${realIndex}" title="Click or hover to reveal">${safeText}</span>
      <button class="btn-item-del" data-index="${realIndex}">Delete</button>
    `;

    // Add event listener to individual delete button
    div.querySelector('.btn-item-del').addEventListener('click', () => {
      deleteLinkByIndex(realIndex);
    });

    linksList.appendChild(div);

    // Hide text after 1 second (1000 ms)
    setTimeout(() => {
      const textElement = document.getElementById(`link-text-${realIndex}`);
      if (textElement) {
        textElement.style.filter = "blur(4px)";
        textElement.style.transition = "filter 0.3s ease";
        textElement.style.cursor = "pointer";

        // Reveal text on hover or click
        textElement.addEventListener('mouseenter', () => textElement.style.filter = "none");
        textElement.addEventListener('mouseleave', () => textElement.style.filter = "blur(4px)");
      }
    }, 1000);
  });
}

// Add Link Function
function addLink() {
  const text = linkInput.value.trim();
  if (!text) return;

  linksArray.push({ text: text, id: Date.now() });
  linkInput.value = '';
  saveLinks();
}

// Delete Single Link by Index
function deleteLinkByIndex(index) {
  linksArray.splice(index, 1);
  saveLinks();
}

// Delete Latest Link
function deleteLatestLink() {
  if (linksArray.length > 0) {
    linksArray.pop();
    saveLinks();
  }
}

// Delete All Links
function deleteAllLinks() {
  if (confirm("Are you sure you want to delete all shared links?")) {
    linksArray = [];
    saveLinks();
  }
}

// Event Listeners for UI Buttons
btnAdd.addEventListener('click', addLink);
btnDeleteLatest.addEventListener('click', deleteLatestLink);
btnDeleteAll.addEventListener('click', deleteAllLinks);

// Support pressing 'Enter' key inside text input
linkInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addLink();
});

// Initial Fetch & Auto-sync polling every 4 seconds
fetchLinks();
setInterval(fetchLinks, 4000);