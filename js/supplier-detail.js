/* 供应商详情纯前端展示：演示类目筛选与分区独立编辑，不读写真实业务数据。 */
(function () {
  'use strict';

  const categories = {
    all: { name: '全部供应货物', path: '全部类目' },
    fe: { name: '灭火器材', path: '灭火器材' },
    hd: { name: '消防水带', path: '消防水带' },
    el: { name: '应急照明', path: '应急照明' },
    'el-sign': { name: '疏散指示灯', path: '应急照明 / 疏散指示灯' },
    pj: { name: '配件', path: '配件' },
    'pj-extinguisher': { name: '灭火器配件', path: '配件 / 灭火器配件' },
    'pj-extinguisher-discharge': { name: '灭火器喷射组件及维修替换配件', path: '配件 / 灭火器配件 / 灭火器喷射组件及维修替换配件' },
    'pj-water': { name: '消防水带连接配件', path: '配件 / 消防水带连接配件' },
    'pj-water-connectors': { name: '水带接口与连接组件', path: '配件 / 消防水带连接配件 / 水带接口与连接组件' }
  };

  const goods = [
    { id: 'spu-001', code: 'SPU-FE-001', categoryName: '手提式干粉灭火器', brand: '淮海', category: '灭火器材 / 手提式干粉灭火器', branchIds: ['fe'], sku: 4, price: '¥62.00–86.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
    { id: 'spu-002', code: 'SPU-FE-003', categoryName: '手提式二氧化碳灭火器', brand: '淮海', category: '灭火器材 / 手提式二氧化碳灭火器', branchIds: ['fe'], sku: 3, price: '¥128.00–196.00', status: 'stable', statusLabel: '稳定供货', lead: '5–7 天' },
    { id: 'spu-003', code: 'SPU-FE-002', categoryName: '推车式干粉灭火器', brand: '沱雨', category: '灭火器材 / 推车式干粉灭火器', branchIds: ['fe'], sku: 2, price: '¥468.00–720.00', status: 'normal', statusLabel: '正常供货', lead: '7–10 天' },
    { id: 'spu-004', code: 'SPU-FE-006', categoryName: '水基型灭火器', brand: '淮海', category: '灭火器材 / 水基型灭火器', branchIds: ['fe'], sku: 3, price: '¥76.00–118.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
    { id: 'spu-005', code: 'SPU-HD-001', categoryName: '有衬里消防水带', brand: '沱雨', category: '消防水带 / 有衬里消防水带', branchIds: ['hd'], sku: 6, price: '¥92.00–168.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
    { id: 'spu-006', code: 'SPU-HD-004', categoryName: '聚氨酯消防水带', brand: '沱雨', category: '消防水带 / 有衬里消防水带', branchIds: ['hd'], sku: 4, price: '¥138.00–236.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' },
    { id: 'spu-007', code: 'SPU-EL-001', categoryName: '消防应急照明灯', brand: '敏华', category: '应急照明 / 消防应急照明灯', branchIds: ['el'], sku: 3, price: '¥38.00–66.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
    { id: 'spu-008', code: 'SPU-EL-002', categoryName: '安全出口标志灯', brand: '敏华', category: '应急照明 / 疏散指示灯 / 安全出口标志灯', branchIds: ['el', 'el-sign'], sku: 4, price: '¥42.00–72.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
    { id: 'spu-009', code: 'SPU-EL-003', categoryName: '疏散方向标志灯', brand: '敏华', category: '应急照明 / 疏散指示灯 / 疏散方向标志灯', branchIds: ['el', 'el-sign'], sku: 5, price: '¥39.00–69.00', status: 'paused', statusLabel: '临时停供', lead: '待确认' },
    { id: 'spu-010', code: 'SPU-PJ-001', categoryName: '灭火器喷管', brand: '淮海', category: '配件 / 灭火器配件 / 灭火器喷射组件及维修替换配件 / 灭火器喷管', branchIds: ['pj', 'pj-extinguisher', 'pj-extinguisher-discharge'], sku: 2, price: '¥8.50–12.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
    { id: 'spu-011', code: 'SPU-PJ-003', categoryName: '消防水带接口', brand: '沱雨', category: '配件 / 消防水带连接配件 / 水带接口与连接组件 / 消防水带接口', branchIds: ['pj', 'pj-water', 'pj-water-connectors'], sku: 3, price: '¥22.00–38.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' }
  ];

  let contacts = [
    { name: '张经理', info: '138 **** 2608' },
    { name: '刘会计', info: '025-**** 1630' },
    { name: '仓储部', info: '025-**** 1725' }
  ];

  const $ = (id) => document.getElementById(id);
  const treeButtons = [...document.querySelectorAll('[data-category]')];
  const spuBody = $('sd-spu-body');
  const goodsEmpty = $('sd-goods-empty');
  const goodsSearch = $('sd-goods-search');
  const basicDialog = $('sd-basic-dialog');
  const contactDialog = $('sd-contact-dialog');
  const basicForm = $('sd-basic-form');
  const contactForm = $('sd-contact-form');
  const contactEditor = $('sd-contact-editor');
  const contactList = $('sd-contact-list');
  const toast = $('sd-toast');
  const openers = new WeakMap();
  let selectedCategory = 'all';
  let toastTimer = 0;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
  }

  function icon(name) {
    return `<svg class="sd-icon" aria-hidden="true"><use href="#sd-${name}"/></svg>`;
  }

  function categoryGoods(categoryId) {
    if (categoryId === 'all') return goods;
    return goods.filter((item) => item.branchIds.includes(categoryId));
  }

  function updateCategoryCounts() {
    document.querySelectorAll('[data-category-count]').forEach((element) => {
      element.textContent = String(categoryGoods(element.dataset.categoryCount).length);
    });
    $('sd-tree-total-count').textContent = String(goods.length);
  }

  function rowMarkup(item) {
    const statusClass = item.status === 'stable' ? '' : ` is-${item.status}`;
    return `
      <div class="sd-spu-row" role="row" data-spu-id="${escapeHtml(item.id)}">
        <div class="sd-spu-cell sd-spu-identity" role="cell">
          <span class="sd-product-mark" aria-hidden="true">${icon('box')}</span>
          <span class="sd-product-copy">
            <strong class="sd-product-name"><span class="sd-product-brand">${escapeHtml(item.brand)}</span><span class="sd-product-separator" aria-hidden="true"> · </span>${escapeHtml(item.categoryName)}</strong>
            <span class="sd-product-meta"><span class="sd-code">${escapeHtml(item.code)}</span><span class="sd-meta-dot" aria-hidden="true"></span><span title="${escapeHtml(item.category)}">${escapeHtml(item.category)}</span></span>
          </span>
        </div>
        <div class="sd-spu-cell" role="cell" data-label="规格与进价"><span class="sd-spec-copy"><strong>${item.sku} 个 SKU</strong><span>${escapeHtml(item.price)}</span></span></div>
        <div class="sd-spu-cell" role="cell" data-label="供货状态"><span class="sd-supply-copy"><span class="sd-supply-status${statusClass}">${escapeHtml(item.statusLabel)}</span><small>${escapeHtml(item.lead)}</small></span></div>
      </div>`;
  }

  function renderGoods() {
    const query = goodsSearch.value.trim().toLocaleLowerCase('zh-CN');
    const matches = categoryGoods(selectedCategory).filter((item) => {
      const searchable = [item.brand, item.categoryName, item.code, item.category].join(' ').toLocaleLowerCase('zh-CN');
      return !query || searchable.includes(query);
    });
    const category = categories[selectedCategory] || categories.all;

    $('sd-category-path').textContent = category.path;
    $('sd-goods-title').textContent = category.name;
    $('sd-goods-count').textContent = String(matches.length);
    spuBody.innerHTML = matches.map(rowMarkup).join('');
    document.querySelector('.sd-spu-list').hidden = matches.length === 0;
    goodsEmpty.hidden = matches.length > 0;
  }

  function selectCategory(categoryId, focus = false) {
    selectedCategory = categories[categoryId] ? categoryId : 'all';
    treeButtons.forEach((button) => {
      const selected = button.dataset.category === selectedCategory;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-selected', String(selected));
      if (selected && focus) button.focus({ preventScroll: true });
    });
    renderGoods();
  }

  function contactCardMarkup(contact, index) {
    const name = contact.name || '未命名联系人';
    const avatar = name.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '').slice(0, 1) || '联';
    return `
      <article class="sd-contact-item">
        <span class="sd-contact-avatar" aria-hidden="true">${escapeHtml(avatar)}</span>
        <div class="sd-contact-copy">
          <div class="sd-contact-name-line"><strong>${escapeHtml(name)}</strong>${index === 0 ? '<span class="sd-primary-contact">主要联系人</span>' : ''}</div>
          <div class="sd-contact-info">${icon('phone')}<span>${escapeHtml(contact.info || '未填写联系方式')}</span></div>
        </div>
      </article>`;
  }

  function renderContacts() {
    $('sd-contact-count').textContent = String(contacts.length);
    contactList.innerHTML = contacts.length
      ? contacts.map(contactCardMarkup).join('')
      : '<div class="sd-contact-item"><span class="sd-contact-avatar" aria-hidden="true">联</span><div class="sd-contact-copy"><div class="sd-contact-name-line"><strong>暂无联系人</strong></div><div class="sd-contact-info">可通过编辑补充联系信息</div></div></div>';
  }

  function contactEditorRow(contact, index, total) {
    return `
      <div class="sd-contact-editor-row" data-contact-row>
        <input data-contact-name maxlength="40" value="${escapeHtml(contact.name || '')}" placeholder="例如：张经理" aria-label="第 ${index + 1} 位联系人姓名">
        <input data-contact-info maxlength="100" value="${escapeHtml(contact.info || '')}" placeholder="电话、微信或平台客服" aria-label="第 ${index + 1} 位联系人联系方式">
        <button class="sd-remove-contact" type="button" data-remove-contact="${index}" aria-label="移除第 ${index + 1} 位联系人"${total === 1 ? ' disabled' : ''}>${icon('trash')}</button>
      </div>`;
  }

  function contactValues() {
    return [...contactEditor.querySelectorAll('[data-contact-row]')].map((row) => ({
      name: row.querySelector('[data-contact-name]').value.trim(),
      info: row.querySelector('[data-contact-info]').value.trim()
    }));
  }

  function renderContactEditor(values) {
    const rows = values.length ? values : [{ name: '', info: '' }];
    contactEditor.innerHTML = rows.map((contact, index) => contactEditorRow(contact, index, rows.length)).join('');
  }

  function updateOnlineFields() {
    $('sd-online-fields').hidden = $('sd-source-input').value !== 'online_store';
  }

  function openDialog(dialog, opener) {
    openers.set(dialog, opener || document.activeElement);
    dialog.showModal();
    document.body.classList.add('sd-dialog-open');
  }

  function closeDialog(dialog) {
    if (dialog.open) dialog.close();
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.querySelector('span').textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2400);
  }

  function updateBasicCard() {
    const name = $('sd-name-input').value.trim();
    const sourceInput = $('sd-source-input');
    const priorityInput = $('sd-priority-input');
    const statusInput = $('sd-status-input');
    const region = $('sd-region-input').value.trim();
    const brands = [...document.querySelectorAll('.sd-brand-options input:checked')].map((input) => input.value);
    const sourceLabel = sourceInput.options[sourceInput.selectedIndex].text;
    const priorityLabel = priorityInput.options[priorityInput.selectedIndex].text;
    const statusLabel = statusInput.options[statusInput.selectedIndex].text;
    const platform = $('sd-platform-input').value.trim();

    $('sd-page-title').textContent = name;
    $('sd-basic-name').textContent = name;
    $('sd-heading-region').textContent = region || '未填写地区';
    $('sd-basic-region').textContent = region || '—';
    $('sd-basic-source').textContent = sourceInput.value === 'online_store' && platform ? `${sourceLabel} · ${platform}` : sourceLabel;
    $('sd-basic-priority').textContent = priorityLabel;
    $('sd-basic-status').textContent = statusLabel;
    $('sd-basic-remark').textContent = $('sd-remark-input').value.trim() || '—';
    $('sd-basic-brands').innerHTML = brands.length ? brands.map((brand) => `<span>${escapeHtml(brand)}</span>`).join('') : '<span>未设置</span>';

    const headingStatus = $('sd-heading-status');
    headingStatus.className = `sd-status ${statusInput.value === 'active' ? 'is-active' : 'is-inactive'}`;
    headingStatus.innerHTML = `<span aria-hidden="true"></span>${statusLabel}`;

    const priorityClasses = { preferred: 'is-preferred', normal: 'is-normal', backup: 'is-backup' };
    const priorityHeadings = { preferred: '优先采购', normal: '普通', backup: '备选' };
    const headingPriority = $('sd-heading-priority');
    headingPriority.className = `sd-priority ${priorityClasses[priorityInput.value] || 'is-normal'}`;
    headingPriority.innerHTML = `<span aria-hidden="true"></span>${priorityHeadings[priorityInput.value] || priorityLabel}`;
  }

  treeButtons.forEach((button) => button.addEventListener('click', () => selectCategory(button.dataset.category)));
  document.querySelectorAll('[data-tree-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const categoryId = button.dataset.treeToggle;
      const group = $(`sd-tree-${categoryId}-children`);
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      button.setAttribute('aria-label', `${expanded ? '展开' : '收起'}${categories[categoryId].name}`);
      group.hidden = expanded;
      button.closest('.sd-tree-row').querySelector('[data-category]').setAttribute('aria-expanded', String(!expanded));
    });
  });
  goodsSearch.addEventListener('input', renderGoods);

  $('sd-edit-basic').addEventListener('click', (event) => {
    updateOnlineFields();
    openDialog(basicDialog, event.currentTarget);
    window.requestAnimationFrame(() => $('sd-name-input').focus());
  });
  $('sd-edit-contacts').addEventListener('click', (event) => {
    renderContactEditor(contacts);
    openDialog(contactDialog, event.currentTarget);
    window.requestAnimationFrame(() => contactEditor.querySelector('[data-contact-name]').focus());
  });

  $('sd-source-input').addEventListener('change', updateOnlineFields);
  basicForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!basicForm.reportValidity()) return;
    updateBasicCard();
    closeDialog(basicDialog);
    showToast('基本信息已保存');
  });

  $('sd-add-contact').addEventListener('click', () => {
    const values = contactValues();
    values.push({ name: '', info: '' });
    renderContactEditor(values);
    contactEditor.querySelector('[data-contact-row]:last-child [data-contact-name]').focus();
  });
  contactEditor.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-contact]');
    if (!button || button.disabled) return;
    const values = contactValues();
    values.splice(Number(button.dataset.removeContact), 1);
    renderContactEditor(values);
  });
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contacts = contactValues().filter((contact) => contact.name || contact.info);
    renderContacts();
    closeDialog(contactDialog);
    showToast('联系人已保存');
  });

  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => closeDialog(button.closest('dialog')));
  });
  [basicDialog, contactDialog].forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      document.body.classList.toggle('sd-dialog-open', Boolean(document.querySelector('.sd-dialog[open]')));
      const opener = openers.get(dialog);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    });
  });

  updateCategoryCounts();
  renderContacts();
  renderGoods();
}());
