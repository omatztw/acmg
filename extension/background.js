// バックグラウンドスクリプト
// MoneyForwardのページが読み込まれたときにコンテンツスクリプトを実行するための処理

// 拡張機能がインストールされたときの初期化処理
chrome.runtime.onInstalled.addListener(() => {
  console.log('MoneyForward 経費計算拡張機能がインストールされました');
  
  // 初期設定をストレージに保存
  chrome.storage.sync.get([
    'partnerAccount',
    'expenceList',
    'expenceSubList',
    'rate',
    'partnerName'
  ], function(result) {
    // 既存の設定がなければ初期値を設定
    const updates = {};
    
    if (!result.partnerAccount) {
      updates.partnerAccount = [];
    }
    
    if (!result.expenceList) {
      updates.expenceList = [];
    }
    
    if (!result.expenceSubList) {
      updates.expenceSubList = [];
    }
    
    if (result.rate === undefined) {
      updates.rate = 0.5;
    }
    
    if (!result.partnerName) {
      updates.partnerName = 'パートナー';
    }
    
    // 初期値が設定されていれば保存
    if (Object.keys(updates).length > 0) {
      chrome.storage.sync.set(updates);
    }
  });
});

// タブが更新されたときの処理
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // MoneyForwardの家計簿ページが読み込まれたときにコンテンツスクリプトにメッセージを送信
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('moneyforward.com/cf')) {
    chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' });
  }
});

// ブラウザアクションがクリックされたときの処理
chrome.action.onClicked.addListener((tab) => {
  // MoneyForwardのページでなければ、MoneyForwardのページを開く
  if (!tab.url || !tab.url.includes('moneyforward.com/cf')) {
    chrome.tabs.create({ url: 'https://moneyforward.com/cf' });
  }
});