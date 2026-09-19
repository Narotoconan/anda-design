/* 供应商详情纯前端展示：演示类目筛选与分区独立编辑，不读写真实业务数据。 */
(function () {
  'use strict';

  const categories = {
    all: { name: '全部货物', path: '全部货物' },
    fe: { name: '灭火器材', path: '灭火器材' },
    'fe-portable': { name: '手提式灭火器', path: '灭火器材 / 手提式灭火器' },
    'fe-dry': { name: '干粉灭火器', path: '灭火器材 / 手提式灭火器 / 干粉灭火器' },
    'fe-co2': { name: '二氧化碳灭火器', path: '灭火器材 / 手提式灭火器 / 二氧化碳灭火器' },
    'fe-water': { name: '水基型灭火器', path: '灭火器材 / 手提式灭火器 / 水基型灭火器' },
    'fe-trolley': { name: '推车式灭火器', path: '灭火器材 / 推车式灭火器' },
    hd: { name: '消防水带', path: '消防水带' },
    'hd-lined': { name: '有衬里消防水带', path: '消防水带 / 有衬里消防水带' },
    'hd-poly': { name: '聚氨酯消防水带', path: '消防水带 / 聚氨酯消防水带' },
    el: { name: '应急照明', path: '应急照明' },
    'el-light': { name: '消防应急照明灯', path: '应急照明 / 消防应急照明灯' },
    'el-sign': { name: '疏散指示灯', path: '应急照明 / 疏散指示灯' },
    'el-sign-exit': { name: '安全出口标志灯', path: '应急照明 / 疏散指示灯 / 安全出口标志灯' },
    'el-sign-direction': { name: '疏散方向标志灯', path: '应急照明 / 疏散指示灯 / 疏散方向标志灯' },
    pj: { name: '配件', path: '配件' },
    'pj-extinguisher': { name: '灭火器配件', path: '配件 / 灭火器配件' },
    'pj-extinguisher-discharge': { name: '灭火器喷射组件及维修替换配件', path: '配件 / 灭火器配件 / 灭火器喷射组件及维修替换配件' },
    'pj-water': { name: '消防水带连接配件', path: '配件 / 消防水带连接配件' },
    'pj-water-connectors': { name: '水带接口与连接组件', path: '配件 / 消防水带连接配件 / 水带接口与连接组件' }
  };

  const goods = [
    {
      id: 'spu-001', code: 'SPU-FE-001', categoryName: '手提式干粉灭火器', brand: '淮海', category: '灭火器材 / 手提式灭火器 / 干粉灭火器', branchIds: ['fe', 'fe-portable', 'fe-dry'],
      skus: [
        { code: 'SKU-FE-001-01', spec: '1kg', model: 'MFZ/ABC1', price: '¥62.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-FE-001-02', spec: '2kg', model: 'MFZ/ABC2', price: '¥66.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-FE-001-04', spec: '4kg', model: 'MFZ/ABC4', price: '¥72.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-FE-001-08', spec: '8kg', model: 'MFZ/ABC8', price: '¥86.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' }
      ]
    },
    {
      id: 'spu-002', code: 'SPU-FE-003', categoryName: '手提式二氧化碳灭火器', brand: '淮海', category: '灭火器材 / 手提式灭火器 / 二氧化碳灭火器', branchIds: ['fe', 'fe-portable', 'fe-co2'],
      skus: [
        { code: 'SKU-FE-003-02', spec: '2kg', model: 'MT/2', price: '¥128.00', status: 'stable', statusLabel: '稳定供货', lead: '5–7 天' },
        { code: 'SKU-FE-003-03', spec: '3kg', model: 'MT/3', price: '¥149.00', status: 'stable', statusLabel: '稳定供货', lead: '5–7 天' },
        { code: 'SKU-FE-003-05', spec: '5kg', model: 'MT/5', price: '¥196.00', status: 'normal', statusLabel: '正常供货', lead: '7–10 天' }
      ]
    },
    {
      id: 'spu-003', code: 'SPU-FE-002', categoryName: '推车式干粉灭火器', brand: '沱雨', category: '灭火器材 / 推车式灭火器', branchIds: ['fe', 'fe-trolley'],
      skus: [
        { code: 'SKU-FE-002-35', spec: '35kg', model: 'MFTZ/ABC35', price: '¥468.00', status: 'normal', statusLabel: '正常供货', lead: '7–10 天' },
        { code: 'SKU-FE-002-50', spec: '50kg', model: 'MFTZ/ABC50', price: '¥720.00', status: 'normal', statusLabel: '正常供货', lead: '7–10 天' }
      ]
    },
    {
      id: 'spu-004', code: 'SPU-FE-006', categoryName: '水基型灭火器', brand: '淮海', category: '灭火器材 / 手提式灭火器 / 水基型灭火器', branchIds: ['fe', 'fe-portable', 'fe-water'],
      skus: [
        { code: 'SKU-FE-006-02', spec: '2L', model: 'MSWZ/2', price: '¥76.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-FE-006-03', spec: '3L', model: 'MSWZ/3', price: '¥89.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-FE-006-06', spec: '6L', model: 'MSWZ/6', price: '¥118.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' }
      ]
    },
    {
      id: 'spu-005', code: 'SPU-HD-001', categoryName: '有衬里消防水带', brand: '沱雨', category: '消防水带 / 有衬里消防水带', branchIds: ['hd', 'hd-lined'],
      skus: [
        { code: 'SKU-HD-001-820', spec: '8-65-20m', model: '8型 DN65', price: '¥92.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-HD-001-825', spec: '8-65-25m', model: '8型 DN65', price: '¥108.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-HD-001-830', spec: '8-65-30m', model: '8型 DN65', price: '¥126.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-HD-001-1020', spec: '10-65-20m', model: '10型 DN65', price: '¥118.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-HD-001-1025', spec: '10-65-25m', model: '10型 DN65', price: '¥145.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' },
        { code: 'SKU-HD-001-1030', spec: '10-65-30m', model: '10型 DN65', price: '¥168.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' }
      ]
    },
    {
      id: 'spu-006', code: 'SPU-HD-004', categoryName: '聚氨酯消防水带', brand: '沱雨', category: '消防水带 / 聚氨酯消防水带', branchIds: ['hd', 'hd-poly'],
      skus: [
        { code: 'SKU-HD-004-1620', spec: '16-65-20m', model: '16型 DN65', price: '¥138.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' },
        { code: 'SKU-HD-004-1625', spec: '16-65-25m', model: '16型 DN65', price: '¥168.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' },
        { code: 'SKU-HD-004-1630', spec: '16-65-30m', model: '16型 DN65', price: '¥198.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' },
        { code: 'SKU-HD-004-8020', spec: '16-80-20m', model: '16型 DN80', price: '¥236.00', status: 'paused', statusLabel: '临时停供', lead: '待确认' }
      ]
    },
    {
      id: 'spu-007', code: 'SPU-EL-001', categoryName: '消防应急照明灯', brand: '敏华', category: '应急照明 / 消防应急照明灯', branchIds: ['el', 'el-light'],
      skus: [
        { code: 'SKU-EL-001-03', spec: '3W', model: 'M-ZFZD-E3W', price: '¥38.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-EL-001-05', spec: '5W', model: 'M-ZFZD-E5W', price: '¥49.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-EL-001-08', spec: '8W', model: 'M-ZFZD-E8W', price: '¥66.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' }
      ]
    },
    {
      id: 'spu-008', code: 'SPU-EL-002', categoryName: '安全出口标志灯', brand: '敏华', category: '应急照明 / 疏散指示灯 / 安全出口标志灯', branchIds: ['el', 'el-sign', 'el-sign-exit'],
      skus: [
        { code: 'SKU-EL-002-01', spec: '单面壁挂', model: 'M-BLZD-1LROE', price: '¥42.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-EL-002-02', spec: '双面吊装', model: 'M-BLZD-2LROE', price: '¥52.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-EL-002-03', spec: '嵌入式', model: 'M-BLJC-1LROE', price: '¥58.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' },
        { code: 'SKU-EL-002-04', spec: '防爆型', model: 'M-BLZD-FB', price: '¥72.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' }
      ]
    },
    {
      id: 'spu-009', code: 'SPU-EL-003', categoryName: '疏散方向标志灯', brand: '敏华', category: '应急照明 / 疏散指示灯 / 疏散方向标志灯', branchIds: ['el', 'el-sign', 'el-sign-direction'],
      skus: [
        { code: 'SKU-EL-003-L', spec: '左向', model: 'M-BLZD-I1L', price: '¥39.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-EL-003-R', spec: '右向', model: 'M-BLZD-I1R', price: '¥39.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-EL-003-B', spec: '双向', model: 'M-BLZD-I1B', price: '¥46.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' },
        { code: 'SKU-EL-003-F', spec: '楼层显示', model: 'M-BLZD-I1F', price: '¥55.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' },
        { code: 'SKU-EL-003-V', spec: '可变方向', model: 'M-BLJC-I1V', price: '¥69.00', status: 'paused', statusLabel: '临时停供', lead: '待确认' }
      ]
    },
    {
      id: 'spu-010', code: 'SPU-PJ-001', categoryName: '灭火器喷管', brand: '淮海', category: '配件 / 灭火器配件 / 灭火器喷射组件及维修替换配件', branchIds: ['pj', 'pj-extinguisher', 'pj-extinguisher-discharge'],
      skus: [
        { code: 'SKU-PJ-001-04', spec: '4kg 适用', model: 'PG-4', price: '¥8.50', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-PJ-001-08', spec: '8kg 适用', model: 'PG-8', price: '¥12.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' }
      ]
    },
    {
      id: 'spu-011', code: 'SPU-PJ-003', categoryName: '消防水带接口', brand: '沱雨', category: '配件 / 消防水带连接配件 / 水带接口与连接组件', branchIds: ['pj', 'pj-water', 'pj-water-connectors'],
      skus: [
        { code: 'SKU-PJ-003-KD', spec: 'KD65 内扣式', model: 'KD65', price: '¥22.00', status: 'stable', statusLabel: '稳定供货', lead: '3–5 天' },
        { code: 'SKU-PJ-003-KN', spec: 'KN65 卡式', model: 'KN65', price: '¥29.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' },
        { code: 'SKU-PJ-003-KJ', spec: 'KJ65 快速式', model: 'KJ65', price: '¥38.00', status: 'normal', statusLabel: '正常供货', lead: '5–7 天' }
      ]
    }
  ];

  let contacts = [
    { name: '张经理', info: '138 **** 2608' },
    { name: '刘会计', info: '025-**** 1630' },
    { name: '仓储部', info: '025-**** 1725' }
  ];

  const $ = (id) => document.getElementById(id);
  const categoryButtons = [...document.querySelectorAll('[data-category-filter]')];
  const treeToggleButtons = [...document.querySelectorAll('[data-tree-toggle]')];
  const catalogGroups = $('sd-catalog-groups');
  const catalogColumns = document.querySelector('.sd-sku-columns');
  const goodsEmpty = $('sd-goods-empty');
  const goodsSearch = $('sd-goods-search');
  const categoryPanel = document.querySelector('.sd-category-panel');
  const categoryMobileToggle = $('sd-category-mobile-toggle');
  const expandAllButton = $('sd-expand-all');
  const basicDialog = $('sd-basic-dialog');
  const contactDialog = $('sd-contact-dialog');
  const basicForm = $('sd-basic-form');
  const contactForm = $('sd-contact-form');
  const contactEditor = $('sd-contact-editor');
  const contactList = $('sd-contact-list');
  const toast = $('sd-toast');
  const openers = new WeakMap();
  let selectedCategory = 'all';
  let groupsExpanded = true;
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

  function skuCount(items) {
    return items.reduce((total, item) => total + item.skus.length, 0);
  }

  function updateCategoryCounts() {
    document.querySelectorAll('[data-category-count]').forEach((element) => {
      element.textContent = String(skuCount(categoryGoods(element.dataset.categoryCount)));
    });
  }

  function skuRowMarkup(product, sku) {
    const statusClass = sku.status === 'stable' ? '' : ` is-${sku.status}`;
    return `
      <article class="sd-sku-row" data-sku-code="${escapeHtml(sku.code)}">
        <div class="sd-sku-cell sd-sku-identity">
          <span class="sd-sku-mark" aria-hidden="true">${icon('box')}</span>
          <strong><span>${escapeHtml(product.brand)}${escapeHtml(product.categoryName)}</span> <em>${escapeHtml(sku.spec)}</em></strong>
        </div>
        <div class="sd-sku-cell sd-sku-code-cell" data-label="SKU 编码 / 型号"><span class="sd-code">${escapeHtml(sku.code)}</span><small>${escapeHtml(sku.model)}</small></div>
        <div class="sd-sku-cell sd-price-cell" data-label="采购价"><strong>${escapeHtml(sku.price)}</strong><small>含税参考价</small></div>
        <div class="sd-sku-cell sd-supply-cell" data-label="供货情况"><span class="sd-supply-status${statusClass}">${escapeHtml(sku.statusLabel)}</span><small>${escapeHtml(sku.lead)}</small></div>
      </article>`;
  }

  function groupMarkup(product, skus) {
    const panelId = `sd-sku-list-${product.id}`;
    return `
      <section class="sd-spu-group" data-spu-id="${escapeHtml(product.id)}">
        <button class="sd-spu-group-toggle" type="button" data-spu-toggle aria-expanded="${String(groupsExpanded)}" aria-controls="${panelId}">
          <span class="sd-group-chevron" aria-hidden="true">${icon('chevron')}</span>
          <span class="sd-spu-mark" aria-hidden="true">${icon('box')}</span>
          <span class="sd-spu-copy">
            <span class="sd-spu-title"><strong>${escapeHtml(product.brand)}<span aria-hidden="true"> · </span>${escapeHtml(product.categoryName)}</strong><em>${skus.length} 个具体规格</em></span>
            <span class="sd-spu-meta"><span title="${escapeHtml(product.category)}">${escapeHtml(product.category)}</span><span aria-hidden="true">·</span><span class="sd-code">${escapeHtml(product.code)}</span></span>
          </span>
        </button>
        <div class="sd-sku-list" id="${panelId}"${groupsExpanded ? '' : ' hidden'}>${skus.map((sku) => skuRowMarkup(product, sku)).join('')}</div>
      </section>`;
  }

  function renderGoods() {
    const query = goodsSearch.value.trim().toLocaleLowerCase('zh-CN');
    const matches = categoryGoods(selectedCategory).map((product) => {
      const productText = [product.brand, product.categoryName, product.code, product.category].join(' ').toLocaleLowerCase('zh-CN');
      const productMatched = query && productText.includes(query);
      const skus = product.skus.filter((sku) => {
        const skuText = [sku.spec, sku.model, sku.code, sku.price, sku.statusLabel].join(' ').toLocaleLowerCase('zh-CN');
        return !query || productMatched || skuText.includes(query);
      });
      return { product, skus };
    }).filter((entry) => entry.skus.length);
    const totalSkus = matches.reduce((total, entry) => total + entry.skus.length, 0);

    $('sd-goods-count').textContent = String(matches.length);
    $('sd-sku-count').textContent = String(totalSkus);
    $('sd-result-summary').textContent = `${matches.length} 个产品系列 · ${totalSkus} 种具体货物`;
    catalogGroups.innerHTML = matches.map((entry) => groupMarkup(entry.product, entry.skus)).join('');

    const hasMatches = matches.length > 0;
    catalogColumns.hidden = !hasMatches;
    catalogGroups.hidden = !hasMatches;
    expandAllButton.hidden = !hasMatches;
    goodsEmpty.hidden = hasMatches;
    syncExpandAllButton();
  }

  function selectCategory(categoryId) {
    selectedCategory = categories[categoryId] ? categoryId : 'all';
    groupsExpanded = true;
    categoryButtons.forEach((button) => {
      const selected = button.dataset.categoryFilter === selectedCategory;
      button.classList.toggle('is-active', selected);
      if (selected) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    $('sd-active-category').textContent = categories[selectedCategory].path;
    $('sd-mobile-category-name').textContent = categories[selectedCategory].name;
    if (window.matchMedia('(max-width: 900px)').matches) {
      categoryPanel.classList.remove('is-open');
      categoryMobileToggle.setAttribute('aria-expanded', 'false');
    }
    renderGoods();
  }

  function syncExpandAllButton() {
    expandAllButton.classList.toggle('is-collapsed', !groupsExpanded);
    expandAllButton.querySelector('span').textContent = groupsExpanded ? '收起全部' : '展开全部';
  }

  function setAllGroups(expanded) {
    groupsExpanded = expanded;
    catalogGroups.querySelectorAll('[data-spu-toggle]').forEach((button) => button.setAttribute('aria-expanded', String(expanded)));
    catalogGroups.querySelectorAll('.sd-sku-list').forEach((list) => { list.hidden = !expanded; });
    syncExpandAllButton();
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

  categoryButtons.forEach((button) => button.addEventListener('click', () => selectCategory(button.dataset.categoryFilter)));
  treeToggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const children = $(button.dataset.treeToggle);
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const label = button.parentElement.querySelector('[data-category-filter] .sd-tree-label')?.textContent || '类目';
      button.setAttribute('aria-expanded', String(!expanded));
      button.setAttribute('aria-label', `${expanded ? '展开' : '收起'}${label}`);
      children.hidden = expanded;
    });
  });
  categoryMobileToggle.addEventListener('click', () => {
    const open = categoryPanel.classList.toggle('is-open');
    categoryMobileToggle.setAttribute('aria-expanded', String(open));
  });
  expandAllButton.addEventListener('click', () => setAllGroups(!groupsExpanded));
  catalogGroups.addEventListener('click', (event) => {
    const button = event.target.closest('[data-spu-toggle]');
    if (!button) return;
    const expanded = button.getAttribute('aria-expanded') === 'true';
    const list = $(button.getAttribute('aria-controls'));
    button.setAttribute('aria-expanded', String(!expanded));
    list.hidden = expanded;
    const groupButtons = [...catalogGroups.querySelectorAll('[data-spu-toggle]')];
    groupsExpanded = groupButtons.every((groupButton) => groupButton.getAttribute('aria-expanded') === 'true');
    syncExpandAllButton();
  });
  goodsSearch.addEventListener('input', () => {
    groupsExpanded = true;
    renderGoods();
  });

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
