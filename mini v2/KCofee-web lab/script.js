/* ============================================================
   BREW & CO — Complete JavaScript
   Two Roles: Customer & Cafe Owner | localStorage persistence
   ============================================================ */

// ============================================================
// DATA LAYER — localStorage helpers
// ============================================================
const DB = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  getOne(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  setOne(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  remove(key) { localStorage.removeItem(key); },
  uid() { return Math.random().toString(36).substr(2, 9) + Date.now().toString(36); },
  ref() { return 'BRW-' + Math.random().toString(36).substr(2, 6).toUpperCase(); }
};

// ============================================================
// SEED DATA — runs once
// ============================================================
function seedData() {
  if (DB.get('cafes').length) return;

  const cafes = [
    { id: 'cafe1', name: 'Brew & Co Downtown', ownerId: '', city: 'Mumbai', state: 'Maharashtra', street: '123 MG Road', pincode: '400001', openingTime: '08:00', closingTime: '22:00', rating: 4.5, description: 'Our flagship location with premium ambiance and artisan brews.', image: 'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?w=400&h=250&fit=crop' },
    { id: 'cafe2', name: 'Brew & Co Koramangala', ownerId: '', city: 'Bangalore', state: 'Karnataka', street: '45 5th Block', pincode: '560095', openingTime: '07:00', closingTime: '23:00', rating: 4.7, description: 'The tech-hub favorite — fast service and great WiFi.', image: 'https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg?w=400&h=250&fit=crop' },
    { id: 'cafe3', name: 'Brew & Co Jubilee Hills', ownerId: '', city: 'Hyderabad', state: 'Telangana', street: '78 Road No. 36', pincode: '500033', openingTime: '08:30', closingTime: '21:30', rating: 4.3, description: 'A cozy retreat in the heart of Jubilee Hills.', image: 'https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?w=400&h=250&fit=crop' }
  ];

  const categories = [
    { id: 'cat1', cafeId: 'cafe1', name: 'Beverages' }, { id: 'cat2', cafeId: 'cafe1', name: 'Snacks' },
    { id: 'cat3', cafeId: 'cafe1', name: 'Desserts' }, { id: 'cat4', cafeId: 'cafe1', name: 'Add-ons' },
    { id: 'cat5', cafeId: 'cafe2', name: 'Beverages' }, { id: 'cat6', cafeId: 'cafe2', name: 'Snacks' },
    { id: 'cat7', cafeId: 'cafe3', name: 'Beverages' }, { id: 'cat8', cafeId: 'cafe3', name: 'Snacks' }
  ];

  const menuItems = [
    { id: 'm1', cafeId: 'cafe1', categoryId: 'cat1', name: 'Espresso', description: 'Rich and bold single shot', price: 150, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300&h=200&fit=crop' },
    { id: 'm2', cafeId: 'cafe1', categoryId: 'cat1', name: 'Cappuccino', description: 'Creamy frothy classic', price: 200, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=200&fit=crop' },
    { id: 'm3', cafeId: 'cafe1', categoryId: 'cat1', name: 'Cold Brew', description: 'Smooth cold-steeped coffee', price: 250, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop' },
    { id: 'm4', cafeId: 'cafe1', categoryId: 'cat1', name: 'Matcha Latte', description: 'Japanese green tea latte', price: 280, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=300&h=200&fit=crop' },
    { id: 'm5', cafeId: 'cafe1', categoryId: 'cat2', name: 'Croissant', description: 'Buttery flaky French pastry', price: 120, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=300&h=200&fit=crop' },
    { id: 'm6', cafeId: 'cafe1', categoryId: 'cat2', name: 'Chicken Sandwich', description: 'Grilled chicken with herbs', price: 220, type: 'NON-VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&h=200&fit=crop' },
    { id: 'm7', cafeId: 'cafe1', categoryId: 'cat3', name: 'Chocolate Brownie', description: 'Warm gooey chocolate delight', price: 180, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=200&fit=crop' },
    { id: 'm8', cafeId: 'cafe1', categoryId: 'cat4', name: 'Extra Shot', description: 'Add an extra espresso shot', price: 50, type: 'VEG', isAvailable: true, isAddon: true, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=300&h=200&fit=crop' },
    { id: 'm9', cafeId: 'cafe1', categoryId: 'cat4', name: 'Whipped Cream', description: 'Fresh whipped cream topping', price: 40, type: 'VEG', isAvailable: true, isAddon: true, image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=300&h=200&fit=crop' },
    // Cafe 2
    { id: 'm10', cafeId: 'cafe2', categoryId: 'cat5', name: 'Filter Coffee', description: 'South Indian style', price: 100, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop' },
    { id: 'm11', cafeId: 'cafe2', categoryId: 'cat5', name: 'Americano', description: 'Espresso with hot water', price: 170, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=300&h=200&fit=crop' },
    { id: 'm12', cafeId: 'cafe2', categoryId: 'cat5', name: 'Latte', description: 'Smooth milk and espresso', price: 210, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=300&h=200&fit=crop' },
    { id: 'm13', cafeId: 'cafe2', categoryId: 'cat6', name: 'Veg Puff', description: 'Crispy vegetable puff', price: 60, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1583338917451-face2751d8d5?w=300&h=200&fit=crop' },
    { id: 'm14', cafeId: 'cafe2', categoryId: 'cat6', name: 'Paneer Wrap', description: 'Spiced paneer in a tortilla', price: 180, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&h=200&fit=crop' },
    // Cafe 3
    { id: 'm15', cafeId: 'cafe3', categoryId: 'cat7', name: 'Irani Chai', description: 'Hyderabadi special', price: 80, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop' },
    { id: 'm16', cafeId: 'cafe3', categoryId: 'cat7', name: 'Mocha', description: 'Chocolate meets espresso', price: 240, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=300&h=200&fit=crop' },
    { id: 'm17', cafeId: 'cafe3', categoryId: 'cat8', name: 'Osmania Biscuit', description: 'Classic Hyderabadi cookie', price: 40, type: 'VEG', isAvailable: true, isAddon: false, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=200&fit=crop' }
  ];

  const tables = [];
  ['cafe1','cafe2','cafe3'].forEach(cid => {
    for (let i = 1; i <= 8; i++) {
      tables.push({
        id: DB.uid(), cafeId: cid,
        tableNumber: 'T' + i,
        capacity: i <= 4 ? 4 : 6,
        tableType: i <= 4 ? 'Standard' : 'Premium',
        status: 'available'
      });
    }
  });

  DB.set('cafes', cafes);
  DB.set('menuCategories', categories);
  DB.set('menuItems', menuItems);
  DB.set('tables', tables);
  DB.set('orders', []);
  DB.set('bookings', []);
  if (!DB.get('users').length) DB.set('users', []);
}

// ============================================================
// NAVIGATION
// ============================================================
let currentCafeId = null;   // for ordering flow
let orderState = {};        // current order in progress
let trackingInterval = null;

function navigate(page, data) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const el = document.getElementById(page + '-page');
  if (el) {
    el.classList.add('active');
    window.scrollTo(0, 0);
  }

  // Page-specific init
  switch (page) {
    case 'home': updateHeaderAuth(); break;
    case 'login': break;
    case 'register': initRegister(); break;
    case 'customer-dashboard': initCustomerDash(); break;
    case 'cafes': initCafes(); break;
    case 'cafe-detail': initCafeDetail(data); break;
    case 'order-tracking': initOrderTracking(data); break;
    case 'my-orders': initMyOrders(); break;
    case 'my-bookings': initMyBookings(); break;
    case 'cafe-setup': initCafeSetup(); break;
    case 'cafe-owner-dashboard': initOwnerDash(); break;
  }
}

// ============================================================
// AUTH — Header toggle
// ============================================================
function getUser() { return DB.getOne('currentUser'); }

function updateHeaderAuth() {
  const user = getUser();
  const authBtns = document.getElementById('header-auth-buttons');
  const userArea = document.getElementById('header-user-area');
  if (!authBtns || !userArea) return;
  if (user) {
    authBtns.classList.add('hidden');
    userArea.classList.remove('hidden');
    document.getElementById('header-user-name').textContent = user.firstName + ' ' + user.lastName;
    document.getElementById('header-user-role').textContent = user.role === 'cafe_owner' ? 'Café Owner' : 'Customer';
  } else {
    authBtns.classList.remove('hidden');
    userArea.classList.add('hidden');
  }
}

// ============================================================
// LOGIN
// ============================================================
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errDiv = document.getElementById('login-error');
  errDiv.classList.add('hidden');

  if (!email || !password) { showErr(errDiv, 'Please fill all fields'); return; }
  if (!email.includes('@')) { showErr(errDiv, 'Enter a valid email'); return; }

  // Call server
  const loginData = { email: email, password: password };
  fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success && data.user) {
      DB.setOne('currentUser', data.user);
      document.getElementById('login-form').reset();
      navigate('customer-dashboard');
    } else {
      showErr(errDiv, data.error || 'Login failed');
    }
  })
  .catch(err => showErr(errDiv, 'Server error: ' + err.message));
}

function guestLogin() {
  const guest = { id: DB.uid(), email: 'guest@brewco.com', firstName: 'Guest', lastName: 'User', role: 'customer', isProfileComplete: true };
  DB.setOne('currentUser', guest);
  navigate('customer-dashboard');
}

function logout() {
  DB.remove('currentUser');
  if (trackingInterval) clearInterval(trackingInterval);
  navigate('home');
}

function showErr(el, msg) { el.textContent = msg; el.classList.remove('hidden'); }

// ============================================================
// REGISTER — Simple form
// ============================================================
function initRegister() {
  // Reset form and errors
  const form = document.getElementById('register-form');
  if (form) form.reset();
  const errDiv = document.getElementById('register-error');
  if (errDiv) errDiv.classList.add('hidden');
}

function handleRegister(e) {
  if (e) e.preventDefault();
  const errDiv = document.getElementById('register-error');
  errDiv.classList.add('hidden');

  const firstName = document.getElementById('reg-firstName').value.trim();
  const lastName = document.getElementById('reg-lastName').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const pw = document.getElementById('reg-password').value;
  const cpw = document.getElementById('reg-confirmPassword').value;

  if (!firstName || !lastName || !email || !phone) { showErr(errDiv, 'Please fill First Name, Last Name, Email and Phone'); return; }
  if (!email.includes('@')) { showErr(errDiv, 'Email must contain @ symbol'); return; }
  if (pw.length < 8 || pw.length > 16) { showErr(errDiv, 'Password must be 8-16 characters long'); return; }
  if (!/[A-Z]/.test(pw)) { showErr(errDiv, 'Password must contain at least 1 uppercase letter'); return; }
  if (!/[a-z]/.test(pw)) { showErr(errDiv, 'Password must contain at least 1 lowercase letter'); return; }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) { showErr(errDiv, 'Password must contain at least 1 special character'); return; }
  if (pw !== cpw) { showErr(errDiv, 'Passwords do not match'); return; }

  // Call server
  const regData = { firstName: firstName, lastName: lastName, email: email, phone: phone, password: pw };
  fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Welcome ' + firstName + '! Account created successfully.\nYou can now sign in.');
      navigate('login');
      document.getElementById('login-email').value = email;
      document.getElementById('register-form').reset();
    } else {
      showErr(errDiv, data.error || 'Registration failed');
    }
  })
  .catch(err => showErr(errDiv, 'Server error: ' + err.message));
}

// ============================================================
// CUSTOMER DASHBOARD
// ============================================================
function initCustomerDash() {
  const user = getUser();
  if (!user) { navigate('login'); return; }

  document.getElementById('cust-dash-name').textContent = user.firstName;
  document.getElementById('cust-welcome').textContent = `Welcome back, ${user.firstName} ☕`;

  const orders = DB.get('orders').filter(o => o.customerId === user.id);
  const active = orders.filter(o => !['delivered','cancelled'].includes(o.status));
  const completed = orders.filter(o => o.status === 'delivered');

  document.getElementById('stat-active').textContent = active.length;
  document.getElementById('stat-completed').textContent = completed.length;
  document.getElementById('stat-total').textContent = orders.length;

  const container = document.getElementById('cust-active-orders');
  if (active.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">☕</div><h3>No active orders</h3><p>Browse cafés and place your first order!</p><button class="btn primary" onclick="navigate(\'cafes\')">Browse Cafés</button></div>';
  } else {
    container.innerHTML = active.slice(0, 3).map(o => `
      <div class="card order-card">
        <h4>${o.orderRef}</h4>
        <div class="order-meta">
          <span class="status-badge ${o.status.replace(' ','-')}">${o.status}</span>
          &nbsp; ${o.orderType} &nbsp; ₹${o.grandTotal}
        </div>
        <button class="btn small primary" onclick="navigate('order-tracking','${o.id}')">Track Order</button>
      </div>
    `).join('');
  }
}

// ============================================================
// BROWSE CAFES
// ============================================================
function initCafes() {
  // Auth area
  const area = document.getElementById('cafes-auth-area');
  const user = getUser();
  if (user) {
    area.innerHTML = `<span class="user-info"><span>${user.firstName}</span><span class="role-badge">${user.role === 'cafe_owner' ? 'Owner' : 'Customer'}</span></span><a href="#" class="btn-nav btn-danger" onclick="logout(); return false;">Logout</a>`;
  } else {
    area.innerHTML = `<a href="#" class="btn-nav" onclick="navigate('login'); return false;">Login</a><a href="#" class="btn-nav btn-primary" onclick="navigate('register'); return false;">Register</a>`;
  }
  renderCafes();
}

function renderCafes() {
  const query = (document.getElementById('cafe-search')?.value || '').toLowerCase();
  const cafes = DB.get('cafes').filter(c =>
    c.name.toLowerCase().includes(query) || c.city.toLowerCase().includes(query)
  );
  const container = document.getElementById('cafes-list');
  if (!cafes.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">☕</div><h3>No cafés found</h3><p>Try a different search term.</p></div>';
    return;
  }
  container.innerHTML = cafes.map(c => `
    <div class="card cafe-card" onclick="navigate('cafe-detail','${c.id}')">
      <div class="cafe-card-img">${c.image ? `<img src="${c.image}" alt="${c.name}"/>` : '<img src="https://images.pexels.com/photos/1813466/pexels-photo-1813466.jpeg?w=400&h=250&fit=crop" alt="Cafe"/>'}</div>
      <h3>${c.name}</h3>
      <div class="cafe-meta">
        📍 ${c.city}, ${c.state}<br/>
        ⭐ ${c.rating} &nbsp;|&nbsp; ${c.openingTime} — ${c.closingTime}
      </div>
    </div>
  `).join('');
}

function filterCafes() { renderCafes(); }

// ============================================================
// CAFE DETAIL & ORDERING FLOW
// ============================================================
function initCafeDetail(cafeId) {
  currentCafeId = cafeId;
  const cafe = DB.get('cafes').find(c => c.id === cafeId);
  if (!cafe) { navigate('cafes'); return; }

  // Auth area
  const area = document.getElementById('cafe-detail-auth');
  const user = getUser();
  if (user) {
    area.innerHTML = `<span class="user-info"><span>${user.firstName}</span></span><a href="#" class="btn-nav btn-danger" onclick="logout(); return false;">Logout</a>`;
  } else {
    area.innerHTML = `<a href="#" class="btn-nav" onclick="navigate('login'); return false;">Login</a>`;
  }

  // Header
  const cafeImg = cafe.image || 'https://images.pexels.com/photos/1813466/pexels-photo-1813466.jpeg?w=400&h=250&fit=crop';
  document.getElementById('cafe-detail-header').innerHTML = `
    <img src="${cafeImg}" alt="${cafe.name}" class="cafe-header-img" />
    <div>
      <h2>${cafe.name}</h2>
      <div class="cafe-desc">📍 ${cafe.street}, ${cafe.city} &nbsp;|&nbsp; ⭐ ${cafe.rating} &nbsp;|&nbsp; ${cafe.openingTime} — ${cafe.closingTime}</div>
      <div class="cafe-desc" style="margin-top:.3rem">${cafe.description}</div>
    </div>
  `;

  // Reset order state
  orderState = { cafeId, orderType: '', tableId: '', date: '', time: '', guests: 1, cart: [], specialInstructions: '' };
  showOrderStep('type');
}

function showOrderStep(step) {
  ['type','table','datetime','menu'].forEach(s => {
    document.getElementById('order-step-' + s).classList.add('hidden');
  });
  document.getElementById('order-step-' + step).classList.remove('hidden');
}

function selectOrderType(type, el) {
  orderState.orderType = type;
  document.querySelectorAll('.order-type-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function confirmOrderType() {
  if (!orderState.orderType) { alert('Please select an order type'); return; }
  if (orderState.orderType === 'dine-in') {
    renderOrderTables();
    showOrderStep('table');
  } else {
    orderState.tableId = '';
    orderState.date = '';
    orderState.time = '';
    renderMenu();
    showOrderStep('menu');
  }
}

function orderBack(step) { showOrderStep(step); }

// Table selection
function renderOrderTables() {
  const tables = DB.get('tables').filter(t => t.cafeId === currentCafeId);
  const grid = document.getElementById('order-tables-grid');
  grid.innerHTML = tables.map(t => `
    <div class="table-card ${t.status} ${orderState.tableId === t.id ? 'selected' : ''}"
         onclick="${t.status === 'available' ? `selectTable('${t.id}', this)` : ''}">
      <div class="table-num">${t.tableNumber}</div>
      <div class="table-info">${t.tableType} · ${t.capacity} seats</div>
      <span class="status-badge ${t.status}">${t.status}</span>
    </div>
  `).join('');
}

function selectTable(tableId, el) {
  orderState.tableId = tableId;
  document.querySelectorAll('#order-tables-grid .table-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function confirmTable() {
  if (!orderState.tableId) { alert('Please select a table'); return; }
  renderDateTimeStep();
  showOrderStep('datetime');
}

function renderDateTimeStep() {
  // Set min date to today
  const dateInput = document.getElementById('order-date');
  dateInput.min = new Date().toISOString().split('T')[0];
  dateInput.value = new Date().toISOString().split('T')[0];

  // Guests
  const table = DB.get('tables').find(t => t.id === orderState.tableId);
  const guestsSelect = document.getElementById('order-guests');
  guestsSelect.innerHTML = '';
  for (let i = 1; i <= (table?.capacity || 4); i++) {
    guestsSelect.innerHTML += `<option value="${i}">${i} guest${i > 1 ? 's' : ''}</option>`;
  }

  // Time slots
  const cafe = DB.get('cafes').find(c => c.id === currentCafeId);
  const container = document.getElementById('order-time-slots');
  const [oh, om] = (cafe?.openingTime || '08:00').split(':').map(Number);
  const [ch, cm] = (cafe?.closingTime || '22:00').split(':').map(Number);
  let slots = [];
  let h = oh, m = om;
  while (h < ch || (h === ch && m < cm)) {
    const label = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    slots.push(label);
    m += 30;
    if (m >= 60) { h++; m = 0; }
  }
  container.innerHTML = slots.map(s => `
    <div class="time-slot ${orderState.time === s ? 'selected' : ''}" onclick="selectTimeSlot('${s}', this)">${s}</div>
  `).join('');
}

function selectTimeSlot(time, el) {
  orderState.time = time;
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

function confirmDateTime() {
  const date = document.getElementById('order-date').value;
  const guests = document.getElementById('order-guests').value;
  if (!date) { alert('Please select a date'); return; }
  if (!orderState.time) { alert('Please select a time slot'); return; }
  orderState.date = date;
  orderState.guests = parseInt(guests);
  renderMenu();
  showOrderStep('menu');
}

// ============================================================
// MENU & CART
// ============================================================
function renderMenu() {
  const categories = DB.get('menuCategories').filter(c => c.cafeId === currentCafeId);
  const allItems = DB.get('menuItems').filter(i => i.cafeId === currentCafeId && i.isAvailable);

  // Category tabs
  const tabsEl = document.getElementById('menu-category-tabs');
  const activeCat = categories[0]?.id || '';
  tabsEl.innerHTML = categories.map((c, i) => `
    <div class="cat-tab ${i === 0 ? 'active' : ''}" onclick="switchCategory('${c.id}', this)">${c.name}</div>
  `).join('');

  renderMenuItems(activeCat);
  renderCart();
}

function switchCategory(catId, el) {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderMenuItems(catId);
}

function renderMenuItems(catId) {
  const items = DB.get('menuItems').filter(i => i.cafeId === currentCafeId && i.categoryId === catId && i.isAvailable);
  const grid = document.getElementById('menu-items-grid');
  grid.innerHTML = items.map(item => {
    const inCart = orderState.cart.find(c => c.itemId === item.id);
    const qty = inCart ? inCart.qty : 0;
    return `
      <div class="menu-item-card">
        <div class="menu-item-img">${item.image ? `<img src="${item.image}" alt="${item.name}"/>` : '🍽️'}</div>
        <div>
          <span class="veg-dot ${item.type === 'VEG' ? 'veg' : 'nonveg'}"></span>
          <span style="font-size:.75rem;color:var(--muted)">${item.type}</span>
        </div>
        <h4>${item.name}</h4>
        <div class="item-desc">${item.description}</div>
        <div class="item-price">₹${item.price}</div>
        <div class="item-actions">
          ${qty > 0 ? `
            <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
            <span class="qty-display">${qty}</span>
            <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
          ` : `
            <button class="btn small primary" onclick="addToCart('${item.id}')">Add +</button>
          `}
        </div>
      </div>
    `;
  }).join('') || '<p style="color:var(--muted);grid-column:1/-1">No items in this category.</p>';
}

function addToCart(itemId) {
  const item = DB.get('menuItems').find(i => i.id === itemId);
  if (!item) return;
  const existing = orderState.cart.find(c => c.itemId === itemId);
  if (existing) { existing.qty++; }
  else { orderState.cart.push({ itemId, name: item.name, price: item.price, qty: 1 }); }
  refreshMenuAndCart();
}

function changeQty(itemId, delta) {
  const item = orderState.cart.find(c => c.itemId === itemId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) orderState.cart = orderState.cart.filter(c => c.itemId !== itemId);
  refreshMenuAndCart();
}

function refreshMenuAndCart() {
  // Re-render current category items
  const activeTab = document.querySelector('.cat-tab.active');
  if (activeTab) {
    const catId = DB.get('menuCategories').filter(c => c.cafeId === currentCafeId);
    const idx = [...document.querySelectorAll('.cat-tab')].indexOf(activeTab);
    if (catId[idx]) renderMenuItems(catId[idx].id);
  }
  renderCart();
}

function renderCart() {
  const countEl = document.getElementById('cart-count');
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-subtotal');
  const resInfo = document.getElementById('cart-reservation-info');

  const totalQty = orderState.cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = orderState.cart.reduce((s, c) => s + c.price * c.qty, 0);

  countEl.textContent = totalQty;
  totalEl.textContent = '₹' + subtotal;

  itemsEl.innerHTML = orderState.cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${c.name}</div>
        <div class="cart-item-price">₹${c.price} × ${c.qty}</div>
      </div>
      <div style="display:flex;align-items:center;gap:.4rem">
        <button class="qty-btn" onclick="changeQty('${c.itemId}', -1)">−</button>
        <span class="qty-display">${c.qty}</span>
        <button class="qty-btn" onclick="changeQty('${c.itemId}', 1)">+</button>
      </div>
    </div>
  `).join('') || '<p style="color:var(--muted);font-size:.85rem">Your cart is empty</p>';

  // Reservation info
  if (orderState.orderType === 'dine-in' && orderState.tableId) {
    const table = DB.get('tables').find(t => t.id === orderState.tableId);
    resInfo.classList.remove('hidden');
    resInfo.innerHTML = `🍽️ Dine-In | Table ${table?.tableNumber || '?'} | ${orderState.date} | ${orderState.time} | ${orderState.guests} guest(s)`;
  } else {
    resInfo.classList.add('hidden');
  }
}

// ============================================================
// PLACE ORDER
// ============================================================
function placeOrder() {
  const user = getUser();
  if (!user) { alert('Please log in to place an order'); navigate('login'); return; }
  if (!orderState.cart.length) { alert('Your cart is empty!'); return; }

  const subtotal = orderState.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax;

  const order = {
    id: DB.uid(),
    orderRef: DB.ref(),
    customerId: user.id,
    cafeId: currentCafeId,
    orderType: orderState.orderType === 'dine-in' ? 'Dine-In' : 'Takeaway',
    status: 'placed',
    items: [...orderState.cart],
    subtotal, tax, grandTotal,
    specialInstructions: document.getElementById('special-instructions')?.value || '',
    tableId: orderState.tableId || null,
    bookingDate: orderState.date || null,
    bookingTime: orderState.time || null,
    guests: orderState.guests || null,
    paymentStatus: 'pending',
    createdAt: new Date().toISOString()
  };

  const orders = DB.get('orders');
  orders.push(order);
  DB.set('orders', orders);

  // Create booking if dine-in
  if (orderState.orderType === 'dine-in' && orderState.tableId) {
    const bookings = DB.get('bookings');
    bookings.push({
      id: DB.uid(), cafeId: currentCafeId, customerId: user.id,
      tableId: orderState.tableId, bookingDate: orderState.date,
      startTime: orderState.time, numberOfGuests: orderState.guests,
      status: 'confirmed', orderRef: order.orderRef
    });
    DB.set('bookings', bookings);

    // Mark table occupied
    const tables = DB.get('tables');
    const tbl = tables.find(t => t.id === orderState.tableId);
    if (tbl) tbl.status = 'occupied';
    DB.set('tables', tables);
  }

  alert(`Order placed! Ref: ${order.orderRef}\nTotal: ₹${grandTotal}`);
  navigate('order-tracking', order.id);
}

// ============================================================
// ORDER TRACKING
// ============================================================
const STATUS_FLOW = ['placed','confirmed','in-kitchen','preparing','ready','delivered'];
const STATUS_ICONS = ['📝','✅','🍳','🔥','🔔','🎉'];
const STATUS_MSG = {
  placed: 'Your order has been placed successfully!',
  confirmed: 'Your order is confirmed by the café.',
  'in-kitchen': 'Your order is being prepared in the kitchen.',
  preparing: 'Almost there! Your order is being finalized.',
  ready: 'Your order is ready for pickup / serving!',
  delivered: 'Enjoy your meal! 🎉',
  cancelled: 'This order has been cancelled.'
};

function initOrderTracking(orderId) {
  if (trackingInterval) clearInterval(trackingInterval);

  const render = () => {
    const order = DB.get('orders').find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('tracking-title').textContent = `Order: ${order.orderRef}`;

    // Timeline
    const timeline = document.getElementById('tracking-timeline');
    if (order.status === 'cancelled') {
      timeline.innerHTML = '<div style="text-align:center;color:var(--danger);font-size:3rem">❌</div>';
      document.getElementById('tracking-status-msg').textContent = STATUS_MSG.cancelled;
      document.getElementById('tracking-status-msg').style.color = 'var(--danger)';
    } else {
      const currentIdx = STATUS_FLOW.indexOf(order.status);
      let html = '';
      STATUS_FLOW.forEach((s, i) => {
        const cls = i <= currentIdx ? 'done' : (i === currentIdx + 1 ? 'current' : '');
        html += `<div class="track-step ${cls}"><div class="track-circle">${i <= currentIdx ? STATUS_ICONS[i] : i + 1}</div><div class="track-label">${s.replace('-',' ')}</div></div>`;
        if (i < STATUS_FLOW.length - 1) html += `<div class="track-line ${i < currentIdx ? 'done' : ''}"></div>`;
      });
      timeline.innerHTML = html;
      document.getElementById('tracking-status-msg').textContent = STATUS_MSG[order.status] || '';
      document.getElementById('tracking-status-msg').style.color = 'var(--brown)';
    }

    // Details
    const cafe = DB.get('cafes').find(c => c.id === order.cafeId);
    document.getElementById('tracking-details').innerHTML = `
      <div class="detail-row"><span class="label">Status</span><span class="value"><span class="status-badge ${order.status}">${order.status}</span></span></div>
      <div class="detail-row"><span class="label">Café</span><span class="value">${cafe?.name || '-'}</span></div>
      <div class="detail-row"><span class="label">Order Type</span><span class="value">${order.orderType}</span></div>
      <div class="detail-row"><span class="label">Subtotal</span><span class="value">₹${order.subtotal}</span></div>
      <div class="detail-row"><span class="label">Tax (5%)</span><span class="value">₹${order.tax}</span></div>
      <div class="detail-row"><span class="label">Grand Total</span><span class="value" style="font-size:1.1rem">₹${order.grandTotal}</span></div>
      <div class="detail-row"><span class="label">Payment</span><span class="value">${order.paymentStatus}</span></div>
      ${order.specialInstructions ? `<div class="detail-row"><span class="label">Instructions</span><span class="value">${order.specialInstructions}</span></div>` : ''}
    `;
  };

  render();

  // Auto-advance order status every 8s for demo
  trackingInterval = setInterval(() => {
    const orders = DB.get('orders');
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === 'delivered' || order.status === 'cancelled') {
      clearInterval(trackingInterval);
      return;
    }
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < STATUS_FLOW.length - 1) {
      order.status = STATUS_FLOW[idx + 1];
      if (order.status === 'delivered') order.paymentStatus = 'paid';
      DB.set('orders', orders);
      render();
    }
  }, 8000);
}

// ============================================================
// MY ORDERS
// ============================================================
function initMyOrders() {
  const user = getUser();
  if (!user) { navigate('login'); return; }

  const filters = ['all','placed','confirmed','preparing','ready','delivered'];
  const tabsEl = document.getElementById('order-filter-tabs');
  tabsEl.innerHTML = filters.map((f, i) => `
    <div class="filter-tab ${i === 0 ? 'active' : ''}" onclick="filterOrders('${f}', this)">${f.toUpperCase()}</div>
  `).join('');

  filterOrders('all', tabsEl.firstElementChild);
}

function filterOrders(status, el) {
  const user = getUser();
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');

  let orders = DB.get('orders').filter(o => o.customerId === user.id);
  if (status !== 'all') orders = orders.filter(o => o.status === status);

  const container = document.getElementById('my-orders-list');
  if (!orders.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><h3>No orders found</h3><p>Your ${status} orders will appear here.</p><button class="btn primary" onclick="navigate('cafes')">Browse Cafés</button></div>`;
    return;
  }
  container.innerHTML = orders.map(o => `
    <div class="card order-card" onclick="navigate('order-tracking','${o.id}')" style="cursor:pointer">
      <h4>${o.orderRef}</h4>
      <div class="order-meta">
        <span class="status-badge ${o.status}">${o.status}</span>
        &nbsp; ${o.orderType} &nbsp; ₹${o.grandTotal}
      </div>
      <div style="font-size:.8rem;color:var(--muted)">${new Date(o.createdAt).toLocaleDateString()}</div>
    </div>
  `).join('');
}

// ============================================================
// MY BOOKINGS
// ============================================================
function initMyBookings() {
  const user = getUser();
  if (!user) { navigate('login'); return; }

  const bookings = DB.get('bookings').filter(b => b.customerId === user.id);
  const container = document.getElementById('my-bookings-list');

  if (!bookings.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><h3>No bookings yet</h3><p>Make a dine-in order to create a booking.</p></div>';
    return;
  }

  container.innerHTML = bookings.map(b => {
    const table = DB.get('tables').find(t => t.id === b.tableId);
    return `
      <div class="card order-card">
        <h4>${b.orderRef || 'Booking'}</h4>
        <div class="order-meta">
          Table ${table?.tableNumber || '?'} &nbsp;|&nbsp; ${b.bookingDate} &nbsp;|&nbsp; ${b.startTime} &nbsp;|&nbsp; ${b.numberOfGuests} guests
        </div>
        <span class="status-badge ${b.status}">${b.status}</span>
      </div>
    `;
  }).join('');
}

// ============================================================
// CAFE SETUP (Owner)
// ============================================================
let setupStep = 0;
const SETUP_STEPS = ['Basic Info','Address','Business','Bank','Services','Review','Photos'];

function initCafeSetup() {
  setupStep = 0;
  renderSetupIndicator();
  showSetupStep(0);
  // Pre-fill from user
  const user = getUser();
  if (user) {
    document.getElementById('setup-ownerName').value = (user.firstName + ' ' + user.lastName).trim();
    document.getElementById('setup-email').value = user.email || '';
    document.getElementById('setup-contact').value = user.phone || '';
  }
}

function renderSetupIndicator() {
  const el = document.getElementById('setup-steps-indicator');
  el.innerHTML = SETUP_STEPS.map((s, i) => `
    <div class="ssi-step ${i < setupStep ? 'done' : ''} ${i === setupStep ? 'active' : ''}">${s}</div>
  `).join('');
}

function showSetupStep(n) {
  document.querySelectorAll('#cafe-setup-page .step-section').forEach(s => s.classList.remove('active'));
  const sec = document.querySelector(`#cafe-setup-page .step-section[data-setup-step="${n}"]`);
  if (sec) sec.classList.add('active');
  renderSetupIndicator();

  // Render review if step 5
  if (n === 5) renderSetupReview();
}

function setupNext() {
  if (setupStep < SETUP_STEPS.length - 1) { setupStep++; showSetupStep(setupStep); }
}
function setupPrev() {
  if (setupStep > 0) { setupStep--; showSetupStep(setupStep); }
}

function renderSetupReview() {
  const el = document.getElementById('setup-review-summary');
  el.innerHTML = `
    <h4 style="color:var(--brown);margin-bottom:1rem">Application Summary</h4>
    <div class="detail-row"><span class="label">Café Name</span><span class="value">${val('setup-cafeName')}</span></div>
    <div class="detail-row"><span class="label">Owner</span><span class="value">${val('setup-ownerName')}</span></div>
    <div class="detail-row"><span class="label">Email</span><span class="value">${val('setup-email')}</span></div>
    <div class="detail-row"><span class="label">City</span><span class="value">${val('setup-city')}</span></div>
    <div class="detail-row"><span class="label">State</span><span class="value">${val('setup-state')}</span></div>
    <div class="detail-row"><span class="label">Hours</span><span class="value">${val('setup-openTime')} — ${val('setup-closeTime')}</span></div>
    <div class="detail-row"><span class="label">Business Type</span><span class="value">${val('setup-bizType')}</span></div>
    <div class="detail-row"><span class="label">Tables</span><span class="value">${val('setup-totalTables')}</span></div>
    <div class="detail-row"><span class="label">Status</span><span class="value">Pending Verification</span></div>
    <div class="detail-row"><span class="label">Date</span><span class="value">${new Date().toLocaleDateString()}</span></div>
  `;
}

function val(id) { return document.getElementById(id)?.value || '-'; }

function submitCafeSetup() {
  const user = getUser();
  if (!user) { navigate('login'); return; }

  const cafeName = val('setup-cafeName');
  if (!cafeName || cafeName === '-') { alert('Please enter a café name in Step 1'); return; }

  // Create café
  const newCafe = {
    id: DB.uid(),
    name: cafeName,
    ownerId: user.id,
    street: val('setup-street'), city: val('setup-city'),
    state: val('setup-state'), pincode: val('setup-pincode'),
    openingTime: val('setup-openTime'), closingTime: val('setup-closeTime'),
    rating: 4.0, description: 'Freshly setup café by ' + val('setup-ownerName'),
    image: '', bizType: val('setup-bizType'),
    fssai: val('setup-fssai'), gst: val('setup-gst')
  };

  const cafes = DB.get('cafes');
  cafes.push(newCafe);
  DB.set('cafes', cafes);

  // Create default tables
  const totalTables = parseInt(val('setup-totalTables')) || 5;
  const tables = DB.get('tables');
  for (let i = 1; i <= totalTables; i++) {
    tables.push({
      id: DB.uid(), cafeId: newCafe.id,
      tableNumber: 'T' + i, capacity: i <= Math.ceil(totalTables / 2) ? 4 : 6,
      tableType: i <= Math.ceil(totalTables / 2) ? 'Standard' : 'Premium',
      status: 'available'
    });
  }
  DB.set('tables', tables);

  // Create default categories
  const cats = DB.get('menuCategories');
  ['Beverages','Snacks','Desserts','Add-ons'].forEach(name => {
    cats.push({ id: DB.uid(), cafeId: newCafe.id, name });
  });
  DB.set('menuCategories', cats);

  // Mark user profile complete
  const users = DB.get('users');
  const u = users.find(x => x.id === user.id);
  if (u) { u.isProfileComplete = true; DB.set('users', users); }
  user.isProfileComplete = true;
  DB.setOne('currentUser', user);

  alert('Café application submitted successfully! Welcome to Brew & Co.');
  navigate('cafe-owner-dashboard');
}

// ============================================================
// CAFE OWNER DASHBOARD
// ============================================================
function initOwnerDash() {
  const user = getUser();
  if (!user || user.role !== 'cafe_owner') { navigate('login'); return; }

  const cafes = DB.get('cafes').filter(c => c.ownerId === user.id);
  const cafe = cafes[0]; // Owner's first cafe

  if (!cafe) { navigate('cafe-setup'); return; }

  document.getElementById('owner-cafe-name').textContent = '☕ ' + cafe.name;
  document.getElementById('owner-sidebar-user').textContent = user.firstName + ' ' + user.lastName;

  // Overview stats
  const orders = DB.get('orders').filter(o => o.cafeId === cafe.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr));
  const totalRev = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.grandTotal, 0);
  const todayRev = todayOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.grandTotal, 0);
  const completed = orders.filter(o => o.status === 'delivered').length;

  document.getElementById('owner-stats').innerHTML = `
    <div class="owner-stat-card"><div class="os-value">₹${totalRev}</div><div class="os-label">Total Revenue</div></div>
    <div class="owner-stat-card"><div class="os-value">₹${todayRev}</div><div class="os-label">Today's Revenue</div></div>
    <div class="owner-stat-card"><div class="os-value">${todayOrders.length}</div><div class="os-label">Today's Orders</div></div>
    <div class="owner-stat-card"><div class="os-value">${completed}</div><div class="os-label">Completed</div></div>
  `;

  // Pending count
  const pending = orders.filter(o => !['delivered','cancelled'].includes(o.status)).length;
  document.getElementById('owner-pending-count').textContent = pending;

  // Orders list
  renderOwnerOrders(cafe.id);
  renderOwnerMenu(cafe.id);
  renderOwnerTables(cafe.id);
  renderOwnerBookings(cafe.id);

  // Show overview tab
  ownerTab('overview', document.querySelector('.sidebar-nav a'));
}

function ownerTab(tab, el) {
  ['overview','orders','menu','tables','bookings'].forEach(t => {
    document.getElementById('owner-tab-' + t).classList.add('hidden');
  });
  document.getElementById('owner-tab-' + tab).classList.remove('hidden');
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
}

function getOwnerCafe() {
  const user = getUser();
  return DB.get('cafes').find(c => c.ownerId === user?.id);
}

function renderOwnerOrders(cafeId) {
  const orders = DB.get('orders').filter(o => o.cafeId === cafeId);
  const el = document.getElementById('owner-orders-list');
  if (!orders.length) { el.innerHTML = '<p style="color:var(--muted)">No orders yet.</p>'; return; }
  el.innerHTML = orders.map(o => `
    <div class="card order-card" style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h4>${o.orderRef}</h4>
        <span class="status-badge ${o.status}">${o.status}</span>
      </div>
      <div class="order-meta">${o.orderType} &nbsp;|&nbsp; ₹${o.grandTotal} &nbsp;|&nbsp; ${new Date(o.createdAt).toLocaleDateString()}</div>
      <div style="margin-top:.5rem;display:flex;gap:.5rem;flex-wrap:wrap">
        ${o.status !== 'delivered' && o.status !== 'cancelled' ? `
          <button class="btn small success" onclick="advanceOrder('${o.id}')">Advance Status</button>
          <button class="btn small danger" onclick="cancelOrder('${o.id}')">Cancel</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function advanceOrder(orderId) {
  const orders = DB.get('orders');
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  const idx = STATUS_FLOW.indexOf(order.status);
  if (idx < STATUS_FLOW.length - 1) {
    order.status = STATUS_FLOW[idx + 1];
    if (order.status === 'delivered') order.paymentStatus = 'paid';
    DB.set('orders', orders);
    const cafe = getOwnerCafe();
    if (cafe) { renderOwnerOrders(cafe.id); initOwnerDash(); }
  }
}

function cancelOrder(orderId) {
  if (!confirm('Cancel this order?')) return;
  const orders = DB.get('orders');
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'cancelled';
    DB.set('orders', orders);
    const cafe = getOwnerCafe();
    if (cafe) { renderOwnerOrders(cafe.id); initOwnerDash(); }
  }
}

function renderOwnerMenu(cafeId) {
  const items = DB.get('menuItems').filter(i => i.cafeId === cafeId);
  const el = document.getElementById('owner-menu-list');
  if (!items.length) { el.innerHTML = '<p style="color:var(--muted)">No menu items. Add some!</p>'; return; }
  el.innerHTML = `<table class="data-table"><thead><tr><th>Name</th><th>Price</th><th>Type</th><th>Category</th><th>Available</th></tr></thead><tbody>
    ${items.map(i => {
      const cat = DB.get('menuCategories').find(c => c.id === i.categoryId);
      return `<tr><td>${i.name}</td><td>₹${i.price}</td><td>${i.type}</td><td>${cat?.name || '-'}</td><td>${i.isAvailable ? '✅' : '❌'}</td></tr>`;
    }).join('')}
  </tbody></table>`;
}

function renderOwnerTables(cafeId) {
  const tables = DB.get('tables').filter(t => t.cafeId === cafeId);
  const el = document.getElementById('owner-tables-list');
  if (!tables.length) { el.innerHTML = '<p style="color:var(--muted)">No tables. Add some!</p>'; return; }
  el.innerHTML = `<table class="data-table"><thead><tr><th>Table #</th><th>Capacity</th><th>Type</th><th>Status</th></tr></thead><tbody>
    ${tables.map(t => `<tr><td>${t.tableNumber}</td><td>${t.capacity}</td><td>${t.tableType}</td><td><span class="status-badge ${t.status}">${t.status}</span></td></tr>`).join('')}
  </tbody></table>`;
}

function renderOwnerBookings(cafeId) {
  const bookings = DB.get('bookings').filter(b => b.cafeId === cafeId);
  const el = document.getElementById('owner-bookings-list');
  if (!bookings.length) { el.innerHTML = '<p style="color:var(--muted)">No bookings yet.</p>'; return; }
  el.innerHTML = `<table class="data-table"><thead><tr><th>Ref</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th></tr></thead><tbody>
    ${bookings.map(b => `<tr><td>${b.orderRef || '-'}</td><td>${b.bookingDate}</td><td>${b.startTime}</td><td>${b.numberOfGuests}</td><td><span class="status-badge ${b.status}">${b.status}</span></td></tr>`).join('')}
  </tbody></table>`;
}

// ============================================================
// MODALS
// ============================================================
function openMenuModal() { document.getElementById('modal-menu').classList.remove('hidden'); }
function openTableModal() { document.getElementById('modal-table').classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function addMenuItem() {
  const cafe = getOwnerCafe();
  if (!cafe) return;
  const name = document.getElementById('modal-itemName').value.trim();
  const price = parseFloat(document.getElementById('modal-itemPrice').value);
  if (!name || !price) { alert('Name and price are required'); return; }

  const catName = document.getElementById('modal-itemCat').value;
  const cats = DB.get('menuCategories').filter(c => c.cafeId === cafe.id);
  let cat = cats.find(c => c.name === catName);
  if (!cat) {
    cat = { id: DB.uid(), cafeId: cafe.id, name: catName };
    const allCats = DB.get('menuCategories');
    allCats.push(cat);
    DB.set('menuCategories', allCats);
  }

  const items = DB.get('menuItems');
  items.push({
    id: DB.uid(), cafeId: cafe.id, categoryId: cat.id,
    name, description: document.getElementById('modal-itemDesc').value.trim(),
    price, type: document.getElementById('modal-itemType').value,
    isAvailable: document.getElementById('modal-itemAvail').checked,
    isAddon: document.getElementById('modal-itemAddon').checked
  });
  DB.set('menuItems', items);

  closeModal('modal-menu');
  renderOwnerMenu(cafe.id);
  // Reset modal
  document.getElementById('modal-itemName').value = '';
  document.getElementById('modal-itemDesc').value = '';
  document.getElementById('modal-itemPrice').value = '';
}

function addTable() {
  const cafe = getOwnerCafe();
  if (!cafe) return;
  const num = document.getElementById('modal-tableNum').value.trim();
  if (!num) { alert('Table number is required'); return; }

  const tables = DB.get('tables');
  tables.push({
    id: DB.uid(), cafeId: cafe.id,
    tableNumber: num,
    capacity: parseInt(document.getElementById('modal-tableCap').value) || 4,
    tableType: document.getElementById('modal-tableType').value,
    status: 'available'
  });
  DB.set('tables', tables);

  closeModal('modal-table');
  renderOwnerTables(cafe.id);
  document.getElementById('modal-tableNum').value = '';
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  seedData();
  updateHeaderAuth();

  // If logged in, redirect to dashboard
  const user = getUser();
  if (user) {
    if (user.role === 'customer') navigate('customer-dashboard');
    else if (user.role === 'cafe_owner') {
      if (user.isProfileComplete) navigate('cafe-owner-dashboard');
      else navigate('cafe-setup');
    }
  }
});
