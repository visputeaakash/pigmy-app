/* ========================================
   PIGMY PWA — Main App Logic
   Routing, DOM manipulation, form handling
   ======================================== */

// Global State
let allAccounts = [];
let allFeeds = [];
let unsubscribeAccounts = null;
let unsubscribeFeeds = null;
let renderLimit = 50;

// DOM Ready
document.addEventListener("DOMContentLoaded", async () => {
  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('✅ Service Worker registered'))
      .catch(err => console.error('SW Error:', err));
  }

  // Set today's date in date pickers
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('feed-date-input').value = today;
  document.getElementById('cutoff-date-input').value = today;
  document.getElementById('acc-date-input').value = today;

  // Network Listeners
  const updateNetworkBadge = () => {
    const badge = document.getElementById('network-badge');
    if (navigator.onLine) {
      badge.classList.add('hidden');
    } else {
      badge.classList.remove('hidden');
    }
  };
  window.addEventListener('online', updateNetworkBadge);
  window.addEventListener('offline', updateNetworkBadge);
  updateNetworkBadge();

  // Initialize Firebase DB
  await initDB();

  // Authentication State Listener
  onAuthStateChange(user => {
    if (user) {
      document.querySelector('.bottom-nav').classList.remove('hidden');
      navigate('home');
      
      // Setup Real-time Listeners
      unsubscribeAccounts = onAccountsChange(accounts => {
        allAccounts = accounts;
        updateAccountDropdowns();
        renderPortfolios();
      });

      unsubscribeFeeds = onFeedsChange(feeds => {
        allFeeds = feeds;
        updateDashboard();
        renderAuditTrail();
        renderPortfolios(); // re-render balances
      });
      
      updateDashboard();
    } else {
      if (unsubscribeAccounts) unsubscribeAccounts();
      if (unsubscribeFeeds) unsubscribeFeeds();
      
      document.querySelector('.bottom-nav').classList.add('hidden');
      allAccounts = [];
      allFeeds = [];
      
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      document.getElementById('screen-login').classList.remove('hidden');
    }
  });
  
  // Setup Form Listeners
  setupForms();
});

// ============================================================
// NAVIGATION (SPA Routing)
// ============================================================
function navigate(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  
  // Show target screen
  document.getElementById(`screen-${screenId}`).classList.remove('hidden');
  window.scrollTo(0, 0);

  // Update bottom nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-item[data-target="${screenId}"]`);
  if (navBtn) navBtn.classList.add('active');
  else document.querySelector(`.nav-item[data-target="more"]`).classList.add('active');
}

function showMoreMenu() {
  document.getElementById('more-menu-overlay').classList.remove('hidden');
}

function hideMoreMenu() {
  document.getElementById('more-menu-overlay').classList.add('hidden');
}

// ============================================================
// UI UPDATERS
// ============================================================

const fmtMoney = (num) => '₹' + (num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function updateDashboard() {
  const stats = await getDashboardStats();
  document.getElementById('kpi-corpus').innerText = fmtMoney(stats.totalNet);
  document.getElementById('kpi-sunday').innerText = fmtMoney(stats.sundayTotal);
  document.getElementById('kpi-sunday-days').innerText = stats.sundayCount;
  document.getElementById('kpi-audit').innerText = stats.pendingSlips;
  document.getElementById('kpi-accounts').innerText = stats.activeAccounts;
}

function updateAccountDropdowns() {
  const feedSelect = document.getElementById('feed-account-select');
  const cutoffSelect = document.getElementById('cutoff-account-select');
  const auditFilter = document.getElementById('audit-filter');

  const optionsHTML = allAccounts
    .filter(a => a.status === 'Active')
    .map(a => `<option value="${a.id}">${a.bank_name} - ${a.holder_name} (${a.id})</option>`)
    .join('');
    
  feedSelect.innerHTML = optionsHTML;
  cutoffSelect.innerHTML = optionsHTML;
  
  const filterOptionsHTML = '<option value="">-- All Accounts --</option>' + 
    allAccounts.map(a => `<option value="${a.id}">${a.bank_name} (${a.id})</option>`).join('');
  auditFilter.innerHTML = filterOptionsHTML;
}

// ============================================================
// RENDERERS
// ============================================================

async function renderPortfolios() {
  const tbody = document.querySelector('#table-portfolios tbody');
  const balances = await getAccountBalances();
  
  if (balances.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-dim">No accounts found.</td></tr>`;
    return;
  }

  tbody.innerHTML = balances.map(acc => {
    const statusBadge = acc.status === 'Active' 
      ? `<span class="badge badge-status">${acc.status}</span>`
      : `<span class="badge badge-danger">${acc.status}</span>`;
      
    const slips = acc.unverified_count > 0
      ? `<span class="badge badge-pending text-xs">${acc.unverified_count} Pending</span>`
      : `<span class="badge badge-verified text-xs">Verified</span>`;
      
    return `
      <tr>
        <td><strong>${acc.bank_name}</strong><br><span class="text-xs text-dim">${acc.holder_name}</span></td>
        <td><code>${acc.account_number}</code></td>
        <td>${acc.agent_name}</td>
        <td class="text-accent fw-bold">${fmtMoney(acc.total_balance)}<br>${slips}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="btn-group" style="flex-wrap:nowrap;">
            <button class="btn btn-sm btn-ghost" onclick="openAccountDetails('${acc.id}')" title="View Details">👁️</button>
            ${acc.status === 'Active' ? `<button class="btn btn-sm btn-warning" onclick="openCloseAccount('${acc.id}')" title="Mature Account">Close</button>` : ''}
            <button class="btn btn-sm btn-danger" onclick="confirmDeleteAccount('${acc.id}')" title="Delete">Del</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderAuditTrail() {
  const filterAcc = document.getElementById('audit-filter').value;
  const searchQ = (document.getElementById('audit-search').value || '').toLowerCase();
  const tbody = document.querySelector('#table-audit tbody');
  
  let filteredFeeds = allFeeds;
  if (filterAcc) filteredFeeds = filteredFeeds.filter(f => f.account_number === filterAcc);
  if (searchQ) {
    filteredFeeds = filteredFeeds.filter(f => 
      (f.receipt_or_slip_no || '').toLowerCase().includes(searchQ) ||
      (f.notes || '').toLowerCase().includes(searchQ)
    );
  }

  if (filteredFeeds.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-dim">No entries found.</td></tr>`;
    document.getElementById('btn-load-more').classList.add('hidden');
    return;
  }
  
  const toRender = filteredFeeds.slice(0, renderLimit);
  if (toRender.length < filteredFeeds.length) {
    document.getElementById('btn-load-more').classList.remove('hidden');
  } else {
    document.getElementById('btn-load-more').classList.add('hidden');
  }

  // Helper to get bank name
  const getBank = accNum => {
    const acc = allAccounts.find(a => a.id === accNum);
    return acc ? acc.bank_name : accNum;
  };

  tbody.innerHTML = filteredFeeds.map(f => {
    const status = f.passbook_verified
      ? `<span class="badge badge-verified">✅</span>`
      : `<span class="badge badge-pending">⚠️</span>`;
      
    const actionBtns = f.passbook_verified
      ? `<div class="btn-group">
           <button class="btn btn-sm btn-ghost" onclick="openEditFeed('${f.id}')">✏️</button>
           <button class="btn btn-sm btn-danger" onclick="confirmDeleteFeed('${f.id}')">🗑️</button>
         </div>`
      : `<div class="btn-group">
           <button class="btn btn-sm btn-warning" onclick="handleVerifyFeed('${f.id}')">Stamp</button>
           <button class="btn btn-sm btn-ghost" onclick="openEditFeed('${f.id}')">✏️</button>
           <button class="btn btn-sm btn-danger" onclick="confirmDeleteFeed('${f.id}')">🗑️</button>
         </div>`;

    return `
      <tr>
        <td>${f.feed_date}<br><span class="text-xs text-dim">${f.day_of_week.substring(0,3)}</span></td>
        <td>${getBank(f.account_number)}<br><code>${f.account_number}</code></td>
        <td class="fw-bold">${fmtMoney(f.net_deposited)}<br><span class="text-xs text-dim">${f.receipt_or_slip_no}</span></td>
        <td>${status}</td>
        <td>${actionBtns}</td>
      </tr>
    `;
  }).join('');
}

// ============================================================
// FORM SUBMISSIONS
// ============================================================

function setupForms() {
  // Login Form
  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-login');
    btn.disabled = true;
    btn.innerText = 'Authenticating...';
    
    try {
      const email = document.getElementById('login-email').value;
      const pwd = document.getElementById('login-password').value;
      await loginUser(email, pwd);
      showToast('✅ Securely logged in!', 'success');
      e.target.reset();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Login Securely';
    }
  });

  // Edit Feed
  document.getElementById('form-edit-feed').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-edit');
    btn.disabled = true;
    try {
      const id = document.getElementById('edit-feed-id').value;
      const dep = parseFloat(document.getElementById('edit-deposit').value);
      const ded = parseFloat(document.getElementById('edit-deduction').value);
      const notes = document.getElementById('edit-notes').value;
      await updateFeed(id, {
        deposit_amount: dep,
        expense_or_deduction: ded,
        net_deposited: dep - ded,
        notes: notes
      });
      showToast('✅ Entry updated!', 'success');
      document.getElementById('modal-edit-feed').classList.add('hidden');
    } catch(err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });
  
  // Close Account
  document.getElementById('form-close-account').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-close');
    btn.disabled = true;
    try {
      const id = document.getElementById('close-acc-id').value;
      const amt = parseFloat(document.getElementById('close-withdrawal').value);
      const date = document.getElementById('close-date').value;
      await closeAccount(id, amt, date);
      showToast('✅ Account marked as matured!', 'success');
      document.getElementById('modal-close-account').classList.add('hidden');
      navigate('portfolios');
    } catch(err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });

  // Add Feed
  document.getElementById('form-add-feed').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-feed');
    btn.disabled = true;
    btn.innerText = 'Saving...';
    
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      data.passbook_verified = formData.get('passbook_verified') === 'on';
      
      await addFeed(data);
      showToast('✅ Collection saved!', 'success');
      e.target.reset();
      document.getElementById('feed-date-input').value = new Date().toISOString().slice(0, 10); // reset date to today
      navigate('home');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Save Collection';
    }
  });

  // Add Cutoff
  document.getElementById('form-add-cutoff').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-cutoff');
    btn.disabled = true;
    
    try {
      const formData = new FormData(e.target);
      await addCutoffFeed(Object.fromEntries(formData.entries()));
      showToast('✅ Cutoff recorded!', 'success');
      e.target.reset();
      document.getElementById('cutoff-date-input').value = new Date().toISOString().slice(0, 10);
      navigate('home');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });

  // Add Account
  document.getElementById('form-add-account').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-account');
    btn.disabled = true;
    
    try {
      const formData = new FormData(e.target);
      await addAccount(Object.fromEntries(formData.entries()));
      showToast('✅ Account registered!', 'success');
      e.target.reset();
      document.getElementById('acc-date-input').value = new Date().toISOString().slice(0, 10);
      navigate('portfolios');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });
}

// ============================================================
// ACTIONS (Delete, Verify, Modals, Details)
// ============================================================

function loadMoreFeeds() {
  renderLimit += 50;
  renderAuditTrail();
}

function openEditFeed(id) {
  const f = allFeeds.find(x => x.id === id);
  if (!f) return;
  document.getElementById('edit-feed-id').value = f.id;
  document.getElementById('edit-deposit').value = f.deposit_amount;
  document.getElementById('edit-deduction').value = f.expense_or_deduction || 0;
  document.getElementById('edit-notes').value = (f.receipt_or_slip_no !== 'DAILY_AGENT_RECEIPT' ? f.receipt_or_slip_no + ' ' : '') + (f.notes || '');
  document.getElementById('modal-edit-feed').classList.remove('hidden');
}

function openCloseAccount(id) {
  document.getElementById('close-acc-id').value = id;
  document.getElementById('close-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('modal-close-account').classList.remove('hidden');
}

async function openAccountDetails(id) {
  const acc = allAccounts.find(a => a.id === id);
  if (!acc) return;
  
  const accFeeds = allFeeds.filter(f => f.account_number === id).sort((a,b) => new Date(b.feed_date) - new Date(a.feed_date));
  const bal = accFeeds.reduce((sum, f) => sum + (f.net_deposited || 0), 0);
  
  document.getElementById('detail-bank-name').innerText = acc.bank_name;
  document.getElementById('detail-balance').innerText = fmtMoney(bal);
  
  const statusEl = document.getElementById('detail-status');
  statusEl.innerText = acc.status;
  if (acc.status === 'Matured') statusEl.style.color = 'var(--warning)';
  else statusEl.style.color = 'var(--accent)';
  
  document.getElementById('detail-acc-no').innerText = acc.account_number;
  document.getElementById('detail-holder').innerText = acc.holder_name;
  document.getElementById('detail-agent').innerText = acc.agent_name;
  document.getElementById('detail-freq').innerText = acc.frequency;
  document.getElementById('detail-opened').innerText = acc.opening_date;
  
  const tbody = document.querySelector('#table-detail-timeline tbody');
  tbody.innerHTML = accFeeds.map(f => `
    <tr>
      <td>${f.feed_date}</td>
      <td class="fw-bold">${fmtMoney(f.net_deposited)}</td>
      <td class="text-xs text-dim">${f.receipt_or_slip_no}<br>${f.notes || ''}</td>
    </tr>
  `).join('');
  
  navigate('account-details');
}

async function handleVerifyFeed(id) {
  try {
    await verifyFeed(id);
    showToast('✅ Passbook stamped!', 'success');
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

// Global modal handlers
let modalConfirmAction = null;

function showModal(title, text, confirmAction) {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-text').innerText = text;
  modalConfirmAction = confirmAction;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  modalConfirmAction = null;
}

document.getElementById('modal-confirm-btn').addEventListener('click', async () => {
  if (modalConfirmAction) {
    const btn = document.getElementById('modal-confirm-btn');
    btn.disabled = true;
    try {
      await modalConfirmAction();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      closeModal();
    }
  }
});

function confirmDeleteFeed(id) {
  showModal('Delete Entry', 'Are you sure you want to delete this collection entry? This cannot be undone.', async () => {
    await deleteFeed(id);
    showToast('🗑️ Entry deleted', 'info');
  });
}

function confirmDeleteAccount(id) {
  showModal('Delete Account', `Type 'DELETE' to permanently purge account ${id} and ALL its feeds.`, async () => {
    // Basic protection
    const conf = prompt(`Type DELETE to purge account ${id}:`);
    if (conf === 'DELETE') {
      await deleteAccount(id);
      showToast('🗑️ Account purged', 'info');
    } else {
      showToast('Cancelled delete', 'info');
    }
  });
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Icon map
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';
  
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}
