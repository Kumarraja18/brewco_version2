'use strict';

/* ======================================================
   BREW & CO — app.js
   Handles: routing, validation, customer flow, owner flow
====================================================== */

// ── DATA ──────────────────────────────────────────────
const CAFES = [
  {id:1,name:'Brew & Co — Banjara Hills', loc:'Road No. 12, Banjara Hills', vibe:'Cozy',   emoji:'🏡',open:true, rating:'4.9'},
  {id:2,name:'Brew & Co — Jubilee Hills',  loc:'Film Nagar, Jubilee Hills',  vibe:'Lively', emoji:'🎭',open:true, rating:'4.8'},
  {id:3,name:'Brew & Co — Madhapur',       loc:'HITEC City, Madhapur',       vibe:'Quiet',  emoji:'💻',open:true, rating:'4.7'},
  {id:4,name:'Brew & Co — Gachibowli',     loc:'DLF Cyber City, Gachibowli', vibe:'Outdoor',emoji:'🌿',open:false,rating:'4.8'},
  {id:5,name:'Brew & Co — Kondapur',       loc:'Botanical Garden Road',      vibe:'Cozy',   emoji:'📚',open:true, rating:'4.6'},
];

const MENU = [
  {id:1, name:'Signature Espresso',  cat:'espresso', emoji:'☕', price:120, desc:'Double shot, medium roast — bold and clean.',    badge:'Bestseller'},
  {id:2, name:'Caramel Macchiato',   cat:'espresso', emoji:'🍮', price:195, desc:'Vanilla, espresso, caramel drizzle.',           badge:''},
  {id:3, name:'Hazelnut Latte',      cat:'espresso', emoji:'🌰', price:210, desc:'Smooth latte with house hazelnut syrup.',       badge:'New'},
  {id:4, name:'Flat White',          cat:'espresso', emoji:'🤍', price:175, desc:'Velvety microfoam over a ristretto shot.',     badge:''},
  {id:5, name:'Cold Brew Classic',   cat:'cold',     emoji:'🧊', price:180, desc:'18-hour steeped single-origin cold brew.',     badge:'Bestseller'},
  {id:6, name:'Nitro Cold Brew',     cat:'cold',     emoji:'✨', price:220, desc:'Nitrogen-infused for a creamy, silky sip.',    badge:'Popular'},
  {id:7, name:'Mocha Frappe',        cat:'cold',     emoji:'🍫', price:240, desc:'Chocolate espresso frappe with sea-salt cream.',badge:''},
  {id:8, name:'Masala Chai Latte',   cat:'tea',      emoji:'🫖', price:150, desc:'Assam tea, house spices, oat milk.',           badge:''},
  {id:9, name:'Matcha Latte',        cat:'tea',      emoji:'🍵', price:220, desc:'Ceremonial grade matcha with honey.',          badge:'Popular'},
  {id:10,name:'Banana Bread Slice',  cat:'food',     emoji:'🍌', price:120, desc:'Moist walnut banana bread, baked fresh daily.',badge:'Fresh Daily'},
  {id:11,name:'Avocado Toast',       cat:'food',     emoji:'🥑', price:220, desc:'Sourdough, smashed avo, feta, chilli flakes.', badge:''},
  {id:12,name:'Classic Croissant',   cat:'food',     emoji:'🥐', price:110, desc:'Buttery, flaky — baked each morning.',         badge:'Bestseller'},
];

const BOOKED_TABLES = [3, 7, 10];

// ── APP STATE ──────────────────────────────────────────
const App = {
  currentUser:   null,   // { name, email, role, cafeName? }
  selectedCafe:  null,
  cart:          [],
  selectedTable: null,
  orders: [              // mock incoming orders for owner
    {id:'ORD-001',customer:'Priya Nair',  items:'Nitro Cold Brew ×2, Banana Bread ×1',amount:520,time:'2 mins ago', status:'pending'},
    {id:'ORD-002',customer:'Rahul Verma', items:'Hazelnut Latte ×1, Croissant ×2',    amount:430,time:'5 mins ago', status:'pending'},
    {id:'ORD-003',customer:'Sneha Rao',   items:'Masala Chai Latte ×1',               amount:150,time:'9 mins ago', status:'accepted'},
    {id:'ORD-004',customer:'Arjun Das',   items:'Cold Brew Classic ×2, Avocado Toast ×1',amount:580,time:'14 mins ago',status:'rejected'},
    {id:'ORD-005',customer:'Meera Shah',  items:'Flat White ×1, Croissant ×1',        amount:285,time:'18 mins ago',status:'pending'},
  ],
  orderFilter: 'all',
};

// ── PAGE ROUTING ───────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById(id);
  if (pg) { pg.classList.add('active'); window.scrollTo(0,0); }
}
window.showPage = showPage;

// ── NAVBAR HAMBURGER ────────────────────────────────────
document.getElementById('ham')?.addEventListener('click', () => {
  document.getElementById('mob-menu')?.classList.toggle('open');
});
window.closeMob = () => document.getElementById('mob-menu')?.classList.remove('open');

// ── SMOOTH SCROLL (home links) ──────────────────────────
document.querySelectorAll('.nav-a').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({behavior:'smooth'});
    }
  });
});

// ── UTILS ───────────────────────────────────────────────
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => t.classList.remove('show'), 2800);
}
function clearErr(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}
function setErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// ── PASSWORD STRENGTH LIVE ──────────────────────────────
document.getElementById('reg-pw')?.addEventListener('input', () => {
  const pw = document.getElementById('reg-pw').value;
  const set = (id, ok) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('ok', ok);
    el.textContent = (ok ? '✓ ' : '✗ ') + el.textContent.slice(2);
  };
  set('rule-len', pw.length >= 8 && pw.length <= 16);
  set('rule-up',  /[A-Z]/.test(pw));
  set('rule-lo',  /[a-z]/.test(pw));
  set('rule-sp',  /[^a-zA-Z0-9]/.test(pw));
});

// ── TOGGLE PW VISIBILITY ────────────────────────────────
window.togglePw = (inputId, btnId) => {
  const inp = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  if (btn) btn.textContent = inp.type === 'password' ? '👁' : '🙈';
};

// ── ROLE SELECTION ──────────────────────────────────────
window.setRole = (role) => {
  document.querySelectorAll('.role-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.role === role);
  });
  const cafeField = document.getElementById('cafe-name-field');
  if (cafeField) cafeField.style.display = role === 'owner' ? 'block' : 'none';
};

// ── VALIDATE EMAIL ──────────────────────────────────────
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── VALIDATE PASSWORD ────────────────────────────────────
function validPassword(pw) {
  if (pw.length < 8 || pw.length > 16) return 'Password must be 8–16 characters.';
  if (!/[A-Z]/.test(pw)) return 'Password needs at least 1 uppercase letter.';
  if (!/[a-z]/.test(pw)) return 'Password needs at least 1 lowercase letter.';
  if (!/[^a-zA-Z0-9]/.test(pw)) return 'Password needs at least 1 special character.';
  return null;
}

// ── REGISTER ────────────────────────────────────────────
window.handleRegister = () => {
  // Clear previous errors
  ['err-fname','err-lname','err-reg-email','err-phone','err-reg-pw','err-cpw','err-terms','err-cafename'].forEach(clearErr);

  const role   = document.querySelector('.role-btn.active')?.dataset.role || 'customer';
  const fname  = val('reg-fname');
  const lname  = val('reg-lname');
  const email  = val('reg-email');
  const phone  = val('reg-phone');
  const cafe   = val('reg-cafename');
  const pw     = document.getElementById('reg-pw')?.value || '';
  const cpw    = document.getElementById('reg-cpw')?.value || '';
  const terms  = document.getElementById('reg-terms')?.checked;

  let ok = true;
  if (!fname)  { setErr('err-fname', 'First name is required.'); ok = false; }
  if (!lname)  { setErr('err-lname', 'Last name is required.'); ok = false; }
  if (!email)        { setErr('err-reg-email', 'Email is required.'); ok = false; }
  else if (!validEmail(email)) { setErr('err-reg-email', 'Email must contain @ symbol and be valid.'); ok = false; }
  if (!phone)  { setErr('err-phone', 'Phone number is required.'); ok = false; }
  if (role === 'owner' && !cafe) { setErr('err-cafename', 'Cafe name is required.'); ok = false; }

  const pwErr = validPassword(pw);
  if (pwErr) { setErr('err-reg-pw', pwErr); ok = false; }
  else if (pw !== cpw) { setErr('err-cpw', 'Passwords do not match.'); ok = false; }

  if (!terms) { setErr('err-terms', 'You must agree to the Terms of Service.'); ok = false; }

  if (!ok) return;

  // Simulate registration success
  App.currentUser = {
    name: fname + ' ' + lname,
    email,
    role,
    cafeName: role === 'owner' ? cafe : null,
  };

  toast(`✅ Account created! Welcome, ${fname}!`);

  if (role === 'customer') {
    setupCustomerDash();
    showPage('page-customer');
  } else {
    setupOwnerDash();
    showPage('page-owner');
  }
};

// ── LOGIN ────────────────────────────────────────────────
window.handleLogin = () => {
  const msgEl = document.getElementById('login-msg');
  msgEl.className = 'login-msg';

  const email = val('login-email');
  const pw    = document.getElementById('login-pw')?.value || '';

  clearErr('err-login-email');
  clearErr('err-login-pw');

  let ok = true;
  if (!email) { setErr('err-login-email', 'Email is required.'); ok = false; }
  else if (!validEmail(email)) { setErr('err-login-email', 'Email must contain @ symbol and be valid.'); ok = false; }

  if (!pw) { setErr('err-login-pw', 'Password is required.'); ok = false; }
  else {
    const pwErr = validPassword(pw);
    if (pwErr) { setErr('err-login-pw', pwErr); ok = false; }
  }

  if (!ok) return;

  // Simulate auth — accept any valid-format credentials
  msgEl.textContent = 'Signing you in...';
  msgEl.className = 'login-msg success';

  setTimeout(() => {
    // Determine role from email pattern for demo (real = DB query)
    const role = email.includes('owner') || email.includes('cafe') ? 'owner' : 'customer';
    App.currentUser = { name: email.split('@')[0], email, role, cafeName: 'Brew & Co — Demo' };
    if (role === 'customer') {
      setupCustomerDash();
      showPage('page-customer');
    } else {
      setupOwnerDash();
      showPage('page-owner');
    }
    toast(`☕ Welcome back, ${App.currentUser.name}!`);
  }, 900);
};

// ── DEMO QUICK LOGIN ──────────────────────────────────────
window.demoLogin = (role) => {
  App.currentUser = {
    name: role === 'customer' ? 'Priya Nair' : 'Ravi Menon',
    email: role === 'customer' ? 'priya@demo.com' : 'ravi.owner@demo.com',
    role,
    cafeName: 'Brew & Co — Banjara Hills',
  };
  if (role === 'customer') {
    setupCustomerDash();
    showPage('page-customer');
  } else {
    setupOwnerDash();
    showPage('page-owner');
  }
  toast(`☕ Logged in as demo ${role}!`);
};

// ── LOGOUT ────────────────────────────────────────────────
window.logout = () => {
  App.currentUser = null;
  App.cart = [];
  App.selectedCafe = null;
  App.selectedTable = null;
  showPage('page-home');
  toast('👋 Logged out successfully.');
};

// ═══════════════════════════════════════════════════════
//  CUSTOMER FLOW
// ═══════════════════════════════════════════════════════

function setupCustomerDash() {
  document.getElementById('cust-name-chip').textContent = '👤 ' + App.currentUser.name;
  App.cart = [];
  App.selectedCafe = null;
  App.selectedTable = null;
  custGo(1);
  renderCafes();
}

window.custGo = (step) => {
  [1,2,3,'success'].forEach(s => {
    const el = document.getElementById('cust-step' + s);
    if (el) el.style.display = 'none';
  });
  document.getElementById('cust-success').style.display = 'none';

  const show = document.getElementById(step === 'success' ? 'cust-success' : 'cust-step' + step);
  if (show) show.style.display = 'block';

  // Update step indicators
  for (let i = 1; i <= 3; i++) {
    const s = document.getElementById('dstep-' + i);
    if (s) s.classList.toggle('active', i === step);
  }

  if (step === 2) { renderMenu('all'); updateCartBar(); }
  if (step === 3) { renderTableMap(); renderCartSidebar(); renderBookingOrderSummary(); setMinDate(); }
};

// ── RENDER CAFES ──────────────────────────────────────────
function renderCafes() {
  const grid = document.getElementById('cafe-grid');
  if (!grid) return;
  grid.innerHTML = CAFES.map(c => `
    <div class="cafe-card glass-panel">
      <div class="cafe-img">
        <span class="cafe-vibe">${c.vibe}</span>${c.emoji}
      </div>
      <div class="cafe-body">
        <div class="cafe-name">${c.name}</div>
        <div class="cafe-loc">📍 ${c.loc}</div>
        <div class="cafe-meta">
          <span class="cafe-rating">⭐ ${c.rating}</span>
          <span class="cafe-open ${c.open?'y':'n'}">${c.open?'● Open Now':'● Closed'}</span>
        </div>
        <button class="btn-fill full select-cafe-btn" onclick="selectCafe(${c.id})" ${!c.open?'disabled style="opacity:.5;cursor:not-allowed"':''}>
          ${c.open ? 'Select & View Menu →' : 'Currently Closed'}
        </button>
      </div>
    </div>
  `).join('');
}

window.selectCafe = (id) => {
  App.selectedCafe = CAFES.find(c => c.id === id);
  App.cart = [];
  document.getElementById('selected-cafe-name').textContent = App.selectedCafe.name;
  document.getElementById('selected-cafe-loc').textContent = '📍 ' + App.selectedCafe.loc;
  custGo(2);
  toast(`📍 ${App.selectedCafe.name} selected`);
};

// ── RENDER MENU ───────────────────────────────────────────
function renderMenu(cat) {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  const items = cat === 'all' ? MENU : MENU.filter(i => i.cat === cat);
  grid.innerHTML = items.map(item => `
    <div class="m-card glass-panel">
      <div class="m-img">
        ${item.emoji}
        ${item.badge ? `<span class="m-badge">${item.badge}</span>` : ''}
      </div>
      <div class="m-body">
        <div class="m-name">${item.name}</div>
        <div class="m-desc">${item.desc}</div>
        <div class="m-foot">
          <span class="m-price">₹${item.price}</span>
          <button class="add-btn" onclick="addToCart(${item.id})" title="Add">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Menu tabs
document.getElementById('menu-tabs')?.addEventListener('click', e => {
  if (e.target.classList.contains('tab')) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    renderMenu(e.target.dataset.cat);
  }
});

// ── CART ───────────────────────────────────────────────────
window.addToCart = (id) => {
  const item = MENU.find(i => i.id === id);
  if (!item) return;
  const ex = App.cart.find(i => i.id === id);
  if (ex) ex.qty++;
  else App.cart.push({...item, qty: 1});
  updateCartBar();
  toast(`☕ ${item.name} added`);
};

function updateCartBar() {
  const bar = document.getElementById('cart-bar');
  const sum = document.getElementById('cart-summary');
  if (!bar) return;
  const count = App.cart.reduce((s,i) => s + i.qty, 0);
  const total = App.cart.reduce((s,i) => s + i.price * i.qty, 0);
  if (count === 0) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  sum.textContent = `${count} item${count>1?'s':''} — ₹${total}`;
}

function renderCartSidebar() {
  const el = document.getElementById('cart-items-list');
  if (!el) return;
  if (App.cart.length === 0) {
    el.innerHTML = '<p class="no-items">No items added yet.<br/>Browse the menu to add items.</p>';
    return;
  }
  el.innerHTML = App.cart.map(i => `
    <div class="cart-item-line">
      <span>${i.emoji} ${i.name} ×${i.qty}</span>
      <span>₹${i.price * i.qty}</span>
    </div>
  `).join('');
}

function renderBookingOrderSummary() {
  const box = document.getElementById('bk-order-summary');
  const itemsEl = document.getElementById('bk-order-items');
  const totalEl = document.getElementById('bk-total');
  if (!box) return;
  if (App.cart.length === 0) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  const total = App.cart.reduce((s,i) => s + i.price * i.qty, 0);
  itemsEl.innerHTML = App.cart.map(i => `
    <div class="cart-item-line">
      <span>${i.emoji} ${i.name} ×${i.qty}</span>
      <span>₹${i.price * i.qty}</span>
    </div>
  `).join('');
  totalEl.textContent = '₹' + total;
}

// ── TABLE MAP ──────────────────────────────────────────────
function renderTableMap() {
  const map = document.getElementById('table-map');
  if (!map) return;
  App.selectedTable = null;
  map.innerHTML = Array.from({length:12},(_,i)=>{
    const n = i + 1;
    const booked = BOOKED_TABLES.includes(n);
    const seats = n % 3 === 0 ? 4 : 2;
    return `
      <button class="tbl-btn ${booked?'booked':'avail'}" data-tbl="T${n}"
        ${booked?'disabled':''} onclick="selectTable('T${n}')">
        🪑 T${n}
        <span style="font-size:.65rem;color:var(--txts)">${seats}P</span>
      </button>
    `;
  }).join('');
}

window.selectTable = (id) => {
  App.selectedTable = id;
  document.querySelectorAll('.tbl-btn:not(.booked)').forEach(b => {
    b.classList.toggle('sel', b.dataset.tbl === id);
  });
  toast(`🪑 ${id} selected`);
};

// ── SET MIN DATE ───────────────────────────────────────────
function setMinDate() {
  const d = document.getElementById('bk-date');
  if (d) d.min = d.value = new Date().toISOString().split('T')[0];
}

// ── CONFIRM BOOKING ────────────────────────────────────────
window.confirmBooking = () => {
  const date   = val('bk-date');
  const time   = document.getElementById('bk-time')?.value;
  const guests = document.getElementById('bk-guests')?.value;

  if (!date)  { toast('⚠️ Please select a date'); return; }
  if (!time)  { toast('⚠️ Please select a time'); return; }
  if (!App.selectedTable) { toast('⚠️ Please select a table on the map'); return; }

  const ref = 'BKNG-' + Date.now().toString().slice(-6);

  document.getElementById('conf-cafe').textContent   = App.selectedCafe?.name || '—';
  document.getElementById('conf-dt').textContent     = date + ' at ' + time;
  document.getElementById('conf-table').textContent  = App.selectedTable;
  document.getElementById('conf-guests').textContent = guests + ' guest(s)';
  document.getElementById('conf-ref').textContent    = ref;

  custGo('success');
  toast('✅ Table booked! Ref: ' + ref);
};

// ═══════════════════════════════════════════════════════
//  OWNER FLOW
// ═══════════════════════════════════════════════════════

function setupOwnerDash() {
  document.getElementById('owner-name-chip').textContent = '🏪 ' + (App.currentUser.cafeName || App.currentUser.name);
  document.getElementById('owner-cafe-label').textContent = App.currentUser.cafeName || 'Your Cafe';
  renderBarChart();
  renderTopItems();
  renderOrders();
  ownerTab('analytics');
}

window.ownerTab = (tab) => {
  document.querySelectorAll('.otab').forEach((b,i) => {
    b.classList.toggle('active', (i === 0 && tab === 'analytics') || (i === 1 && tab === 'orders'));
  });
  document.getElementById('owner-analytics').style.display = tab === 'analytics' ? 'block' : 'none';
  document.getElementById('owner-orders').style.display    = tab === 'orders'    ? 'block' : 'none';
};

// ── BAR CHART ──────────────────────────────────────────────
function renderBarChart() {
  const data = [
    {day:'Mon',v:38},{day:'Tue',v:52},{day:'Wed',v:44},{day:'Thu',v:61},
    {day:'Fri',v:73},{day:'Sat',v:89},{day:'Sun',v:47},
  ];
  const max = Math.max(...data.map(d => d.v));
  const el = document.getElementById('bar-chart');
  if (!el) return;
  el.innerHTML = data.map(d => `
    <div class="bar-wrap">
      <span class="bar-val">${d.v}</span>
      <div class="bar" style="height:${Math.max(8,(d.v/max)*120)}px"></div>
      <span class="bar-label">${d.day}</span>
    </div>
  `).join('');
}

// ── TOP ITEMS ──────────────────────────────────────────────
function renderTopItems() {
  const items = [
    {emoji:'☕',name:'Signature Espresso',count:84,pct:100},
    {emoji:'🧊',name:'Cold Brew Classic', count:71,pct:85},
    {emoji:'🥐',name:'Classic Croissant', count:63,pct:75},
    {emoji:'✨',name:'Nitro Cold Brew',   count:58,pct:69},
    {emoji:'🍵',name:'Matcha Latte',      count:49,pct:58},
  ];
  const el = document.getElementById('top-items');
  if (!el) return;
  el.innerHTML = items.map(i => `
    <div class="top-item-row">
      <span class="ti-emoji">${i.emoji}</span>
      <div class="ti-info">
        <div class="ti-name">${i.name}</div>
        <div class="ti-bar-bg"><div class="ti-bar" style="width:${i.pct}%"></div></div>
      </div>
      <span class="ti-count">${i.count}</span>
    </div>
  `).join('');
}

// ── RENDER ORDERS ─────────────────────────────────────────
function renderOrders() {
  const list = document.getElementById('orders-list');
  if (!list) return;
  const filtered = App.orderFilter === 'all'
    ? App.orders
    : App.orders.filter(o => o.status === App.orderFilter);

  if (filtered.length === 0) {
    list.innerHTML = '<p style="color:var(--txts);text-align:center;padding:40px 0">No orders found.</p>';
    return;
  }

  list.innerHTML = filtered.map(o => `
    <div class="order-card glass-panel" id="order-card-${o.id}">
      <div class="order-card-left">
        <div class="order-id">${o.id}</div>
        <div class="order-cust">${o.customer}</div>
        <div class="order-items-str">${o.items}</div>
        <div class="order-meta">
          <span>🕐 ${o.time}</span>
        </div>
        ${o.status !== 'pending' ? `
          <div class="order-actions">
            <span class="order-status status-${o.status}">
              ${o.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
            </span>
          </div>
        ` : `
          <div class="order-actions">
            <button class="act-btn act-accept" onclick="handleOrder('${o.id}','accepted')">✓ Accept</button>
            <button class="act-btn act-reject" onclick="handleOrder('${o.id}','rejected')">✗ Reject</button>
          </div>
        `}
      </div>
      <div>
        <div class="order-amt">₹${o.amount}</div>
      </div>
    </div>
  `).join('');
}

window.handleOrder = (id, action) => {
  const order = App.orders.find(o => o.id === id);
  if (!order) return;
  order.status = action;
  renderOrders();

  // Update stat
  if (action === 'accepted') {
    const cur = parseInt(document.getElementById('stat-orders').textContent) || 0;
    document.getElementById('stat-orders').textContent = cur + 1;
    const rev = parseInt((document.getElementById('stat-revenue').textContent||'0').replace(/[₹,]/g,'')) || 0;
    document.getElementById('stat-revenue').textContent = '₹' + (rev + order.amount).toLocaleString('en-IN');
  }

  toast(action === 'accepted'
    ? `✅ Order ${id} accepted`
    : `❌ Order ${id} rejected`
  );
};

window.filterOrders = (f, btn) => {
  App.orderFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOrders();
};

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showPage('page-home');
});