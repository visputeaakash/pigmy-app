/* ========================================
   PIGMY PWA — Main App Logic v3.0
   Routing, DOM, Analytics, Risk, Charts
   ======================================== */

// Global State
let allAccounts = [];
let allFeeds = [];
let unsubscribeAccounts = null;
let unsubscribeFeeds = null;
let renderLimit = 50;
let currentDetailAccountId = null;

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

  // Initialize i18n
  if (typeof initI18n === 'function') initI18n();

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
        refreshDashboardFull();
      });

      unsubscribeFeeds = onFeedsChange(feeds => {
        allFeeds = feeds;
        refreshDashboardFull();
        renderAuditTrail();
        renderPortfolios();
      });
      
      refreshDashboardFull();
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
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(`screen-${screenId}`).classList.remove('hidden');
  window.scrollTo(0, 0);

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
// UI UPDATERS — BUG #3 FIX: Compute from cached data, ZERO Firestore queries
// ============================================================

const fmtMoney = (num) => '₹' + (num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function refreshDashboardFull() {
  updateDashboardFromCache();
  computeAnalytics();
  computeRiskAnalysis();
  computePortfolioAdvantages();
  if (typeof renderAllCharts === 'function') {
    renderAllCharts(allFeeds, allAccounts);
  }
}

// BUG #3 FIX: No more getDashboardStats() Firestore calls
function updateDashboardFromCache() {
  let totalNet = 0, sundayCount = 0, sundayTotal = 0, pendingSlips = 0;
  
  allFeeds.forEach(f => {
    totalNet += f.net_deposited || 0;
    if (f.is_sunday) {
      sundayCount++;
      sundayTotal += f.net_deposited || 0;
    }
    if (!f.passbook_verified) pendingSlips++;
  });

  const activeAccounts = allAccounts.filter(a => a.status === 'Active').length;

  document.getElementById('kpi-corpus').innerText = fmtMoney(totalNet);
  document.getElementById('kpi-sunday').innerText = fmtMoney(sundayTotal);
  document.getElementById('kpi-sunday-days').innerText = sundayCount;
  document.getElementById('kpi-audit').innerText = pendingSlips;
  document.getElementById('kpi-accounts').innerText = activeAccounts;
}

// ============================================================
// ANALYTICS (Computed from cached data)
// ============================================================

function computeAnalytics() {
  // Average Daily Collection
  const uniqueDays = new Set(allFeeds.map(f => f.feed_date).filter(Boolean));
  const totalNet = allFeeds.reduce((s, f) => s + (f.net_deposited || 0), 0);
  const avgDaily = uniqueDays.size > 0 ? totalNet / uniqueDays.size : 0;
  document.getElementById('kpi-avg-daily').innerText = fmtMoney(avgDaily);

  // Best Performing Account
  const accBal = {};
  allFeeds.forEach(f => {
    accBal[f.account_number] = (accBal[f.account_number] || 0) + (f.net_deposited || 0);
  });
  let bestAcc = '—';
  let bestBal = 0;
  Object.entries(accBal).forEach(([id, bal]) => {
    if (bal > bestBal) {
      bestBal = bal;
      const acc = allAccounts.find(a => a.id === id);
      bestAcc = acc ? acc.bank_name : id;
    }
  });
  document.getElementById('kpi-best-account').innerText = bestAcc;

  // Consistency Score (% of weekdays in last 30 days with at least 1 collection)
  const today = new Date();
  let weekdays = 0;
  let activeDays = 0;
  const feedDates = new Set(allFeeds.map(f => f.feed_date));
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) { // Mon-Fri
      weekdays++;
      const dateStr = d.toISOString().slice(0, 10);
      if (feedDates.has(dateStr)) activeDays++;
    }
  }
  const consistency = weekdays > 0 ? Math.round((activeDays / weekdays) * 100) : 0;
  document.getElementById('kpi-consistency').innerText = consistency + '%';

  // Days since last collection
  if (allFeeds.length > 0) {
    const sortedDates = allFeeds.map(f => f.feed_date).filter(Boolean).sort().reverse();
    if (sortedDates[0]) {
      const lastDate = new Date(sortedDates[0]);
      const diffMs = today - lastDate;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const el = document.getElementById('kpi-staleness');
      el.innerText = diffDays + ' days';
      el.style.color = diffDays > 7 ? 'var(--danger)' : diffDays > 3 ? 'var(--warning)' : 'var(--accent)';
    }
  }
}

// ============================================================
// RISK ANALYSIS
// ============================================================

function computeRiskAnalysis() {
  const container = document.getElementById('risk-analysis-body');
  if (!container) return;
  
  const today = new Date();
  const activeAccounts = allAccounts.filter(a => a.status === 'Active');
  
  if (activeAccounts.length === 0) {
    container.innerHTML = '<p class="text-dim text-sm">No active accounts to analyze.</p>';
    return;
  }

  const results = activeAccounts.map(acc => {
    const accFeeds = allFeeds.filter(f => f.account_number === acc.id);
    const sortedDates = accFeeds.map(f => f.feed_date).filter(Boolean).sort().reverse();
    const lastDate = sortedDates[0] ? new Date(sortedDates[0]) : null;
    const daysSinceLast = lastDate ? Math.floor((today - lastDate) / (1000*60*60*24)) : 999;
    
    // Consistency check (last 30 days)
    let expectedDays = 0;
    let actualDays = 0;
    const feedDates = new Set(accFeeds.map(f => f.feed_date));
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (d.getDay() !== 0) { // Exclude Sundays
        expectedDays++;
        if (feedDates.has(d.toISOString().slice(0, 10))) actualDays++;
      }
    }
    const hitRate = expectedDays > 0 ? actualDays / expectedDays : 0;

    let level, color, icon, reason;
    if (daysSinceLast >= 30) {
      level = t('risk.high'); color = 'var(--danger)'; icon = '🔴'; reason = t('risk.noCollection');
    } else if (hitRate < 0.5) {
      level = t('risk.medium'); color = 'var(--warning)'; icon = '🟡'; reason = t('risk.inconsistent');
    } else {
      level = t('risk.low'); color = 'var(--accent)'; icon = '🟢'; reason = t('risk.regular');
    }

    return { bank: acc.bank_name, id: acc.id, level, color, icon, reason, daysSinceLast };
  });

  // Sort: high risk first
  results.sort((a, b) => {
    const order = { '🔴': 0, '🟡': 1, '🟢': 2 };
    return (order[a.icon] || 2) - (order[b.icon] || 2);
  });

  container.innerHTML = results.map(r => `
    <div class="risk-row">
      <span class="risk-icon">${r.icon}</span>
      <div class="risk-info">
        <strong>${r.bank}</strong>
        <span class="text-xs text-dim">${r.reason}</span>
      </div>
      <span class="badge" style="background:${r.color}20; color:${r.color}; border:1px solid ${r.color}40;">${r.level}</span>
    </div>
  `).join('');
}

// ============================================================
// PORTFOLIO ADVANTAGES
// ============================================================

function computePortfolioAdvantages() {
  const container = document.getElementById('portfolio-advantages-body');
  if (!container) return;
  
  const totalNet = allFeeds.reduce((s, f) => s + (f.net_deposited || 0), 0);
  const activeAccounts = allAccounts.filter(a => a.status === 'Active');
  const uniqueBanks = new Set(activeAccounts.map(a => a.bank_name));
  
  // Monthly growth (this month vs last month)
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = lastMonthDate.toISOString().slice(0, 7);
  
  let thisMonthTotal = 0, lastMonthTotal = 0;
  allFeeds.forEach(f => {
    if (!f.feed_date) return;
    const m = f.feed_date.substring(0, 7);
    if (m === thisMonth) thisMonthTotal += f.net_deposited || 0;
    if (m === lastMonth) lastMonthTotal += f.net_deposited || 0;
  });
  
  const growthPct = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : '—';
  
  // Emergency coverage (assuming ₹15,000/month expenses)
  const monthlyExpense = 15000;
  const emergencyMonths = monthlyExpense > 0 ? (totalNet / monthlyExpense).toFixed(1) : '0';

  const insights = [
    {
      icon: '🛡️',
      label: t('portfolio.emergency'),
      value: `${emergencyMonths} months`,
      desc: `₹${monthlyExpense.toLocaleString('en-IN')}/mo assumed`,
      color: parseFloat(emergencyMonths) >= 3 ? 'var(--accent)' : 'var(--danger)'
    },
    {
      icon: '🏦',
      label: t('portfolio.diversification'),
      value: `${uniqueBanks.size} banks`,
      desc: `${activeAccounts.length} active accounts`,
      color: uniqueBanks.size >= 2 ? 'var(--accent)' : 'var(--warning)'
    },
    {
      icon: '📈',
      label: t('portfolio.growth'),
      value: growthPct === '—' ? '—' : (growthPct >= 0 ? '+' + growthPct + '%' : growthPct + '%'),
      desc: `vs last month`,
      color: growthPct === '—' ? 'var(--text-dim)' : (parseFloat(growthPct) >= 0 ? 'var(--accent)' : 'var(--danger)')
    }
  ];

  container.innerHTML = `<div class="advantages-grid">${insights.map(i => `
    <div class="advantage-item">
      <span class="advantage-icon">${i.icon}</span>
      <div>
        <div class="text-xs text-dim">${i.label}</div>
        <div class="fw-bold" style="color:${i.color}; font-size:1.1rem;">${i.value}</div>
        <div class="text-xs text-dim">${i.desc}</div>
      </div>
    </div>
  `).join('')}</div>`;
}

// ============================================================
// DROPDOWNS
// ============================================================

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
  
  const filterOptionsHTML = `<option value="" data-i18n="audit.allAccounts">${t('audit.allAccounts')}</option>` + 
    allAccounts.map(a => `<option value="${a.id}">${a.bank_name} (${a.id})</option>`).join('');
  auditFilter.innerHTML = filterOptionsHTML;
}

// ============================================================
// RENDERERS
// ============================================================

// BUG #3 FIX: renderPortfolios now computes from cached data
function renderPortfolios() {
  const tbody = document.querySelector('#table-portfolios tbody');
  
  if (allAccounts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-dim">No accounts found.</td></tr>`;
    return;
  }

  // Compute balances from cached allFeeds
  const feedsByAcc = {};
  allFeeds.forEach(f => {
    if (!feedsByAcc[f.account_number]) feedsByAcc[f.account_number] = { total: 0, unverified: 0 };
    feedsByAcc[f.account_number].total += f.net_deposited || 0;
    if (!f.passbook_verified) feedsByAcc[f.account_number].unverified++;
  });

  tbody.innerHTML = allAccounts.map(acc => {
    const feeds = feedsByAcc[acc.id] || { total: 0, unverified: 0 };
    const statusBadge = acc.status === 'Active' 
      ? `<span class="badge badge-status">${acc.status}</span>`
      : `<span class="badge badge-danger">${acc.status}</span>`;
      
    const slips = feeds.unverified > 0
      ? `<span class="badge badge-pending text-xs">${feeds.unverified} Pending</span>`
      : `<span class="badge badge-verified text-xs">Verified</span>`;
      
    return `
      <tr>
        <td><strong>${acc.bank_name}</strong><br><span class="text-xs text-dim">${acc.holder_name}</span></td>
        <td><code>${acc.id}</code></td>
        <td>${acc.agent_name}</td>
        <td class="text-accent fw-bold">${fmtMoney(feeds.total)}<br>${slips}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="btn-group" style="flex-wrap:nowrap;">
            <button class="btn btn-sm btn-ghost" onclick="openAccountDetails('${acc.id}')" title="View">👁️</button>
            <button class="btn btn-sm btn-ghost" onclick="openEditAccount('${acc.id}')" title="Edit">✏️</button>
            ${acc.status === 'Active' ? `<button class="btn btn-sm btn-warning" onclick="openCloseAccount('${acc.id}')" title="Close">${t('portfolios.action') || 'Close'}</button>` : ''}
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

  const getBank = accNum => {
    const acc = allAccounts.find(a => a.id === accNum);
    return acc ? acc.bank_name : accNum;
  };

  tbody.innerHTML = toRender.map(f => {
    const dayLabel = (f.day_of_week || '---').substring(0, 3);
    const status = f.passbook_verified
      ? `<span class="badge badge-verified">✅</span>`
      : `<span class="badge badge-pending">⚠️</span>`;
      
    const actionBtns = `
      <div class="btn-group" style="flex-wrap:nowrap;">
        ${!f.passbook_verified ? `<button class="btn btn-sm btn-warning" onclick="handleVerifyFeed('${f.id}')">Stamp</button>` : ''}
        <button class="btn btn-sm btn-ghost" onclick="openEditFeed('${f.id}')">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="confirmDeleteFeed('${f.id}')">🗑️</button>
      </div>`;

    return `
      <tr>
        <td>${f.feed_date}<br><span class="text-xs text-dim">${dayLabel}</span></td>
        <td>${getBank(f.account_number)}<br><code>${f.account_number}</code></td>
        <td class="fw-bold">${fmtMoney(f.net_deposited)}<br><span class="text-xs text-dim">${f.receipt_or_slip_no || ''}</span></td>
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
      btn.innerText = t('login.btn');
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
      document.getElementById('feed-date-input').value = new Date().toISOString().slice(0, 10);
      navigate('home');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = t('feed.save');
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

  // Edit Account
  document.getElementById('form-edit-account').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-acc-edit');
    btn.disabled = true;
    try {
      const id = document.getElementById('edit-acc-id').value;
      await updateAccount(id, {
        holder_name: document.getElementById('edit-acc-holder').value,
        bank_name: document.getElementById('edit-acc-bank').value,
        agent_name: document.getElementById('edit-acc-agent').value,
        agent_phone: document.getElementById('edit-acc-phone').value,
        frequency: document.getElementById('edit-acc-freq').value,
        daily_target_amount: document.getElementById('edit-acc-target').value
      });
      showToast('✅ Account details updated!', 'success');
      document.getElementById('modal-edit-account').classList.add('hidden');
      renderPortfolios();
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

function openEditAccount(id) {
  const acc = allAccounts.find(a => a.id === id);
  if (!acc) return;
  document.getElementById('edit-acc-id').value = acc.id;
  document.getElementById('edit-acc-holder').value = acc.holder_name;
  document.getElementById('edit-acc-bank').value = acc.bank_name;
  document.getElementById('edit-acc-agent').value = acc.agent_name;
  document.getElementById('edit-acc-phone').value = acc.agent_phone || '';
  document.getElementById('edit-acc-freq').value = acc.frequency || 'Daily';
  document.getElementById('edit-acc-target').value = acc.daily_target_amount || 100;
  document.getElementById('modal-edit-account').classList.remove('hidden');
}

function openCloseAccount(id) {
  document.getElementById('close-acc-id').value = id;
  document.getElementById('close-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('modal-close-account').classList.remove('hidden');
}

async function openAccountDetails(id) {
  const acc = allAccounts.find(a => a.id === id);
  if (!acc) return;
  
  currentDetailAccountId = id;
  const accFeeds = allFeeds.filter(f => f.account_number === id).sort((a,b) => new Date(b.feed_date) - new Date(a.feed_date));
  const bal = accFeeds.reduce((sum, f) => sum + (f.net_deposited || 0), 0);
  const unverifiedCount = accFeeds.filter(f => !f.passbook_verified).length;
  
  document.getElementById('detail-bank-name').innerText = acc.bank_name;
  document.getElementById('detail-balance').innerText = fmtMoney(bal);
  
  const verifyAllBtn = document.getElementById('btn-verify-all-account');
  if (verifyAllBtn) {
    verifyAllBtn.style.display = unverifiedCount > 0 ? 'inline-flex' : 'none';
    verifyAllBtn.innerText = `✅ Stamp All (${unverifiedCount})`;
  }

  const statusEl = document.getElementById('detail-status');
  statusEl.innerText = acc.status;
  statusEl.style.color = acc.status === 'Matured' ? 'var(--warning)' : 'var(--accent)';
  
  document.getElementById('detail-acc-no').innerText = acc.id;
  document.getElementById('detail-holder').innerText = acc.holder_name;
  document.getElementById('detail-agent').innerText = `${acc.agent_name} (${acc.agent_phone || 'N/A'})`;
  document.getElementById('detail-freq').innerText = acc.frequency;
  document.getElementById('detail-opened').innerText = acc.opening_date;
  
  const tbody = document.querySelector('#table-detail-timeline tbody');
  tbody.innerHTML = accFeeds.map(f => `
    <tr>
      <td>${f.feed_date}</td>
      <td class="fw-bold">${fmtMoney(f.net_deposited)}</td>
      <td class="text-xs text-dim">${f.receipt_or_slip_no || ''}<br>${f.notes || ''}</td>
    </tr>
  `).join('');
  
  navigate('account-details');
}

async function handleVerifyAllForCurrentAccount() {
  if (!currentDetailAccountId) return;
  try {
    const stampedCount = await verifyAllAccountFeeds(currentDetailAccountId);
    showToast(`✅ Successfully stamped ${stampedCount} entries in passbook!`, 'success');
    openAccountDetails(currentDetailAccountId);
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
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
