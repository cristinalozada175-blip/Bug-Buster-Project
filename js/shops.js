// ==========================================================
// shops.js — Python Garden Shop Management
// Flexible & Server-Ready Structure
// ==========================================================

// ================= CONFIGURATION =================
// Change this when connected to your backend/server
const API_ENDPOINTS = {
  items: '/api/shop-items',
  sync: '/api/sync'
};

// ================= DATA STORAGE =================
// Starts with sample data from your screenshot
// Will be replaced by server data when connected
let shopItems = [
  {
    id: 1,
    name: "Sunflower Seed",
    icon: "🌻",
    category: "seed",
    cost: 20,
    description: "Bright and cheerful sunflower. Grows tall and strong!",
    active: true
  },
  {
    id: 2,
    name: "Mushroom Spore",
    icon: "🍄",
    category: "seed",
    cost: 25,
    description: "Grows in shady, damp corners of your garden.",
    active: true
  },
  {
    id: 3,
    name: "Tulip Bulb",
    icon: "🌷",
    category: "seed",
    cost: 30,
    description: "Beautiful tulips in springtime colors.",
    active: true
  },
  {
    id: 4,
    name: "Cactus Sprout",
    icon: "🌵",
    category: "seed",
    cost: 35,
    description: "Tough and low-maintenance. Perfect for busy gardeners!",
    active: true
  },
  {
    id: 5,
    name: "Watering Can",
    icon: "💧",
    category: "tool",
    cost: 40,
    description: "Essential tool — keeps your plants hydrated and happy!",
    active: true
  },
  {
    id: 6,
    name: "Picket Fence",
    icon: "🪵",
    category: "decor",
    cost: 50,
    description: "Classic wooden fence. Keeps your garden neat and cozy.",
    active: true
  },
  {
    id: 7,
    name: "Garden Lantern",
    icon: "🏮",
    category: "decor",
    cost: 60,
    description: "Warm, glowing light for evening garden strolls.",
    active: true
  },
  {
    id: 8,
    name: "Lily Pond",
    icon: "🌊",
    category: "decor",
    cost: 80,
    description: "Serene water feature with floating lilies.",
    active: true
  }
];

// State
let currentFilter = {
  category: 'all',
  status: 'all',
  search: ''
};

// DOM Elements
const el = {
  shopGrid: document.getElementById('shopGrid'),
  emptyState: document.getElementById('emptyState'),
  categoryFilter: document.getElementById('categoryFilter'),
  statusFilter: document.getElementById('statusFilter'),
  searchInput: document.getElementById('searchInput'),
  addItemBtn: document.getElementById('addItemBtn'),
  emptyAddBtn: document.getElementById('emptyAddBtn'),
  itemModal: document.getElementById('itemModal'),
  modalTitle: document.getElementById('modalTitle'),
  closeModal: document.getElementById('closeModal'),
  cancelBtn: document.getElementById('cancelBtn'),
  itemForm: document.getElementById('itemForm'),
  itemId: document.getElementById('itemId'),
  itemName: document.getElementById('itemName'),
  itemIcon: document.getElementById('itemIcon'),
  itemCategory: document.getElementById('itemCategory'),
  itemCost: document.getElementById('itemCost'),
  itemDesc: document.getElementById('itemDesc'),
  itemActive: document.getElementById('itemActive'),
  toast: document.getElementById('toast'),
  toastIcon: document.getElementById('toastIcon'),
  toastMessage: document.getElementById('toastMessage'),
  totalItems: document.getElementById('totalItems'),
  seedCount: document.getElementById('seedCount'),
  toolCount: document.getElementById('toolCount'),
  decorCount: document.getElementById('decorCount'),
  activeCount: document.getElementById('activeCount'),
  lastSync: document.getElementById('lastSync')
};

// ================= HELPER FUNCTIONS =================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, icon = '✅') {
  el.toastMessage.textContent = message;
  el.toastIcon.textContent = icon;
  el.toast.classList.add('toast--show');
  setTimeout(() => el.toast.classList.remove('toast--show'), 3000);
}

function updateLastSync() {
  const now = new Date();
  el.lastSync.textContent = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// ================= SERVER INTEGRATION HELPERS =================
// Replace these functions when your backend is ready
async function fetchItemsFromServer() {
  // TODO: Replace with actual API call
  // const response = await fetch(API_ENDPOINTS.items);
  // shopItems = await response.json();
  // renderShopItems();
}

async function saveItemToServer(itemData) {
  // TODO: Replace with actual API call
  // const method = itemData.id ? 'PUT' : 'POST';
  // await fetch(API_ENDPOINTS.items, {
  //   method,
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(itemData)
  // });
}

async function deleteItemFromServer(id) {
  // TODO: Replace with actual API call
  // await fetch(`${API_ENDPOINTS.items}/${id}`, { method: 'DELETE' });
}

// ================= RENDER FUNCTIONS =================
function renderShopItems() {
  el.shopGrid.innerHTML = '';
  
  const filtered = shopItems.filter(item => {
    const matchCategory = currentFilter.category === 'all' || item.category === currentFilter.category;
    const matchStatus = currentFilter.status === 'all' ||
      (currentFilter.status === 'active' && item.active) ||
      (currentFilter.status === 'inactive' && !item.active);
    const matchSearch = currentFilter.search === '' ||
      item.name.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
      item.description.toLowerCase().includes(currentFilter.search.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  if (filtered.length === 0) {
    el.emptyState.style.display = 'block';
    return;
  }
  el.emptyState.style.display = 'none';

  filtered.forEach((item, index) => {
    const card = createCard(item, index);
    el.shopGrid.appendChild(card);
  });

  updateStats();
}

function createCard(item, index) {
  const card = document.createElement('div');
  card.className = `shop-card ${!item.active ? 'shop-card--inactive' : ''}`;
  card.style.animationDelay = `${index * 0.05}s`;

  const catColors = {
    seed: 'background: var(--shop-seed); color: #2d4a2a;',
    tool: 'background: var(--shop-tool); color: #5c4a00;',
    decor: 'background: var(--shop-decor); color: #fff;'
  };

  card.innerHTML = `
    ${!item.active ? '<span class="shop-card__status-badge">Hidden</span>' : ''}
    <div class="shop-card__header">
      <span class="shop-card__icon">${item.icon}</span>
      <span class="shop-card__category" style="${catColors[item.category]}">${item.category}</span>
    </div>
    <h3 class="shop-card__name">${escapeHtml(item.name)}</h3>
    <p class="shop-card__desc">${escapeHtml(item.description || 'No description.')}</p>
    <div class="shop-card__footer">
      <span class="shop-card__cost">🌱 ${item.cost}</span>
      <div class="shop-card__actions">
        <button class="btn-icon btn-icon--edit" data-id="${item.id}" title="Edit">✏️</button>
        <button class="btn-icon btn-icon--toggle" data-id="${item.id}" title="${item.active ? 'Hide' : 'Show'}">${item.active ? '👁️' : '🙈'}</button>
        <button class="btn-icon btn-icon--delete" data-id="${item.id}" title="Delete">🗑️</button>
      </div>
    </div>
  `;
  return card;
}

function updateStats() {
  el.totalItems.textContent = shopItems.length;
  el.seedCount.textContent = shopItems.filter(i => i.category === 'seed').length;
  el.toolCount.textContent = shopItems.filter(i => i.category === 'tool').length;
  el.decorCount.textContent = shopItems.filter(i => i.category === 'decor').length;
  el.activeCount.textContent = shopItems.filter(i => i.active).length;
}

// ================= CRUD OPERATIONS =================
function openAddModal() {
  el.modalTitle.textContent = 'Add New Shop Item';
  el.itemForm.reset();
  el.itemId.value = '';
  el.itemActive.checked = true;
  el.itemModal.classList.add('modal--open');
}

function openEditModal(id) {
  const item = shopItems.find(i => i.id === id);
  if (!item) return;
  
  el.modalTitle.textContent = 'Edit Shop Item';
  el.itemId.value = item.id;
  el.itemName.value = item.name;
  el.itemIcon.value = item.icon;
  el.itemCategory.value = item.category;
  el.itemCost.value = item.cost;
  el.itemDesc.value = item.description || '';
  el.itemActive.checked = item.active;
  el.itemModal.classList.add('modal--open');
}

function closeModal() {
  el.itemModal.classList.remove('modal--open');
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const itemData = {
    name: el.itemName.value.trim(),
    icon: el.itemIcon.value.trim(),
    category: el.itemCategory.value,
    cost: parseInt(el.itemCost.value, 10),
    description: el.itemDesc.value.trim(),
    active: el.itemActive.checked
  };

  const idVal = el.itemId.value;
  if (idVal) {
    // Edit existing
    const idx = shopItems.findIndex(i => i.id === parseInt(idVal, 10));
    if (idx !== -1) {
      shopItems[idx] = { ...shopItems[idx], ...itemData };
      showToast('Item updated successfully!', '✏️');
    }
  } else {
    // Add new
    const newId = shopItems.length > 0 ? Math.max(...shopItems.map(i => i.id)) + 1 : 1;
    shopItems.push({ id: newId, ...itemData });
    showToast('New item added!', '➕');
  }

  closeModal();
  renderShopItems();
  updateLastSync();
  
  // TODO: Uncomment when server is ready
  // saveItemToServer(itemData);
}

function toggleItem(id) {
  const item = shopItems.find(i => i.id === id);
  if (item) {
    item.active = !item.active;
    renderShopItems();
    updateLastSync();
    showToast(`Item ${item.active ? 'shown' : 'hidden'}!`, item.active ? '👁️' : '🙈');
    // TODO: Uncomment when server is ready
    // saveItemToServer(item);
  }
}

function deleteItem(id) {
  if (confirm('Are you sure you want to delete this item?')) {
    shopItems = shopItems.filter(i => i.id !== id);
    renderShopItems();
    updateLastSync();
    showToast('Item deleted.', '🗑️');
    // TODO: Uncomment when server is ready
    // deleteItemFromServer(id);
  }
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  // Add buttons
  el.addItemBtn.addEventListener('click', openAddModal);
  el.emptyAddBtn.addEventListener('click', openAddModal);
  
  // Modal close
  el.closeModal.addEventListener('click', closeModal);
  el.cancelBtn.addEventListener('click', closeModal);
  el.itemModal.addEventListener('click', (e) => {
    if (e.target === el.itemModal) closeModal();
  });
  
  // Form submit
  el.itemForm.addEventListener('submit', handleFormSubmit);
  
  // Filters
  el.categoryFilter.addEventListener('change', (e) => {
    currentFilter.category = e.target.value;
    renderShopItems();
  });
  
  el.statusFilter.addEventListener('change', (e) => {
    currentFilter.status = e.target.value;
    renderShopItems();
  });
  
  el.searchInput.addEventListener('input', (e) => {
    currentFilter.search = e.target.value;
    renderShopItems();
  });
  
  // Card actions — event delegation
  el.shopGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const id = parseInt(btn.dataset.id, 10);
    if (btn.classList.contains('btn-icon--edit')) {
      openEditModal(id);
    } else if (btn.classList.contains('btn-icon--toggle')) {
      toggleItem(id);
    } else if (btn.classList.contains('btn-icon--delete')) {
      deleteItem(id);
    }
  });
}

// ================= INITIALIZE =================
function init() {
  setupEventListeners();
  renderShopItems();
  updateLastSync();
  console.log('✅ Shop Manager initialized — Server-ready structure loaded');
  console.log('💡 When your API is ready, update API_ENDPOINTS and uncomment fetch/save functions');
}

// Start everything
init();

