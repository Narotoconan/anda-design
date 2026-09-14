/* 品牌管理纯前端弹窗演示，不读写真实业务数据。 */
(function () {
  'use strict';

  const editor = document.getElementById('brand-editor');
  const form = document.getElementById('brand-form');
  const createButton = document.getElementById('brand-create');
  const title = document.getElementById('brand-editor-title');
  const nameInput = document.getElementById('brand-name-input');
  const codeInput = document.getElementById('brand-code-input');
  const remarkInput = document.getElementById('brand-remark-input');
  const remarkCount = document.getElementById('brand-remark-count');
  const enabledInput = document.getElementById('brand-enabled-input');
  const nameError = document.getElementById('brand-name-error');
  const deleteArea = document.getElementById('brand-delete-area');
  const deleteButton = document.getElementById('brand-delete');
  const deleteHelp = document.getElementById('brand-delete-help');
  const confirmDialog = document.getElementById('brand-delete-confirm');
  const confirmCopy = document.getElementById('brand-delete-copy');
  const confirmDelete = document.getElementById('brand-confirm-delete');
  const toast = document.getElementById('brand-toast');

  let currentRow = null;
  let editorOpener = null;
  let toastTimer = 0;

  function clearError() {
    nameInput.closest('.brand-form-field').classList.remove('has-error');
    nameError.hidden = true;
    nameError.textContent = '';
  }

  function showError(message) {
    nameInput.closest('.brand-form-field').classList.add('has-error');
    nameError.textContent = message;
    nameError.hidden = false;
    nameInput.focus();
  }

  function updateRemarkCount() {
    remarkCount.textContent = String(remarkInput.value.length);
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.querySelector('span').textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2400);
  }

  function openEditor(mode, row, opener) {
    currentRow = row || null;
    editorOpener = opener || document.activeElement;
    clearError();

    if (mode === 'edit' && row) {
      const spuCount = Number(row.dataset.brandSpu || 0);
      title.textContent = '编辑品牌';
      nameInput.value = row.dataset.brandName || '';
      codeInput.value = row.dataset.brandCode || '';
      remarkInput.value = row.dataset.brandRemark || '';
      enabledInput.checked = row.dataset.brandEnabled === 'true';
      deleteArea.hidden = false;
      deleteButton.disabled = spuCount > 0;
      deleteHelp.textContent = spuCount > 0 ? '已有 SPU 引用，可停用，不能删除。' : '当前品牌没有关联 SPU。';
    } else {
      title.textContent = '新建品牌';
      form.reset();
      codeInput.value = '保存后自动生成';
      enabledInput.checked = true;
      deleteArea.hidden = true;
      deleteButton.disabled = false;
      deleteHelp.textContent = '';
    }

    updateRemarkCount();
    editor.showModal();
    document.body.classList.add('brand-dialog-open');
    window.requestAnimationFrame(() => nameInput.focus());
  }

  function closeEditor() {
    if (editor.open) editor.close();
  }

  createButton.addEventListener('click', () => openEditor('create', null, createButton));

  document.querySelectorAll('.brand-edit-button').forEach((button) => {
    button.addEventListener('click', () => openEditor('edit', button.closest('tr'), button));
  });

  document.querySelectorAll('[data-close-editor]').forEach((button) => {
    button.addEventListener('click', closeEditor);
  });

  nameInput.addEventListener('input', clearError);
  remarkInput.addEventListener('input', updateRemarkCount);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = nameInput.value.trim();
    if (!value) {
      showError('请输入品牌名称');
      return;
    }

    const duplicate = [...document.querySelectorAll('[data-brand-name]')].some((row) => {
      return row !== currentRow && (row.dataset.brandName || '').trim().toLocaleLowerCase('zh-CN') === value.toLocaleLowerCase('zh-CN');
    });
    if (duplicate) {
      showError('该品牌已存在，请使用已有品牌');
      return;
    }

    closeEditor();
    showToast(currentRow ? '品牌已保存' : '品牌已创建');
  });

  deleteButton.addEventListener('click', () => {
    if (!currentRow || deleteButton.disabled) return;
    confirmCopy.textContent = `删除品牌“${currentRow.dataset.brandName}”后不可恢复。`;
    confirmDialog.showModal();
  });

  document.querySelectorAll('[data-close-confirm]').forEach((button) => {
    button.addEventListener('click', () => confirmDialog.close());
  });

  confirmDelete.addEventListener('click', () => {
    confirmDialog.close();
    closeEditor();
    showToast('品牌已删除');
  });

  editor.addEventListener('close', () => {
    document.body.classList.remove('brand-dialog-open');
    if (editorOpener && document.contains(editorOpener)) editorOpener.focus();
  });
}());
