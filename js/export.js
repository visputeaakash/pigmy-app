/* ========================================
   PIGMY PWA — Export Module
   CSV & Markdown generation (client-side)
   ======================================== */

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function exportCSV() {
  const { feeds } = await getAllDataForExport();

  if (!feeds.length) {
    showToast('No data to export', 'error');
    return;
  }

  const headers = [
    'Date', 'Day', 'Bank', 'Account', 'Agent',
    'Deposit', 'Deduction', 'Net', 'Receipt',
    'Passbook_Verified', 'Notes'
  ];

  const rows = feeds.map(f => [
    f.feed_date,
    f.day_of_week,
    f.bank_name,
    f.account_number,
    f.agent_name,
    f.deposit_amount,
    f.expense_or_deduction,
    f.net_deposited,
    f.receipt_or_slip_no,
    f.passbook_verified ? 1 : 0,
    f.notes
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => {
      const str = String(cell ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(','))
    .join('\n');

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  downloadFile(csvContent, `pigmy_data_${dateStr}.csv`, 'text/csv');
  showToast('✅ CSV downloaded!', 'success');
}

async function exportMarkdown() {
  const { accounts, feeds } = await getAllDataForExport();

  if (!feeds.length && !accounts.length) {
    showToast('No data to export', 'error');
    return;
  }

  // Compute stats
  let totalGross = 0, totalNet = 0;
  const accBalances = {};

  feeds.forEach(f => {
    totalGross += f.deposit_amount || 0;
    totalNet += f.net_deposited || 0;

    if (!accBalances[f.account_number]) {
      accBalances[f.account_number] = { balance: 0, pending: 0 };
    }
    accBalances[f.account_number].balance += f.net_deposited || 0;
    if (!f.passbook_verified) accBalances[f.account_number].pending++;
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const md = [
    '# 🏦 Pigmy & Emergency Fund Strategic Dossier',
    `**Date:** ${dateStr}\n`,
    `- **Total Liquid Corpus:** ₹${totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    `- **Total Gross Handed:** ₹${totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`,
    '## 🏛️ Account Balances & Audit Status',
    '| Bank | Account | Agent | Balance | Passbook Pending |',
    '| :--- | :--- | :--- | :--- | :--- |'
  ];

  accounts.forEach(a => {
    const bal = accBalances[a.id] || { balance: 0, pending: 0 };
    md.push(`| ${a.bank_name} | \`${a.id}\` | ${a.agent_name} | ₹${bal.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} | ${bal.pending} unprinted |`);
  });

  md.push('\n```text\nSystem Prompt: Formulate optimal sweep-in liquidity allocations based on this emergency fund data.\n```');

  const fileDate = now.toISOString().slice(0, 10).replace(/-/g, '');
  downloadFile(md.join('\n'), `pigmy_strategy_${fileDate}.md`, 'text/markdown');
  showToast('✅ AI Dossier downloaded!', 'success');
}
