document.addEventListener('DOMContentLoaded', function() {
  // 默认设置 - 大部分禁用，只有少数几个启用
  const defaultSettings = {
    // 双击功能
    disableDoubleClick: true,
    disableDoubleSpace: true,
    
    // 默认禁用的快捷键
    like_Z: true,
    comment_X: true,
    danmuToggle_B: true,
    favorite_C: true,
    share_V: true,
    clearScreen_J: true,
    autoPlay_K: true,
    videoInfo_I: true,
    recommend_P: true,
    authorPage_F: true,
    follow_G: true,
    fullscreen_Y: true,
    fullscreen_H: true,
    watchLater_L: true,
    volume_ShiftPlusMinus: true,
    shortcutList_Question: true,
    closeShortcutList_ESC: true,
    relatedRecommend_N: true,
    listenDouyin_T: true,
    douyinSearch_ShiftF: true,
    closePage_ShiftQ: true,
    
    // 默认启用的快捷键（不禁用）
    pageUpDown_Arrows: false,
    fastForwardRewind_Arrows: false,
    pause_Space: false,
    notInterested_R: false
  };

  // 加载设置
  chrome.storage.sync.get(defaultSettings, function(items) {
    Object.keys(items).forEach(function(key) {
      const element = document.getElementById(key);
      if (element) {
        element.checked = items[key];
      }
    });
  });

  // 保存设置
  document.getElementById('save').addEventListener('click', function() {
    const settings = {};
    Object.keys(defaultSettings).forEach(function(key) {
      const element = document.getElementById(key);
      if (element) {
        settings[key] = element.checked;
      }
    });

    chrome.storage.sync.set(settings, function() {
      // 显示保存成功消息
      const button = document.getElementById('save');
      const originalText = button.textContent;
      button.textContent = '已保存！';
      button.style.backgroundColor = '#4CAF50';
      
      setTimeout(function() {
        button.textContent = originalText;
        button.style.backgroundColor = '#007AFF';
      }, 1000);
    });
  });
});