(function() {
  let settings = {};
  
  // Add this new listener
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      for (let [key, { newValue }] of Object.entries(changes)) {
        settings[key] = newValue;
      }
    }
  });

  chrome.storage.sync.get(null, (data) => {
    settings = data;
    init();
  });

  function init() {
    const defaultDisabled = {
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

    Object.keys(defaultDisabled).forEach(key => {
      if (!(key in settings)) settings[key] = defaultDisabled[key];
    });

    // 禁用双击功能
    if (settings.disableDoubleClick) {
      // 更全面的双击禁用
      document.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }, true);
      
      // 禁用双击触摸事件（移动端）
      document.addEventListener('touchend', (e) => {
        if (e.detail === 2) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }, true);
      
      // 新增：自定义双击检测和拦截（针对可能不使用 dblclick 的实现）
      function addDoubleClickInterceptor(element) {
        let lastClickTime = 0;
        element.addEventListener('click', (e) => {
          const now = Date.now();
          if (now - lastClickTime < 300) { // 300ms 内双击
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
          lastClickTime = now;
        }, true);

        // 额外拦截 mousedown 以防自定义实现
        let lastMouseDownTime = 0;
        element.addEventListener('mousedown', (e) => {
          const now = Date.now();
          if (now - lastMouseDownTime < 300) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
          lastMouseDownTime = now;
        }, true);

        // 拦截 mouseup 事件
        let lastMouseUpTime = 0;
        element.addEventListener('mouseup', (e) => {
          const now = Date.now();
          if (now - lastMouseUpTime < 300) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
          lastMouseUpTime = now;
        }, true);
      }

      // 扩展选择器以包含更多可能的双击目标元素
      const doubleClickSelectors = [
        'video', 
        '.video-player', 
        '.xg-video', 
        '[data-e2e="video-player"]',
        '.video-container',
        '.player-container',
        '.douyin-video',
        '[class*="video"]',
        '[class*="player"]',
        '[class*="douyin"]',
        '.feed-item',
        '.video-feed-item',
        '.aweme-item'
      ];

      // 为现有元素添加拦截器
      const videoElements = document.querySelectorAll(doubleClickSelectors.join(', '));
      videoElements.forEach(addDoubleClickInterceptor);

      // 更新 MutationObserver 以添加新拦截器
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const videos = node.querySelectorAll ? node.querySelectorAll(doubleClickSelectors.join(', ')) : [];
              videos.forEach(addDoubleClickInterceptor);
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // 新增：定期检查新添加的元素（以防 MutationObserver 遗漏）
      setInterval(() => {
        const allElements = document.querySelectorAll(doubleClickSelectors.join(', '));
        allElements.forEach(element => {
          if (!element.hasAttribute('data-double-click-intercepted')) {
            element.setAttribute('data-double-click-intercepted', 'true');
            addDoubleClickInterceptor(element);
          }
        });
      }, 2000); // 每2秒检查一次
    }

    // 禁用双击空格
    if (settings.disableDoubleSpace) {
      let lastSpaceTime = 0;
      document.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
          const now = Date.now();
          if (now - lastSpaceTime < 300) { // 300ms内的双击空格
            e.preventDefault();
            e.stopPropagation();
          }
          lastSpaceTime = now;
        }
      }, true);
    }

    document.addEventListener('keydown', (e) => {
      const key = e.key.toUpperCase();
      const shift = e.shiftKey;
      const ctrl = e.ctrlKey;
      const alt = e.altKey;
      const meta = e.metaKey;
      const activeElem = document.activeElement;

      // 更新焦点检测：支持 contenteditable div 和 Draft.js 类
      const isCommentInput = activeElem && (
        activeElem.hasAttribute('contenteditable') ||  // 通用可编辑元素
        activeElem.tagName === 'TEXTAREA' || 
        activeElem.tagName === 'INPUT' ||
        activeElem.classList.contains('public-DraftEditor-content') ||  // Draft.js 特定类
        activeElem.closest('.comment-input-inner-container')  // 祖先容器
      );

      if (isCommentInput) return;  // 如果在评论框，不拦截

      // 不拦截浏览器默认快捷键
      if (ctrl || alt || meta) return;  // Ctrl/Alt/Meta 组合键不拦截
      
      // 不拦截功能键（F1-F12）
      if (key.startsWith('F') && key.length > 1 && key.length <= 3) return;
      
      // 不拦截其他浏览器快捷键
      if (e.key === 'F5' || e.key === 'F12' || e.key === 'F11' || e.key === 'F10') return;

      // 默认禁用的快捷键
      if (settings.like_Z && key === 'Z' && !shift) return prevent(e);
      if (settings.comment_X && key === 'X' && !shift) return prevent(e);
      if (settings.danmuToggle_B && key === 'B' && !shift) return prevent(e);
      if (settings.favorite_C && key === 'C' && !shift) return prevent(e);
      if (settings.share_V && key === 'V' && !shift) return prevent(e);
      if (settings.clearScreen_J && key === 'J' && !shift) return prevent(e);
      if (settings.autoPlay_K && key === 'K' && !shift) return prevent(e);
      if (settings.videoInfo_I && key === 'I' && !shift) return prevent(e);
      if (settings.recommend_P && key === 'P' && !shift) return prevent(e);
      if (settings.authorPage_F && key === 'F' && !shift) return prevent(e);
      if (settings.follow_G && key === 'G' && !shift) return prevent(e);
      if (settings.fullscreen_Y && key === 'Y' && !shift) return prevent(e);
      if (settings.fullscreen_H && key === 'H' && !shift) return prevent(e);
      if (settings.watchLater_L && key === 'L' && !shift) return prevent(e);
      if (settings.volume_ShiftPlusMinus && shift && (key === '+' || key === '-')) return prevent(e);
      if (settings.shortcutList_Question && key === '?' && !shift) return prevent(e);
      if (settings.closeShortcutList_ESC && e.key === 'Escape') return prevent(e);
      if (settings.relatedRecommend_N && key === 'N' && !shift) return prevent(e);
      if (settings.listenDouyin_T && key === 'T' && !shift) return prevent(e);
      if (settings.douyinSearch_ShiftF && key === 'F' && shift) return prevent(e);
      if (settings.closePage_ShiftQ && key === 'Q' && shift) return prevent(e);

      // 默认启用的快捷键（根据设置决定是否禁用）
      if (settings.pageUpDown_Arrows && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) return prevent(e);
      if (settings.fastForwardRewind_Arrows && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return prevent(e);
      if (settings.pause_Space && e.key === ' ') return prevent(e);
      if (settings.notInterested_R && key === 'R' && !shift) return prevent(e);
    }, true);
  }

  function prevent(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  }
})();