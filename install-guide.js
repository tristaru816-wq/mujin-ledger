/* Install helper. Apple requires a manual Safari Share -> Add to Home Screen action. */
(() => {
  'use strict';
  const ua = navigator.userAgent || '';
  const isApple = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const onMobile = isApple || isAndroid;
  const installed = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const seenKey = 'mujin-install-instructions-shown-v1';
  let deferredInstall = null;
  let modal = null;
  const icon = './icons/icon-192.png';
  const markSeen = () => { try { localStorage.setItem(seenKey, '1'); } catch (_) {} };
  const wasSeen = () => { try { return localStorage.getItem(seenKey) === '1'; } catch (_) { return false; } };

  const stepsApple = [
    '在 Safari 點擊工具列的「分享」圖示（方框向上箭頭）；若只看到「•••」，請先點「•••」再選「分享」。',
    '向下滑動分享選單，選擇「加入主畫面」。',
    '名稱設為「暮金記帳」，最後點右上角「加入」。'
  ];
  const stepsAndroid = [
    '使用 Android 的 Chrome 開啟這個網站。',
    '點 Chrome 右上角「⋮」選單，選擇「安裝應用程式」或「加到主畫面」。',
    '依照系統提示確認，之後從手機桌面開啟。'
  ];
  const stepsFallback = ['使用 Safari 或 Chrome 開啟記帳網站。', '打開瀏覽器選單，選擇加到主畫面或安裝應用程式。'];

  function dismiss(){
    if (!modal) return;
    modal.remove(); modal = null;
    document.body.style.removeProperty('overflow');
    markSeen();
  }
  function makeStep(text,i){
    const row = document.createElement('div'); row.className = 'pwa-guide-step';
    const n = document.createElement('strong'); n.textContent=String(i+1);
    const t = document.createElement('span');t.textContent=text;
    row.append(n,t); return row;
  }
  async function offerNativeInstall(){
    if (!deferredInstall) return;
    const prompt = deferredInstall; deferredInstall = null;
    dismiss();
    try { await prompt.prompt(); await prompt.userChoice; } catch (_) {}
  }
  function openGuide(){
    if (installed() || modal) return;
    markSeen();
    modal=document.createElement('div'); modal.className='pwa-guide-overlay'; modal.id='pwaGuideOverlay';
    modal.innerHTML = `<section class="pwa-guide" role="dialog" aria-modal="true" aria-labelledby="pwaGuideTitle"><div class="pwa-guide-header"><img class="pwa-guide-icon" src="${icon}" alt="暮金記帳圖示"><div><div class="pwa-guide-eyebrow">MUJIN · LEDGER</div><h2 id="pwaGuideTitle">將暮金記帳<br>加入手機主畫面</h2></div><button class="pwa-guide-close" type="button" aria-label="關閉安裝說明" id="pwaGuideClose">×</button></div><p>下次直接點桌面圖示，就能開啟記帳。既有 Firebase 帳號與雲端紀錄不會因安裝而刪除。</p><div class="pwa-guide-steps" id="pwaGuideSteps"></div><p class="pwa-guide-note" id="pwaGuideNote"></p><div class="pwa-guide-actions"><button type="button" class="pwa-guide-secondary" id="pwaGuideLater">稍後再說</button><button type="button" class="pwa-guide-primary" id="pwaGuideAction">了解，開始記帳</button></div></section>`;
    const container=modal.querySelector('#pwaGuideSteps');
    const steps=isApple?stepsApple:isAndroid?stepsAndroid:stepsFallback;
    steps.forEach((s,i)=>container.append(makeStep(s,i)));
    modal.querySelector('#pwaGuideNote').textContent=isApple?'iPhone 無法由網站直接打開「加入主畫面」選單，需在 Safari 手動完成。從 Telegram／LINE 開啟時，請先改用 Safari。':isAndroid?'部分 Android 瀏覽器會提供「安裝」按鈕；若沒有，請改用 Chrome 的選單。':'不同瀏覽器的安裝位置可能略有差異。';
    const primary=modal.querySelector('#pwaGuideAction');
    if (deferredInstall && !isApple) {primary.textContent='立即安裝';primary.addEventListener('click',offerNativeInstall);} else primary.addEventListener('click',dismiss);
    modal.querySelector('#pwaGuideClose').addEventListener('click',dismiss);
    modal.querySelector('#pwaGuideLater').addEventListener('click',dismiss);
    modal.addEventListener('click',ev=>{if(ev.target===modal)dismiss()});
    document.body.append(modal);document.body.style.overflow='hidden';
    primary.focus({preventScroll:true});
  }
  function init(){
    if (!onMobile || installed()) return;
    const actions=document.querySelector('.top-actions');
    if(actions && !document.getElementById('pwaInstallOpen')){
      const btn=document.createElement('button');btn.type='button';btn.id='pwaInstallOpen';btn.className='pwa-install-trigger';btn.title='加入手機主畫面';btn.setAttribute('aria-label','開啟加入主畫面的安裝說明');
      btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 17v3h14v-3"/></svg>';
      btn.style.display='flex';
      const settings=document.getElementById('settingsOpen');
      actions.insertBefore(btn,settings||null);
      btn.addEventListener('click',openGuide);
    }
    if (!wasSeen()) setTimeout(()=>{
      if (installed() || wasSeen() || modal) return;
      // Do not cover account-management dialogs during authentication.
      if (document.querySelector('#modalHost .overlay')) return;
      openGuide();
    },1150);
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;const action=modal?.querySelector('#pwaGuideAction');if(action&&!isApple){action.textContent='立即安裝';action.onclick=offerNativeInstall}});
  window.addEventListener('appinstalled',()=>{dismiss();document.getElementById('pwaInstallOpen')?.remove();deferredInstall=null;});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal)dismiss()});
  if ('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('./sw.js').catch(()=>{});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
