/* 供应商管理纯前端展示：演示筛选、分页和资料编辑，不读写真实业务数据。 */
(function () {
  'use strict';

  const sourceTypes = {
    regional_agent: { label: '区域代理', icon: 'supplier-agent' },
    manufacturer: { label: '厂家直供', icon: 'supplier-factory' },
    online_store: { label: '线上店铺', icon: 'supplier-store' },
    other: { label: '其他', icon: 'supplier-more' }
  };

  const priorityTypes = {
    preferred: { label: '优先', className: 'is-preferred' },
    normal: { label: '普通', className: 'is-normal' },
    backup: { label: '备选', className: 'is-backup' }
  };

  const suppliers = [
    {
      id: 'supplier-001', code: 'SUP-001', name: '宁城消防商行', sourceType: 'regional_agent', priority: 'preferred',
      contacts: [{ name: '张经理', info: '138 **** 2608' }, { name: '刘会计', info: '025-**** 1630' }, { name: '仓储部', info: '025-**** 1725' }],
      region: '江苏·南京', platform: '', shopUrl: '', remark: '常用灭火器与水带采购对象。', enabled: true
    },
    {
      id: 'supplier-002', code: 'SUP-002', name: '华源消防器材厂', sourceType: 'manufacturer', priority: 'preferred',
      contacts: [{ name: '李经理', info: '139 **** 7026' }, { name: '售后部', info: '0516-**** 6075' }],
      region: '江苏·徐州', platform: '', shopUrl: '', remark: '', enabled: true
    },
    {
      id: 'supplier-003', code: 'SUP-003', name: '安备消防用品店', sourceType: 'online_store', priority: 'normal',
      contacts: [{ name: '平台客服', info: '通过店铺客服联系' }],
      region: '浙江·杭州', platform: '1688', shopUrl: 'https://example.com/store/003', remark: '', enabled: true
    },
    {
      id: 'supplier-004', code: 'SUP-004', name: '江南消防设备公司', sourceType: 'regional_agent', priority: 'normal',
      contacts: [{ name: '赵经理', info: '微信：jiangnan_demo' }],
      region: '江苏·苏州', platform: '', shopUrl: '', remark: '', enabled: true
    },
    {
      id: 'supplier-005', code: 'SUP-005', name: '光安应急照明厂', sourceType: 'manufacturer', priority: 'preferred',
      contacts: [{ name: '钱经理', info: '137 **** 6112' }, { name: '仓储部', info: '0760-**** 9012' }],
      region: '广东·中山', platform: '', shopUrl: '', remark: '应急照明类常用采购对象。', enabled: true
    },
    {
      id: 'supplier-006', code: 'SUP-006', name: '优安劳保店', sourceType: 'online_store', priority: 'backup',
      contacts: [{ name: '', info: '通过店铺客服联系' }],
      region: '浙江·宁波', platform: '淘宝', shopUrl: 'https://example.com/store/006', remark: '', enabled: true
    },
    {
      id: 'supplier-007', code: 'SUP-007', name: '城北器材经营部', sourceType: 'other', priority: 'normal',
      contacts: [{ name: '吴经理', info: '136 **** 0806' }],
      region: '安徽·合肥', platform: '', shopUrl: '', remark: '', enabled: true
    },
    {
      id: 'supplier-008', code: 'SUP-008', name: '华南消防商行', sourceType: 'regional_agent', priority: 'backup',
      contacts: [{ name: '周经理', info: '138 **** 1540' }],
      region: '广东·广州', platform: '', shopUrl: '', remark: '暂停新增采购。', enabled: false
    }
  ];

  const table = document.querySelector('.supplier-table');
  const tableBody = document.getElementById('supplier-table-body');
  const emptyState = document.getElementById('supplier-empty');
  const emptyTitle = document.getElementById('supplier-empty-title');
  const emptyCopy = document.getElementById('supplier-empty-copy');
  const emptyAction = document.getElementById('supplier-empty-action');
  const keywordInput = document.getElementById('supplier-keyword');
  const sourceFilter = document.getElementById('supplier-source-filter');
  const clearFiltersButton = document.getElementById('supplier-clear-filters');
  const statusButtons = [...document.querySelectorAll('.supplier-filter-button[data-status]')];
  const visibleCount = document.getElementById('supplier-visible-count');
  const allCount = document.getElementById('supplier-all-count');
  const activeCount = document.getElementById('supplier-active-count');
  const inactiveCount = document.getElementById('supplier-inactive-count');
  const pageSummary = document.getElementById('supplier-page-summary');
  const pageControls = document.getElementById('supplier-page-controls');

  const editor = document.getElementById('supplier-editor');
  const form = document.getElementById('supplier-form');
  const createButton = document.getElementById('supplier-create');
  const editorTitle = document.getElementById('supplier-editor-title');
  const nameInput = document.getElementById('supplier-name-input');
  const codeInput = document.getElementById('supplier-code-input');
  const sourceInput = document.getElementById('supplier-source-input');
  const priorityInput = document.getElementById('supplier-priority-input');
  const contactEditor = document.getElementById('supplier-contact-editor');
  const addContactButton = document.getElementById('supplier-add-contact');
  const regionInput = document.getElementById('supplier-region-input');
  const platformInput = document.getElementById('supplier-platform-input');
  const urlInput = document.getElementById('supplier-url-input');
  const onlineFields = document.getElementById('supplier-online-fields');
  const remarkInput = document.getElementById('supplier-remark-input');
  const remarkCount = document.getElementById('supplier-remark-count');
  const enabledInput = document.getElementById('supplier-enabled-input');
  const toast = document.getElementById('supplier-toast');

  const PAGE_SIZE = 8;
  let activeStatus = 'all';
  let currentPage = 1;
  let editingId = '';
  let editorOpener = null;
  let toastTimer = 0;

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function sourceMarkup(sourceType, platform) {
    const source = sourceTypes[sourceType] || sourceTypes.other;
    const platformLine = sourceType === 'online_store' && platform
      ? `<small>${escapeHtml(platform)}</small>`
      : '';
    return `
      <span class="supplier-source-info">
        <svg class="supplier-icon" aria-hidden="true"><use href="#${source.icon}"/></svg>
        <span class="supplier-source-copy"><strong>${source.label}</strong>${platformLine}</span>
      </span>`;
  }

  function contactMarkup(supplier) {
    const contacts = (supplier.contacts || []).filter((contact) => contact.name || contact.info);
    if (!contacts.length) return '<span class="supplier-empty-value">未填写</span>';
    const shownContacts = contacts.slice(0, 2).map((contact) => {
      const name = contact.name ? `<strong class="supplier-contact-card-name">${escapeHtml(contact.name)}</strong>` : '';
      const info = contact.info ? `<span class="supplier-contact-card-info">${escapeHtml(contact.info)}</span>` : '';
      return `<li class="supplier-contact-card${contact.name ? '' : ' is-contact-only'}">${name}${info}</li>`;
    }).join('');
    const remainingContacts = contacts.slice(2);
    const remainingSummary = remainingContacts
      .map((contact) => [contact.name, contact.info].filter(Boolean).join(' · '))
      .join('；');
    const overflow = remainingContacts.length
      ? `<span class="supplier-contact-overflow" title="${escapeHtml(remainingSummary)}">+${remainingContacts.length}<span>人</span><span class="visually-hidden">，其他联系人：${escapeHtml(remainingSummary)}</span></span>`
      : '';
    return `
      <ul class="supplier-contact-cards${contacts.length === 1 ? ' is-single' : ''}" aria-label="已展示 ${Math.min(contacts.length, 2)} 位联系人，共 ${contacts.length} 位">
        ${shownContacts}
      </ul>
      ${overflow}`;
  }

  function rowMarkup(supplier) {
    const source = sourceTypes[supplier.sourceType] || sourceTypes.other;
    const priority = priorityTypes[supplier.priority] || priorityTypes.normal;
    return `
      <tr class="${supplier.enabled ? '' : 'is-disabled'}" data-supplier-id="${supplier.id}">
        <th class="supplier-identity" scope="row">
          <a class="supplier-name" href="supplier-detail.html?id=${escapeHtml(supplier.id)}" aria-label="查看${escapeHtml(supplier.name)}详情">${escapeHtml(supplier.name)}</a>
          <span class="supplier-meta">
            <span class="supplier-code">${escapeHtml(supplier.code)}</span>
            ${supplier.region ? `<span class="supplier-meta-separator" aria-hidden="true"></span><span class="supplier-region">${escapeHtml(supplier.region)}</span>` : ''}
          </span>
        </th>
        <td class="supplier-status-cell" data-label="状态">
          <span class="supplier-status ${supplier.enabled ? '' : 'is-inactive'}"><span aria-hidden="true"></span>${supplier.enabled ? '启用' : '已停用'}</span>
        </td>
        <td class="supplier-priority-cell" data-label="优先级">
          <span class="supplier-priority ${priority.className}"><span aria-hidden="true"></span>${priority.label}</span>
        </td>
        <td class="supplier-source-cell" data-label="主要来源" aria-label="主要来源：${source.label}${supplier.sourceType === 'online_store' && supplier.platform ? `，采购平台：${escapeHtml(supplier.platform)}` : ''}">${sourceMarkup(supplier.sourceType, supplier.platform)}</td>
        <td class="supplier-contact-cell" data-label="联系人"><div class="supplier-contact-copy">${contactMarkup(supplier)}</div></td>
        <td class="supplier-action-cell" data-label="操作">
          <button class="supplier-edit-button" type="button" data-edit-supplier="${supplier.id}" aria-label="编辑${escapeHtml(supplier.name)}">编辑</button>
        </td>
      </tr>`;
  }

  function currentFiltersAreDefault() {
    return !keywordInput.value.trim() && sourceFilter.value === 'all' && activeStatus === 'all';
  }

  function filteredSuppliers() {
    const keyword = keywordInput.value.trim().toLocaleLowerCase('zh-CN');
    return suppliers.filter((supplier) => {
      const statusMatches = activeStatus === 'all' || (activeStatus === 'active' ? supplier.enabled : !supplier.enabled);
      const sourceMatches = sourceFilter.value === 'all' || supplier.sourceType === sourceFilter.value;
      const searchableContacts = (supplier.contacts || []).flatMap((contact) => [contact.name, contact.info]);
      const searchable = [supplier.name, supplier.code, ...searchableContacts].join(' ').toLocaleLowerCase('zh-CN');
      const keywordMatches = !keyword || searchable.includes(keyword);
      return statusMatches && sourceMatches && keywordMatches;
    });
  }

  function pageButtonMarkup(page, current) {
    return `<button class="supplier-page-button${current ? ' is-current' : ''}" type="button" data-page="${page}"${current ? ' aria-current="page"' : ''}>${page}</button>`;
  }

  function renderPagination(total) {
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    currentPage = Math.min(currentPage, pageCount);
    const start = total ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const end = Math.min(currentPage * PAGE_SIZE, total);
    pageSummary.textContent = total ? `第 ${start}–${end} 条，共 ${total} 条` : '没有符合条件的供应商';

    const pages = [];
    for (let page = 1; page <= pageCount; page += 1) pages.push(pageButtonMarkup(page, page === currentPage));
    pageControls.innerHTML = `
      <button class="supplier-page-button" type="button" data-page="${currentPage - 1}" aria-label="上一页"${currentPage === 1 ? ' disabled' : ''}><svg class="supplier-icon" aria-hidden="true"><use href="#supplier-left"/></svg></button>
      ${pages.join('')}
      <button class="supplier-page-button" type="button" data-page="${currentPage + 1}" aria-label="下一页"${currentPage === pageCount || !total ? ' disabled' : ''}><svg class="supplier-icon" aria-hidden="true"><use href="#supplier-right"/></svg></button>`;
  }

  function renderList() {
    const matches = filteredSuppliers();
    const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, pageCount);
    const pageItems = matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    tableBody.innerHTML = pageItems.map(rowMarkup).join('');
    table.hidden = matches.length === 0;
    emptyState.hidden = matches.length > 0;
    visibleCount.textContent = String(matches.length);
    clearFiltersButton.hidden = currentFiltersAreDefault();

    allCount.textContent = String(suppliers.length);
    activeCount.textContent = String(suppliers.filter((supplier) => supplier.enabled).length);
    inactiveCount.textContent = String(suppliers.filter((supplier) => !supplier.enabled).length);

    if (!matches.length) {
      const allEmpty = suppliers.length === 0;
      emptyTitle.textContent = allEmpty ? '还没有供应商' : '没有找到符合条件的供应商';
      emptyCopy.textContent = allEmpty ? '添加常用采购对象，方便进货时选择。' : '调整搜索内容或清空筛选后再试。';
      emptyAction.textContent = allEmpty ? '新建供应商' : '清空筛选';
    }

    renderPagination(matches.length);
  }

  function resetFilters() {
    keywordInput.value = '';
    sourceFilter.value = 'all';
    activeStatus = 'all';
    currentPage = 1;
    statusButtons.forEach((button) => {
      const active = button.dataset.status === 'all';
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderList();
  }

  function clearFieldError(fieldId, errorId) {
    document.getElementById(fieldId).classList.remove('has-error');
    const error = document.getElementById(errorId);
    error.textContent = '';
    error.hidden = true;
  }

  function showFieldError(fieldId, errorId, message, input) {
    document.getElementById(fieldId).classList.add('has-error');
    const error = document.getElementById(errorId);
    error.textContent = message;
    error.hidden = false;
    input.focus();
  }

  function clearErrors() {
    clearFieldError('supplier-name-field', 'supplier-name-error');
    clearFieldError('supplier-source-field', 'supplier-source-error');
    clearFieldError('supplier-url-field', 'supplier-url-error');
  }

  function updateRemarkCount() {
    remarkCount.textContent = String(remarkInput.value.length);
  }

  function contactRowMarkup(contact, index, total) {
    return `
      <div class="supplier-contact-editor-row" data-contact-row>
        <input data-contact-name maxlength="40" value="${escapeHtml(contact.name || '')}" placeholder="例如：张经理" aria-label="第 ${index + 1} 位联系人姓名" autocomplete="off">
        <input data-contact-info maxlength="100" value="${escapeHtml(contact.info || '')}" placeholder="电话、微信或平台客服" aria-label="第 ${index + 1} 位联系人联系方式" autocomplete="off">
        <button class="supplier-remove-contact" type="button" data-remove-contact="${index}" aria-label="移除第 ${index + 1} 位联系人"${total === 1 ? ' disabled' : ''}>
          <svg class="supplier-icon" aria-hidden="true"><use href="#supplier-trash"/></svg>
        </button>
      </div>`;
  }

  function contactValues() {
    return [...contactEditor.querySelectorAll('[data-contact-row]')]
      .map((row) => ({
        name: row.querySelector('[data-contact-name]').value.trim(),
        info: row.querySelector('[data-contact-info]').value.trim()
      }));
  }

  function renderContactEditor(contacts) {
    const rows = contacts && contacts.length ? contacts : [{ name: '', info: '' }];
    contactEditor.innerHTML = rows.map((contact, index) => contactRowMarkup(contact, index, rows.length)).join('');
  }

  function updateSourceFields() {
    const showOnlineFields = sourceInput.value === 'online_store';
    onlineFields.hidden = !showOnlineFields;
    if (!showOnlineFields) clearFieldError('supplier-url-field', 'supplier-url-error');
  }

  function populateForm(supplier) {
    nameInput.value = supplier.name;
    codeInput.value = supplier.code;
    sourceInput.value = supplier.sourceType;
    priorityInput.value = supplier.priority || 'normal';
    renderContactEditor(supplier.contacts);
    regionInput.value = supplier.region;
    platformInput.value = supplier.platform;
    urlInput.value = supplier.shopUrl;
    remarkInput.value = supplier.remark;
    enabledInput.checked = supplier.enabled;
    updateSourceFields();
  }

  function resetForm() {
    form.reset();
    codeInput.value = '保存后自动生成';
    priorityInput.value = 'normal';
    enabledInput.checked = true;
    renderContactEditor([{ name: '', info: '' }]);
    updateSourceFields();
  }

  function openEditor(mode, supplierId, opener) {
    editingId = mode === 'edit' ? supplierId : '';
    editorOpener = opener || document.activeElement;
    clearErrors();
    const supplier = suppliers.find((item) => item.id === supplierId);
    if (mode === 'edit' && supplier) {
      editorTitle.textContent = '编辑供应商';
      populateForm(supplier);
    } else {
      editorTitle.textContent = '新建供应商';
      resetForm();
    }

    updateRemarkCount();
    editor.showModal();
    document.body.classList.add('supplier-dialog-open');
    window.requestAnimationFrame(() => nameInput.focus());
  }

  function closeEditor() {
    if (editor.open) editor.close();
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.querySelector('span').textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2400);
  }

  function formValue() {
    const isOnlineStore = sourceInput.value === 'online_store';
    return {
      name: nameInput.value.trim(),
      sourceType: sourceInput.value,
      priority: priorityInput.value || 'normal',
      contacts: contactValues().filter((contact) => contact.name || contact.info),
      region: regionInput.value.trim(),
      platform: isOnlineStore ? platformInput.value.trim() : '',
      shopUrl: isOnlineStore ? urlInput.value.trim() : '',
      remark: remarkInput.value.trim(),
      enabled: enabledInput.checked
    };
  }

  function validateForm(value) {
    clearErrors();
    if (!value.name) {
      showFieldError('supplier-name-field', 'supplier-name-error', '请输入供应商名称', nameInput);
      return false;
    }
    const duplicate = suppliers.some((supplier) => supplier.id !== editingId && supplier.name.toLocaleLowerCase('zh-CN') === value.name.toLocaleLowerCase('zh-CN'));
    if (duplicate) {
      showFieldError('supplier-name-field', 'supplier-name-error', '已有同名供应商，请确认是否为同一对象', nameInput);
      return false;
    }
    if (!value.sourceType) {
      showFieldError('supplier-source-field', 'supplier-source-error', '请选择主要来源', sourceInput);
      return false;
    }
    if (value.shopUrl && !/^https?:\/\/\S+$/i.test(value.shopUrl)) {
      showFieldError('supplier-url-field', 'supplier-url-error', '请输入完整的 http:// 或 https:// 店铺链接', urlInput);
      return false;
    }
    return true;
  }

  keywordInput.addEventListener('input', () => { currentPage = 1; renderList(); });
  sourceFilter.addEventListener('change', () => { currentPage = 1; renderList(); });
  clearFiltersButton.addEventListener('click', resetFilters);
  emptyAction.addEventListener('click', () => {
    if (suppliers.length) resetFilters();
    else openEditor('create', '', emptyAction);
  });

  statusButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeStatus = button.dataset.status;
      currentPage = 1;
      statusButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderList();
    });
  });

  pageControls.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button || button.disabled) return;
    currentPage = Number(button.dataset.page);
    renderList();
    document.getElementById('supplier-results').scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  });

  tableBody.addEventListener('click', (event) => {
    const button = event.target.closest('[data-edit-supplier]');
    if (!button) return;
    openEditor('edit', button.dataset.editSupplier, button);
  });

  createButton.addEventListener('click', () => openEditor('create', '', createButton));
  document.querySelectorAll('[data-close-editor]').forEach((button) => button.addEventListener('click', closeEditor));
  nameInput.addEventListener('input', () => clearFieldError('supplier-name-field', 'supplier-name-error'));
  sourceInput.addEventListener('change', () => {
    clearFieldError('supplier-source-field', 'supplier-source-error');
    updateSourceFields();
  });
  urlInput.addEventListener('input', () => clearFieldError('supplier-url-field', 'supplier-url-error'));
  remarkInput.addEventListener('input', updateRemarkCount);
  addContactButton.addEventListener('click', () => {
    const contacts = contactValues();
    contacts.push({ name: '', info: '' });
    renderContactEditor(contacts);
    contactEditor.querySelector('[data-contact-row]:last-child [data-contact-name]').focus();
  });

  contactEditor.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-contact]');
    if (!button || button.disabled) return;
    const contacts = contactValues();
    contacts.splice(Number(button.dataset.removeContact), 1);
    renderContactEditor(contacts);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = formValue();
    if (!validateForm(value)) return;

    if (editingId) {
      const supplier = suppliers.find((item) => item.id === editingId);
      if (supplier) Object.assign(supplier, value);
      closeEditor();
      renderList();
      showToast('供应商已保存');
      return;
    }

    const sequence = suppliers.reduce((largest, supplier) => Math.max(largest, Number(supplier.code.replace(/\D/g, '')) || 0), 0) + 1;
    const code = `SUP-${String(sequence).padStart(3, '0')}`;
    suppliers.push({ id: `supplier-${String(sequence).padStart(3, '0')}`, code, ...value });
    closeEditor();
    resetFilters();
    currentPage = Math.ceil(suppliers.length / PAGE_SIZE);
    renderList();
    showToast('供应商已创建');
  });

  editor.addEventListener('click', (event) => {
    if (event.target === editor) closeEditor();
  });

  editor.addEventListener('close', () => {
    document.body.classList.remove('supplier-dialog-open');
    if (editorOpener && document.contains(editorOpener)) editorOpener.focus();
  });

  renderList();
}());
