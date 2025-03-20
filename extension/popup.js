document.addEventListener('DOMContentLoaded', function() {
  // タブ切り替え機能
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      
      // タブのアクティブ状態を切り替え
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // タブコンテンツの表示を切り替え
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}-tab`) {
          content.classList.add('active');
        }
      });
    });
  });

  // 設定の読み込み
  loadSettings();
  
  // 結果の更新
  updateResults();
  
  // 設定保存ボタンのイベントリスナー
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // データ更新ボタンのイベントリスナー
  document.getElementById('refresh-button').addEventListener('click', refreshData);
  
  // 項目追加ボタンのイベントリスナー
  document.getElementById('add-expense-category').addEventListener('click', () => {
    addItem('expense-category-input', 'expense-categories', 'expenceList');
  });
  
  document.getElementById('add-expense-subcategory').addEventListener('click', () => {
    addItem('expense-subcategory-input', 'expense-subcategories', 'expenceSubList');
  });
  
  document.getElementById('add-partner-account').addEventListener('click', () => {
    addItem('partner-account-input', 'partner-accounts', 'partnerAccount');
  });
});

// 設定を読み込む
function loadSettings() {
  chrome.storage.sync.get([
    'partnerAccount',
    'expenceList',
    'expenceSubList',
    'rate',
    'partnerName'
  ], function(result) {
    // レート設定
    const rateInput = document.getElementById('rate-input');
    rateInput.value = result.rate !== undefined ? result.rate : 0.5;
    
    // パートナー名設定
    const partnerNameInput = document.getElementById('partner-name-input');
    partnerNameInput.value = result.partnerName || 'パートナー';
    
    // パートナー名をラベルに反映
    updatePartnerLabels(result.partnerName || 'パートナー');
    
    // 経費大項目
    const expenseCategories = result.expenceList || [];
    renderTags('expense-categories', expenseCategories, 'expenceList');
    
    // 経費中項目
    const expenseSubcategories = result.expenceSubList || [];
    renderTags('expense-subcategories', expenseSubcategories, 'expenceSubList');
    
    // パートナー金融機関
    const partnerAccounts = result.partnerAccount || [];
    renderTags('partner-accounts', partnerAccounts, 'partnerAccount');
  });
}

// 設定を保存する
function saveSettings() {
  const rate = parseFloat(document.getElementById('rate-input').value);
  const partnerName = document.getElementById('partner-name-input').value;
  
  chrome.storage.sync.set({
    rate: rate,
    partnerName: partnerName
  }, function() {
    // パートナー名をラベルに反映
    updatePartnerLabels(partnerName);
    
    // ステータスメッセージを表示
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = '設定を保存しました';
    statusMessage.className = 'status-message success';
    
    // 3秒後にメッセージを元に戻す
    setTimeout(() => {
      statusMessage.textContent = 'MoneyForwardの家計簿ページを開くと自動的に計算されます';
      statusMessage.className = 'status-message info';
    }, 3000);
  });
}

// パートナー名をラベルに反映
function updatePartnerLabels(partnerName) {
  document.getElementById('partner-payment-label').textContent = `${partnerName}支払い:`;
  document.getElementById('partner-paid-label').textContent = `${partnerName}持ち出し:`;
  document.getElementById('partner-shortage-label').textContent = `${partnerName}不足:`;
}

// タグを描画
function renderTags(containerId, items, storageKey) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  items.forEach((item, index) => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = item;
    
    const removeButton = document.createElement('span');
    removeButton.className = 'tag-remove';
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => {
      removeItem(storageKey, index);
    });
    
    tag.appendChild(removeButton);
    container.appendChild(tag);
  });
}

// 項目を追加
function addItem(inputId, containerId, storageKey) {
  const input = document.getElementById(inputId);
  const value = input.value.trim();
  
  if (!value) return;
  
  chrome.storage.sync.get([storageKey], function(result) {
    const items = result[storageKey] || [];
    
    // 重複チェック
    if (items.includes(value)) {
      const statusMessage = document.getElementById('status-message');
      statusMessage.textContent = '既に登録されている項目です';
      statusMessage.className = 'status-message error';
      
      setTimeout(() => {
        statusMessage.textContent = 'MoneyForwardの家計簿ページを開くと自動的に計算されます';
        statusMessage.className = 'status-message info';
      }, 3000);
      
      return;
    }
    
    items.push(value);
    
    const updateData = {};
    updateData[storageKey] = items;
    
    chrome.storage.sync.set(updateData, function() {
      input.value = '';
      renderTags(containerId, items, storageKey);
    });
  });
}

// 項目を削除
function removeItem(storageKey, index) {
  chrome.storage.sync.get([storageKey], function(result) {
    const items = result[storageKey] || [];
    
    if (index >= 0 && index < items.length) {
      items.splice(index, 1);
      
      const updateData = {};
      updateData[storageKey] = items;
      
      chrome.storage.sync.set(updateData, function() {
        const containerId = {
          'expenceList': 'expense-categories',
          'expenceSubList': 'expense-subcategories',
          'partnerAccount': 'partner-accounts'
        }[storageKey];
        
        renderTags(containerId, items, storageKey);
      });
    }
  });
}

// 結果を更新
function updateResults() {
  // アクティブなタブのコンテンツスクリプトと通信
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('moneyforward.com/cf')) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getResults'}, function(response) {
        if (response && response.results) {
          displayResults(response.results);
          
          const statusMessage = document.getElementById('status-message');
          statusMessage.textContent = '計算結果を更新しました';
          statusMessage.className = 'status-message success';
          
          setTimeout(() => {
            statusMessage.textContent = 'MoneyForwardの家計簿ページを開くと自動的に計算されます';
            statusMessage.className = 'status-message info';
          }, 3000);
        } else {
          const statusMessage = document.getElementById('status-message');
          statusMessage.textContent = 'MoneyForwardの家計簿ページでデータを取得できませんでした';
          statusMessage.className = 'status-message error';
        }
      });
    } else {
      const statusMessage = document.getElementById('status-message');
      statusMessage.textContent = 'MoneyForwardの家計簿ページを開いてください';
      statusMessage.className = 'status-message error';
    }
  });
}

// 結果を表示
function displayResults(results) {
  document.getElementById('total-expense').textContent = `${results.sum.toLocaleString()} 円`;
  document.getElementById('partner-payment').textContent = `${results.need.toLocaleString()} 円`;
  document.getElementById('partner-paid').textContent = `${results.partner.toLocaleString()} 円`;
  document.getElementById('partner-shortage').textContent = `${results.lack.toLocaleString()} 円`;
}

// データを更新
function refreshData() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('moneyforward.com/cf')) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'refreshData'}, function(response) {
        if (response && response.success) {
          updateResults();
        } else {
          const statusMessage = document.getElementById('status-message');
          statusMessage.textContent = 'データの更新に失敗しました';
          statusMessage.className = 'status-message error';
        }
      });
    } else {
      const statusMessage = document.getElementById('status-message');
      statusMessage.textContent = 'MoneyForwardの家計簿ページを開いてください';
      statusMessage.className = 'status-message error';
    }
  });
}