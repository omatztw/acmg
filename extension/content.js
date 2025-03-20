// MoneyForwardのページからデータを抽出して計算するコンテンツスクリプト

// 設定を保存するための変数
let settings = {
  partnerAccount: [],
  expenceList: [],
  expenceSubList: [],
  rate: 0.5,
  partnerName: 'パートナー'
};

// 抽出したデータを保存するための変数
let csvData = [];

// 初期化処理
function initialize() {
  // 設定を読み込む
  loadSettings().then(() => {
    // ページが完全に読み込まれたらデータを抽出
    if (document.readyState === 'complete') {
      extractData();
    } else {
      window.addEventListener('load', extractData);
    }
  });
}

// 設定を読み込む
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([
      'partnerAccount',
      'expenceList',
      'expenceSubList',
      'rate',
      'partnerName'
    ], function(result) {
      settings.partnerAccount = result.partnerAccount || [];
      settings.expenceList = result.expenceList || [];
      settings.expenceSubList = result.expenceSubList || [];
      settings.rate = result.rate !== undefined ? result.rate : 0.5;
      settings.partnerName = result.partnerName || 'パートナー';
      resolve();
    });
  });
}

// MoneyForwardのページからデータを抽出
function extractData() {
  // テーブルからデータを抽出
  const table = document.getElementById('cf-detail-table');
  if (!table) {
    console.log('MoneyForward: テーブルが見つかりません');
    return;
  }

  const rows = table.querySelectorAll('tbody tr.transaction_list');
  csvData = [];

  rows.forEach(row => {
    // 各列のデータを取得
    const columns = row.querySelectorAll('td');
    if (columns.length < 10) return;

    // 計算対象かどうかを確認
    const isTargetElement = columns[0].querySelector('.icon-check, .icon-ban-circle');
    const isTarget = isTargetElement && isTargetElement.classList.contains('icon-check');
    
    // 日付を取得
    const dateElement = columns[1].querySelector('span');
    const date = dateElement ? dateElement.textContent.trim() : '';
    
    // 内容を取得
    const contentElement = columns[2].querySelector('span');
    const content = contentElement ? contentElement.textContent.trim() : '';
    
    // 金額を取得
    const amountElement = columns[3].querySelector('span.offset');
    let amount = amountElement ? amountElement.textContent.trim().replace(/[^0-9-]/g, '') : '0';
    
    // 振替かどうかを確認
    const transferElement = columns[3].querySelector('div.offset');
    const isTransfer = transferElement && transferElement.textContent.includes('振替');
    
    // 保有金融機関を取得
    const accountElement = columns[4];
    const account = accountElement ? accountElement.textContent.trim() : '';
    
    // 大項目を取得
    const categoryElement = columns[5].querySelector('a');
    const category = categoryElement ? categoryElement.textContent.trim() : '';
    
    // 中項目を取得
    const subcategoryElement = columns[6].querySelector('a');
    const subcategory = subcategoryElement ? subcategoryElement.textContent.trim() : '';
    
    // メモを取得
    const memoElement = columns[7].querySelector('span');
    const memo = memoElement ? memoElement.textContent.trim() : '';
    
    // 振替情報を取得
    const transferIconElement = columns[8].querySelector('.icon-exchange');
    const transfer = transferIconElement ? '1' : '0';

    // CSVデータと同じ構造のオブジェクトを作成
    csvData.push({
      ID: `${Date.now()}-${csvData.length}`, // 一意のIDを生成
      計算対象: isTarget ? '1' : '0',
      日付: date,
      内容: content,
      '金額（円）': amount,
      保有金融機関: account,
      大項目: category,
      中項目: subcategory,
      メモ: memo,
      振替: transfer
    });
  });

  // データが取得できたら計算を実行
  if (csvData.length > 0) {
    calculateExpenses();
    injectResultPanel();
  }
}

// 経費を計算
function calculateExpenses() {
  const { expenceList, expenceSubList, partnerAccount, rate } = settings;
  
  const expenceSet = new Set(expenceList);
  const expenceSubSet = new Set(expenceSubList);
  const partnerAccountSet = new Set(partnerAccount);
  
  // 計算対象のデータをフィルタリング
  const filtered = csvData
    .filter(d => d.計算対象 === '1')
    .filter(d => !expenceSet.has(d.大項目))
    .filter(d => !expenceSubSet.has(d.中項目))
    .filter(d => !!parseInt(d['金額（円）']));
  
  // 特別な処理が必要なデータ（メモに割合が記載されているもの）
  const special = filtered.filter(d => !Number.isNaN(parseInt(d.メモ)));
  
  // 特別な処理が必要なデータの合計金額
  const specialTotal = special.reduce(
    (p, c) => p + parseInt(c['金額（円）']),
    0
  );
  
  // 特別な処理が必要なデータの割引額
  const specialOffer = special.reduce(
    (p, c) => p + (parseInt(c['金額（円）']) * parseInt(c.メモ)) / 100,
    0
  );
  
  // パートナーの支払い額
  const partner = filtered
    .filter(d => partnerAccountSet.has(d.保有金融機関))
    .reduce((p, c) => p + parseInt(c['金額（円）']), 0);
  
  // 全体の支出額
  const expenceAll = filtered.reduce(
    (p, c) => p + parseInt(c['金額（円）']),
    0
  );
  
  // パートナーが支払うべき金額
  const need = Math.floor((expenceAll - specialTotal) * rate + specialOffer);
  
  // パートナーの不足額
  const lack = need - partner;
  
  // 結果を返す
  return {
    sum: expenceAll,
    partner: partner,
    need: need,
    lack: lack,
    specialTotal: specialTotal,
    specialOffer: specialOffer
  };
}

// 結果パネルをページに挿入
function injectResultPanel() {
  // 既存のパネルがあれば削除
  const existingPanel = document.getElementById('mf-expense-result-panel');
  if (existingPanel) {
    existingPanel.remove();
  }
  
  // 計算結果を取得
  const results = calculateExpenses();
  
  // パネルを作成
  const panel = document.createElement('div');
  panel.id = 'mf-expense-result-panel';
  panel.style.position = 'fixed';
  panel.style.top = '70px';
  panel.style.right = '20px';
  panel.style.width = '300px';
  panel.style.backgroundColor = 'white';
  panel.style.border = '1px solid #ddd';
  panel.style.borderRadius = '4px';
  panel.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  panel.style.zIndex = '9999';
  panel.style.padding = '16px';
  
  // パネルのヘッダー
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '16px';
  
  const title = document.createElement('h3');
  title.textContent = '経費計算結果';
  title.style.margin = '0';
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '20px';
  closeButton.addEventListener('click', () => {
    panel.remove();
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  panel.appendChild(header);
  
  // 結果の表示
  const resultContainer = document.createElement('div');
  
  const createRow = (label, value) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.marginBottom = '8px';
    
    const labelElement = document.createElement('div');
    labelElement.textContent = label;
    
    const valueElement = document.createElement('div');
    valueElement.textContent = value;
    valueElement.style.fontWeight = 'bold';
    
    row.appendChild(labelElement);
    row.appendChild(valueElement);
    
    return row;
  };
  
  resultContainer.appendChild(createRow('経費合計:', `${results.sum.toLocaleString()} 円`));
  resultContainer.appendChild(createRow(`${settings.partnerName}支払い:`, `${results.need.toLocaleString()} 円`));
  resultContainer.appendChild(createRow(`${settings.partnerName}持ち出し:`, `${results.partner.toLocaleString()} 円`));
  resultContainer.appendChild(createRow(`${settings.partnerName}不足:`, `${results.lack.toLocaleString()} 円`));
  
  panel.appendChild(resultContainer);
  
  // ページに挿入
  document.body.appendChild(panel);
}

// メッセージリスナーを設定
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getResults') {
    // 計算結果を返す
    sendResponse({ results: calculateExpenses() });
  } else if (request.action === 'refreshData') {
    // データを再取得して計算
    extractData();
    sendResponse({ success: true });
  }
  return true; // 非同期レスポンスのために必要
});

// 初期化を実行
initialize();

// MutationObserverを使用してページの変更を監視
const observer = new MutationObserver((mutations) => {
  // テーブルの内容が変更された場合にデータを再取得
  for (const mutation of mutations) {
    if (mutation.type === 'childList' &&
        (mutation.target.id === 'cf-detail-table' ||
         mutation.target.closest('#cf-detail-table'))) {
      extractData();
      break;
    }
  }
});

// テーブルを監視
const tableContainer = document.getElementById('break_contents');
if (tableContainer) {
  observer.observe(tableContainer, { childList: true, subtree: true });
} else {
  // テーブルコンテナが見つからない場合は、bodyを監視して後でテーブルを見つける
  observer.observe(document.body, { childList: true, subtree: true });
  
  // 定期的にテーブルの存在をチェック
  const checkInterval = setInterval(() => {
    const container = document.getElementById('break_contents');
    if (container) {
      observer.disconnect();
      observer.observe(container, { childList: true, subtree: true });
      clearInterval(checkInterval);
      extractData(); // テーブルが見つかったらデータを抽出
    }
  }, 1000);
}