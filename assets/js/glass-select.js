/* ---------- GlassSelect ----------
   原生 <select> 的弹出层由系统绘制，CSS 无法改变其外观。
   这里保留原生 select 作为值与表单数据源，用可访问的自绘 listbox
   替换可见控件。交互语义参照 Open UI customizable select；
   自绘实现覆盖 Safari / Firefox（base-select 尚未全平台可用）。 */
(() => {
  'use strict';

  if (window.__glassSelectReady) return;
  window.__glassSelectReady = true;

  const supportsPopover =
    typeof HTMLElement !== 'undefined' &&
    typeof HTMLElement.prototype.showPopover === 'function' &&
    typeof HTMLElement.prototype.hidePopover === 'function';
  if (!supportsPopover) return;

  const CHECK_SVG =
    '<svg class="gs-check" viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.4 3 3 6-6.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ARROW_SVG =
    '<svg class="gs-arrow" viewBox="0 0 12 8" aria-hidden="true"><path d="m1 1.5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const instances = new Set();
  let openInstance = null;
  let uid = 0;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(String(value));
    }
    return String(value).replace(/(["\\])/g, '\\$1');
  }

  function explicitLabelFor(select) {
    if (!select.id) return null;
    return document.querySelector(`label[for="${cssEscape(select.id)}"]`);
  }

  function optionText(option) {
    return (option.label || option.textContent || option.value || '').trim();
  }

  function enhance(select) {
    if (!(select instanceof HTMLSelectElement)) return null;
    if (select.dataset.gsReady === 'true' || select.hasAttribute('data-gs-skip')) return null;
    if (select.multiple || select.size > 1) return null;
    if (!select.isConnected) return null;

    select.dataset.gsReady = 'true';
    const instance = createInstance(select);
    instances.add(instance);
    return instance;
  }

  function createInstance(select) {
    const baseId = `gs-${++uid}`;
    const context = select.closest('.sort-control')
      ? 'sort'
      : select.closest('.field')
        ? 'field'
        : 'plain';

    const wrap = document.createElement('div');
    wrap.className = `gs gs--${context}`;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'gs-trigger';
    trigger.id = `${baseId}-trigger`;
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', `${baseId}-listbox`);

    const valueEl = document.createElement('span');
    valueEl.className = 'gs-value';
    trigger.appendChild(valueEl);
    trigger.insertAdjacentHTML('beforeend', ARROW_SVG);

    const popover = document.createElement('div');
    popover.className = 'gs-popover';
    popover.id = `${baseId}-popover`;
    popover.setAttribute('popover', 'manual');
    popover.innerHTML = `<div class="gs-panel"><div class="gs-listbox" id="${baseId}-listbox" role="listbox"></div></div>`;

    const panel = popover.firstElementChild;
    const listbox = panel.firstElementChild;
    // 模态 dialog 会让其子树之外的一切 inert；弹出层必须挂进 dialog 才能接收真实点击。
    const popoverHost = select.closest('dialog') || document.body;

    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(trigger);
    wrap.appendChild(select);
    select.classList.add('gs-native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    popoverHost.appendChild(popover);

    const originalLabelFor = select.id ? explicitLabelFor(select) : null;
    let wrappingLabel = null;
    if (originalLabelFor) {
      originalLabelFor.htmlFor = trigger.id;
    } else {
      const wrapping = select.closest('label');
      const otherControls = wrapping
        ? [...wrapping.querySelectorAll('input, textarea, select')].filter((el) => el !== select)
        : [];
      if (wrapping) {
        const clone = wrapping.cloneNode(true);
        clone.querySelectorAll('input, textarea, select, button, .gs').forEach((node) => node.remove());
        const labelText = clone.textContent.replace(/\s+/g, ' ').trim();
        if (labelText) trigger.setAttribute('aria-label', labelText);
        if (!otherControls.length) {
          wrapping.htmlFor = trigger.id;
          wrappingLabel = wrapping;
        }
      }
    }

    const selectAriaLabel = select.getAttribute('aria-label');
    if (selectAriaLabel) trigger.setAttribute('aria-label', selectAriaLabel);
    const describedBy = select.getAttribute('aria-describedby');
    if (describedBy) trigger.setAttribute('aria-describedby', describedBy);

    let optionItems = [];
    let optionNodes = [];
    let optionDisabled = [];
    let isOpen = false;
    let activeIndex = -1;
    let typeBuffer = '';
    let typeTimer = 0;
    let refreshQueued = false;
    let positionFrame = 0;
    let bound = false;
    let destroyed = false;

    const api = {
      select,
      trigger,
      close,
      destroy,
      get isOpen() {
        return isOpen;
      },
    };

    function valueOf(option) {
      return option ? option.value : '';
    }

    function selectedIndex() {
      return optionItems.findIndex((option) => option.selected);
    }

    function enabledIndexes() {
      const out = [];
      optionDisabled.forEach((disabled, index) => {
        if (!disabled) out.push(index);
      });
      return out;
    }

    function firstEnabledIndex() {
      return optionDisabled.findIndex((disabled) => !disabled);
    }

    function lastEnabledIndex() {
      for (let index = optionDisabled.length - 1; index >= 0; index -= 1) {
        if (!optionDisabled[index]) return index;
      }
      return -1;
    }

    function addOption(container, option, groupDisabled) {
      const index = optionItems.length;
      const disabled = groupDisabled || option.disabled;
      optionItems.push(option);
      optionDisabled.push(disabled);

      const node = document.createElement('div');
      node.className = `gs-option${disabled ? ' is-disabled' : ''}`;
      node.id = `${baseId}-opt-${index}`;
      node.dataset.index = String(index);
      node.setAttribute('role', 'option');
      node.setAttribute('aria-selected', String(option.selected));
      node.setAttribute('aria-disabled', String(disabled));

      const text = document.createElement('span');
      text.className = 'gs-option-text';
      text.textContent = optionText(option) || option.value || '—';
      node.appendChild(text);
      node.insertAdjacentHTML('beforeend', CHECK_SVG);
      container.appendChild(node);
      optionNodes.push(node);
    }

    function rebuild() {
      optionItems = [];
      optionNodes = [];
      optionDisabled = [];
      listbox.replaceChildren();

      const fragment = document.createDocumentFragment();
      for (const child of select.children) {
        if (child.tagName === 'OPTGROUP') {
          if (!child.children.length) continue;
          const group = document.createElement('div');
          group.className = 'gs-group';
          group.setAttribute('role', 'group');
          group.setAttribute('aria-label', child.label || '选项组');
          if (child.label) {
            const label = document.createElement('div');
            label.className = 'gs-group-label';
            label.setAttribute('aria-hidden', 'true');
            label.textContent = child.label;
            group.appendChild(label);
          }
          for (const option of child.children) {
            if (option.tagName === 'OPTION') addOption(group, option, child.disabled);
          }
          fragment.appendChild(group);
        } else if (child.tagName === 'OPTION') {
          addOption(fragment, child, false);
        }
      }

      if (!optionItems.length) {
        const empty = document.createElement('div');
        empty.className = 'gs-empty';
        empty.textContent = '暂无可选项';
        fragment.appendChild(empty);
      }

      listbox.appendChild(fragment);
      syncTrigger();
      syncSelection();
    }

    function syncTrigger() {
      const selected = select.selectedOptions && select.selectedOptions[0];
      const text = selected ? optionText(selected) || selected.value || '—' : '请选择';
      valueEl.textContent = text;
      trigger.disabled = select.disabled;
      wrap.classList.toggle('is-disabled', select.disabled);
    }

    function syncSelection() {
      optionNodes.forEach((node, index) => {
        node.setAttribute('aria-selected', String(Boolean(optionItems[index] && optionItems[index].selected)));
      });
    }

    function scrollActiveIntoView() {
      const node = optionNodes[activeIndex];
      if (!node) return;
      const nodeRect = node.getBoundingClientRect();
      const listRect = listbox.getBoundingClientRect();
      if (nodeRect.top < listRect.top) {
        listbox.scrollTop -= listRect.top - nodeRect.top + 4;
      } else if (nodeRect.bottom > listRect.bottom) {
        listbox.scrollTop += nodeRect.bottom - listRect.bottom + 4;
      }
    }

    function paintActive() {
      optionNodes.forEach((node, index) => {
        node.classList.toggle('is-active', index === activeIndex && !optionDisabled[index]);
      });
      const active = optionNodes[activeIndex];
      if (active) {
        trigger.setAttribute('aria-activedescendant', active.id);
        scrollActiveIntoView();
      } else {
        trigger.removeAttribute('aria-activedescendant');
      }
    }

    function moveActive(step) {
      const enabled = enabledIndexes();
      if (!enabled.length) return;
      let position = enabled.indexOf(activeIndex);
      if (position === -1) position = step > 0 ? -1 : 0;
      position = (position + step + enabled.length) % enabled.length;
      activeIndex = enabled[position];
      paintActive();
    }

    function movePage(direction) {
      const enabled = enabledIndexes();
      if (!enabled.length) return;
      let position = enabled.indexOf(activeIndex);
      if (position === -1) position = direction > 0 ? -1 : 0;
      position = clamp(position + direction * 6, 0, enabled.length - 1);
      activeIndex = enabled[position];
      paintActive();
    }

    function typeahead(key) {
      clearTimeout(typeTimer);
      typeBuffer += key.toLocaleLowerCase();
      typeTimer = window.setTimeout(() => {
        typeBuffer = '';
      }, 600);

      const enabled = enabledIndexes();
      if (!enabled.length) return;
      const start = enabled.indexOf(activeIndex);
      for (let step = 1; step <= enabled.length; step += 1) {
        const index = enabled[(start + step + enabled.length) % enabled.length];
        if (optionText(optionItems[index]).toLocaleLowerCase().startsWith(typeBuffer)) {
          activeIndex = index;
          paintActive();
          return;
        }
      }
    }

    function viewportSize() {
      const view = window.visualViewport;
      const root = document.documentElement;
      return {
        width: (view && view.width) || window.innerWidth || root.clientWidth || 360,
        height: (view && view.height) || window.innerHeight || root.clientHeight || 640,
      };
    }

    function position() {
      if (!isOpen || !trigger.isConnected) return;
      const { width: viewWidth, height: viewHeight } = viewportSize();
      const margin = 12;
      const rect = trigger.getBoundingClientRect();
      const maxWidth = Math.max(120, viewWidth - margin * 2);
      const width = Math.min(Math.max(rect.width, 176), maxWidth, 520);

      popover.style.width = `${Math.round(width)}px`;
      popover.style.left = '0px';
      popover.style.right = 'auto';
      listbox.style.maxHeight = `${Math.round(Math.min(320, Math.max(100, viewHeight - margin * 2 - 16)))}px`;

      const panelRect = panel.getBoundingClientRect();
      const panelHeight = Math.min(panelRect.height || 0, viewHeight - margin * 2);
      const spaceBelow = viewHeight - rect.bottom - margin;
      const spaceAbove = rect.top - margin;
      const placeAbove = spaceBelow < panelHeight + 8 && spaceAbove > spaceBelow;

      if (placeAbove) {
        popover.style.top = 'auto';
        popover.style.bottom = `${Math.round(viewHeight - rect.top + 6)}px`;
        listbox.style.maxHeight = `${Math.round(Math.min(320, Math.max(100, spaceAbove - 12)))}px`;
      } else {
        popover.style.bottom = 'auto';
        popover.style.top = `${Math.round(rect.bottom + 6)}px`;
        listbox.style.maxHeight = `${Math.round(Math.min(320, Math.max(100, spaceBelow - 12)))}px`;
      }

      const maxLeft = Math.max(margin, viewWidth - width - margin);
      popover.style.left = `${Math.round(clamp(rect.left, margin, maxLeft))}px`;
      popover.dataset.placement = placeAbove ? 'top' : 'bottom';
    }

    function onViewportChange() {
      if (!isOpen || positionFrame) return;
      positionFrame = window.requestAnimationFrame(() => {
        positionFrame = 0;
        if (!isOpen) return;
        if (!trigger.isConnected) {
          close(false);
          return;
        }
        const { width: viewWidth, height: viewHeight } = viewportSize();
        const rect = trigger.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewHeight || rect.right < 0 || rect.left > viewWidth) {
          close(false);
          return;
        }
        position();
      });
    }

    function onDocumentPointerDown(event) {
      if (popover.contains(event.target) || trigger.contains(event.target)) return;
      close(false);
    }

    function onDocumentKeyDown(event) {
      if (event.key !== 'Escape' || !isOpen) return;
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }

    function onFocusIn(event) {
      if (!isOpen) return;
      if (trigger.contains(event.target) || popover.contains(event.target)) return;
      close(false);
    }

    function onVisibilityChange() {
      if (document.hidden && isOpen) close(false);
    }

    function onDialogClose() {
      if (isOpen) close(false);
    }

    function bindGlobal() {
      if (bound) return;
      bound = true;
      document.addEventListener('pointerdown', onDocumentPointerDown, true);
      document.addEventListener('keydown', onDocumentKeyDown, true);
      document.addEventListener('focusin', onFocusIn, true);
      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('resize', onViewportChange, { passive: true });
      window.addEventListener('scroll', onViewportChange, true);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onViewportChange);
        window.visualViewport.addEventListener('scroll', onViewportChange);
      }
      const dialog = select.closest('dialog');
      if (dialog) dialog.addEventListener('close', onDialogClose);
    }

    function unbindGlobal() {
      if (!bound) return;
      bound = false;
      document.removeEventListener('pointerdown', onDocumentPointerDown, true);
      document.removeEventListener('keydown', onDocumentKeyDown, true);
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onViewportChange);
        window.visualViewport.removeEventListener('scroll', onViewportChange);
      }
      const dialog = select.closest('dialog');
      if (dialog) dialog.removeEventListener('close', onDialogClose);
    }

    function open(preferLast) {
      if (destroyed || isOpen || select.disabled || !select.isConnected) return;
      if (openInstance && openInstance !== api) openInstance.close(false);
      refresh();

      isOpen = true;
      openInstance = api;
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      popover.style.visibility = 'hidden';

      try {
        popover.showPopover();
      } catch (error) {
        isOpen = false;
        openInstance = null;
        wrap.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        popover.style.visibility = '';
        return;
      }

      activeIndex = preferLast ? lastEnabledIndex() : selectedIndex();
      if (activeIndex < 0) activeIndex = firstEnabledIndex();
      paintActive();
      position();
      popover.style.visibility = '';
      bindGlobal();
    }

    function close(focusTrigger, alreadyHidden) {
      if (!isOpen) {
        if (focusTrigger && trigger.isConnected) trigger.focus({ preventScroll: true });
        return;
      }
      isOpen = false;
      if (openInstance === api) openInstance = null;
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
      popover.style.visibility = '';
      if (positionFrame) {
        window.cancelAnimationFrame(positionFrame);
        positionFrame = 0;
      }
      if (!alreadyHidden) {
        try {
          if (popover.matches(':popover-open')) popover.hidePopover();
        } catch (error) {
          /* already closed */
        }
      }
      unbindGlobal();
      if (focusTrigger && trigger.isConnected) trigger.focus({ preventScroll: true });
    }

    function commit(index) {
      const option = optionItems[index];
      if (!option || optionDisabled[index]) return;
      const next = valueOf(option);
      const changed = select.value !== next;
      select.value = next;
      if (changed) select.dispatchEvent(new Event('change', { bubbles: true }));
      close(true);
    }

    function syncFromNative() {
      syncTrigger();
      syncSelection();
      if (isOpen) {
        activeIndex = selectedIndex();
        if (activeIndex < 0) activeIndex = firstEnabledIndex();
        paintActive();
      }
    }

    function refresh() {
      if (destroyed) return;
      rebuild();
      if (isOpen) {
        activeIndex = selectedIndex();
        if (activeIndex < 0) activeIndex = firstEnabledIndex();
        paintActive();
        position();
      }
    }

    function scheduleRefresh() {
      if (refreshQueued || destroyed) return;
      refreshQueued = true;
      queueMicrotask(() => {
        refreshQueued = false;
        if (!destroyed) refresh();
      });
    }

    function destroy() {
      if (destroyed) return;
      close(false);
      destroyed = true;
      observer.disconnect();
      if (select.form) select.form.removeEventListener('reset', onReset);
      const dialog = select.closest('dialog');
      if (dialog) dialog.removeEventListener('close', onDialogClose);
      select.removeEventListener('change', syncFromNative);
      if (popover.isConnected) popover.remove();
      if (wrap.isConnected) {
        wrap.parentNode.insertBefore(select, wrap);
        wrap.remove();
      }
      select.classList.remove('gs-native');
      select.removeAttribute('aria-hidden');
      select.removeAttribute('tabindex');
      select.dataset.gsReady = 'false';
      if (originalLabelFor) originalLabelFor.htmlFor = select.id;
      if (wrappingLabel) wrappingLabel.removeAttribute('for');
    }

    function onReset() {
      window.requestAnimationFrame(() => {
        if (!destroyed) syncFromNative();
      });
    }

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      if (isOpen) close(true);
      else open(false);
    });

    trigger.addEventListener('keydown', (event) => {
      if (event.isComposing) return;
      const key = event.key;

      if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        if (!isOpen) open(false);
        else moveActive(key === 'ArrowDown' ? 1 : -1);
        return;
      }

      if (key === 'Home' || key === 'End') {
        event.preventDefault();
        event.stopPropagation();
        if (!isOpen) open(key === 'End');
        activeIndex = key === 'Home' ? firstEnabledIndex() : lastEnabledIndex();
        paintActive();
        return;
      }

      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        if (!isOpen) open(false);
        else commit(activeIndex);
        return;
      }

      if (key === 'PageDown' || key === 'PageUp') {
        event.preventDefault();
        event.stopPropagation();
        if (!isOpen) open(false);
        else movePage(key === 'PageDown' ? 1 : -1);
        return;
      }

      if (key === 'Escape') {
        if (!isOpen) return;
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      }

      if (key === 'Tab') {
        if (isOpen) close(false);
        return;
      }

      if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        event.stopPropagation();
        if (!isOpen) open(false);
        typeahead(key);
      }
    });

    popover.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.target.closest('.gs-option')) {
        event.preventDefault();
      }
    });

    popover.addEventListener('click', (event) => {
      const node = event.target.closest('.gs-option');
      if (!node || !popover.contains(node)) return;
      commit(Number(node.dataset.index));
    });

    popover.addEventListener('toggle', (event) => {
      if (event.newState === 'closed' && isOpen) close(false, true);
    });

    const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    if (valueDescriptor && valueDescriptor.get && valueDescriptor.set) {
      try {
        Object.defineProperty(select, 'value', {
          configurable: true,
          enumerable: valueDescriptor.enumerable,
          get() {
            return valueDescriptor.get.call(this);
          },
          set(next) {
            valueDescriptor.set.call(this, next);
            syncFromNative();
          },
        });
      } catch (error) {
        /* 原生 change 事件仍然会同步显示 */
      }
    }

    select.addEventListener('change', syncFromNative);
    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(select, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['disabled', 'label', 'selected', 'value', 'hidden'],
    });
    if (select.form) select.form.addEventListener('reset', onReset);

    refresh();
    return api;
  }

  function scan() {
    for (const instance of [...instances]) {
      if (!instance.select.isConnected) {
        instance.destroy();
        instances.delete(instance);
      }
    }
    document.querySelectorAll('select:not([data-gs-ready="true"])').forEach(enhance);
  }

  let scanQueued = false;
  function scheduleScan() {
    if (scanQueued) return;
    scanQueued = true;
    window.requestAnimationFrame(() => {
      scanQueued = false;
      scan();
    });
  }

  function boot() {
    scan();
    if (!document.body) return;
    const pageObserver = new MutationObserver(scheduleScan);
    pageObserver.observe(document.body, { childList: true, subtree: true });
  }

  window.GlassSelect = { enhance, refresh: scan };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
