/* 纯前端类目树演示：数据仅保留在当前页面，不读写真实业务数据。 */
(function () {
  'use strict';

  const nodes = [
    { id: 'fe', parentId: null, kind: 'branch', name: '灭火器材', code: 'FE', order: 10, enabled: true },
    { id: 'fe-dry', parentId: 'fe', kind: 'product', name: '手提式干粉灭火器', code: 'FE-001', unit: '具', spu: 14, order: 10, enabled: true, defaultSku: { dimensions: [{ id: 'dim-capacity', name: '容量', values: [{ id: 'val-4kg', label: '4kg' }, { id: 'val-8kg', label: '8kg' }] }] } },
    { id: 'fe-co2', parentId: 'fe', kind: 'product', name: '手提式二氧化碳灭火器', code: 'FE-003', unit: '具', spu: 6, order: 20, enabled: true },
    { id: 'fe-cart', parentId: 'fe', kind: 'product', name: '推车式干粉灭火器', code: 'FE-002', unit: '台', spu: 5, order: 30, enabled: true },
    { id: 'hd', parentId: null, kind: 'branch', name: '消防水带', code: 'HD', order: 20, enabled: true },
    { id: 'hd-lined', parentId: 'hd', kind: 'product', name: '有衬里消防水带', code: 'HD-001', unit: '盘', spu: 9, order: 10, enabled: true },
    { id: 'hd-unlined', parentId: 'hd', kind: 'product', name: '无衬里消防水带', code: 'HD-002', unit: '盘', spu: 0, order: 20, enabled: false },
    { id: 'el', parentId: null, kind: 'branch', name: '应急照明', code: 'EL', order: 30, enabled: true },
    { id: 'el-light', parentId: 'el', kind: 'product', name: '消防应急照明灯', code: 'EL-001', unit: '台', spu: 6, order: 10, enabled: true },
    { id: 'el-sign', parentId: 'el', kind: 'branch', name: '疏散指示灯', code: 'EL-SIGN', order: 20, enabled: true },
    { id: 'el-exit', parentId: 'el-sign', kind: 'product', name: '安全出口标志灯', code: 'EL-002', unit: '台', spu: 4, order: 10, enabled: true },
    { id: 'el-direction', parentId: 'el-sign', kind: 'product', name: '疏散方向标志灯', code: 'EL-003', unit: '台', spu: 3, order: 20, enabled: true },
    { id: 'pj', parentId: null, kind: 'branch', name: '配件', code: 'PJ', order: 40, enabled: true },
    { id: 'pj-extinguisher', parentId: 'pj', kind: 'branch', name: '灭火器配件', code: 'PJ-FE', order: 10, enabled: true },
    { id: 'pj-hose', parentId: 'pj-extinguisher', kind: 'product', name: '灭火器喷管', code: 'PJ-001', unit: '根', spu: 4, order: 10, enabled: true },
    { id: 'pj-gauge', parentId: 'pj-extinguisher', kind: 'product', name: '灭火器压力表', code: 'PJ-002', unit: '只', spu: 3, order: 20, enabled: true },
    { id: 'pj-water', parentId: 'pj', kind: 'branch', name: '水带配件', code: 'PJ-HD', order: 20, enabled: true },
    { id: 'pj-coupling', parentId: 'pj-water', kind: 'product', name: '消防水带接口', code: 'PJ-003', unit: '个', spu: 3, order: 10, enabled: true },
    { id: 'pj-nozzle', parentId: 'pj-water', kind: 'product', name: '消防水枪', code: 'PJ-004', unit: '只', spu: 2, order: 20, enabled: true }
  ];

  const $ = (id) => document.getElementById(id);
  const body = $('ct-tree-body');
  const table = body.closest('table');
  const search = $('ct-search');
  const filter = $('ct-kind-filter');
  const detail = $('ct-detail');
  const editor = $('ct-editor');
  const confirmDialog = $('ct-confirm');
  const form = $('ct-form');
  const expanded = new Set(['fe', 'el', 'el-sign']);
  const openers = new WeakMap();
  let visibleRows = [];
  let focusedId = 'fe';
  let detailId = null;
  let editingId = null;
  let sequence = 20;
  let dimensionSequence = 0;
  let valueSequence = 0;
  let skuDimensionDraft = [];
  let activeSkuDimensionId = '';
  let toastTimer;

  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const icon = (name) => '<svg class="ct-icon" aria-hidden="true"><use href="#ct-' + name + '"/></svg>';
  const find = (id) => nodes.find((node) => node.id === id);
  const children = (id) => nodes.filter((node) => node.parentId === id).sort((a, b) => a.order - b.order || a.code.localeCompare(b.code));
  const isFiltering = () => Boolean(search.value.trim()) || filter.value !== 'all';

  function pathOf(node) {
    const path = [];
    for (let current = node; current; current = find(current.parentId)) path.unshift(current);
    return path;
  }

  function descendants(id) {
    return children(id).flatMap((child) => [child, ...descendants(child.id)]);
  }

  function effectiveEnabled(node) {
    return pathOf(node).every((item) => item.enabled);
  }

  function statusMarkup(node) {
    const enabled = effectiveEnabled(node);
    const label = enabled ? '启用' : node.enabled ? '上级停用' : '停用';
    return '<span class="ct-status' + (enabled ? '' : ' is-off') + '">' + label + '</span>';
  }

  function purposeMarkup(node) {
    return node.kind === 'product' ? '<span class="ct-purpose is-product">可建 SPU</span>' : '<span class="ct-purpose">仅分类</span>';
  }

  function nameMarkup(name) {
    const query = search.value.trim();
    const index = query ? name.toLowerCase().indexOf(query.toLowerCase()) : -1;
    if (index < 0) return escape(name);
    return escape(name.slice(0, index)) + '<mark class="ct-match">' + escape(name.slice(index, index + query.length)) + '</mark>' + escape(name.slice(index + query.length));
  }

  function render(announce = false) {
    const filtered = isFiltering();
    const query = search.value.trim().toLowerCase();
    const matches = new Set(nodes.filter((node) =>
      (!query || (node.name + ' ' + node.code).toLowerCase().includes(query)) &&
      (filter.value === 'all' || node.kind === 'product')
    ).map((node) => node.id));
    const included = new Set();
    if (filtered) {
      matches.forEach((id) => {
        const node = find(id);
        pathOf(node).forEach((item) => included.add(item.id));
        if (node.kind === 'branch' && filter.value === 'all') descendants(id).forEach((item) => included.add(item.id));
      });
    }

    visibleRows = [];
    function walk(parentId, ancestors = []) {
      const siblings = children(parentId).filter((node) => !filtered || included.has(node.id));
      siblings.forEach((node, index) => {
        const last = index === siblings.length - 1;
        const isOpen = filtered || expanded.has(node.id);
        visibleRows.push({ node, ancestors, last, isOpen, position: index + 1, size: siblings.length });
        if (isOpen) walk(node.id, [...ancestors, last]);
      });
    }
    walk(null);
    if (!visibleRows.some(({ node }) => node.id === focusedId)) focusedId = visibleRows[0]?.node.id;

    body.innerHTML = visibleRows.map(({ node, ancestors, last, isOpen, position, size }, index) => {
      const depth = ancestors.length;
      const branch = node.kind === 'branch';
      const count = children(node.id).length;
      // 深树保留完整数据及无障碍层级；视觉缩进最多四格，避免窄屏溢出。
      const wireLevels = ancestors.slice(1).map((isLast) => '<span class="ct-wire' + (isLast ? ' is-clear' : '') + '"></span>');
      if (depth) wireLevels.push('<span class="ct-wire is-elbow' + (last ? ' is-last' : '') + '"></span>');
      const wires = wireLevels.length ? '<span class="ct-wires" aria-hidden="true">' + wireLevels.slice(-4).join('') + '</span>' : '';
      const toggle = branch && count
        ? '<button type="button" class="ct-toggle" data-action="toggle" aria-expanded="' + isOpen + '" aria-label="' + (isOpen ? '收起' : '展开') + escape(node.name) + '"' + (filtered ? ' disabled title="筛选时自动展开所属层级"' : '') + '>' + icon('chevron') + '</button>'
        : '<span class="ct-toggle-space" aria-hidden="true"></span>';
      return '<tr role="row" data-id="' + node.id + '" class="' + (!depth ? 'ct-root ' : '') + (filtered && !matches.has(node.id) ? 'ct-is-context' : '') + '" style="--depth:' + Math.min(depth, 4) + '" aria-level="' + (depth + 1) + '" aria-posinset="' + position + '" aria-setsize="' + size + '" aria-rowindex="' + (index + 2) + '" aria-labelledby="ct-node-' + node.id + '" tabindex="' + (node.id === focusedId ? '0' : '-1') + '"' + (branch && count ? ' aria-expanded="' + isOpen + '"' : '') + '>' +
        '<td role="gridcell"><div class="ct-name-wrap">' + wires + toggle +
          '<span class="ct-node-icon is-' + node.kind + '" aria-hidden="true">' + icon(branch ? 'folder' : 'box') + '</span>' +
          '<button class="ct-node-name" type="button" data-action="detail" id="ct-node-' + node.id + '" title="' + escape(pathOf(node).map((item) => item.name).join(' / ')) + '"><span>' + nameMarkup(node.name) + '</span>' + (branch ? '<span class="ct-child-count" aria-label="' + count + ' 个直属下级">' + count + '</span>' : '') + '</button></div></td>' +
        '<td role="gridcell">' + purposeMarkup(node) + (node.kind === 'product' && node.defaultSku ? '<button type="button" class="ct-sku-shortcut" data-action="defaults" aria-label="配置' + escape(node.name) + '的默认 SKU">' + defaultSkuCombinations(node.defaultSku.dimensions).length + ' 条默认 SKU</button>' : '') + '</td>' +
        '<td role="gridcell" class="ct-numeric">' + (branch ? '<span class="ct-dash" aria-label="分类节点不直接关联 SPU">—</span>' : '<span class="ct-spu-number">' + node.spu + '</span>') + '</td>' +
        '<td role="gridcell">' + statusMarkup(node) + '</td>' +
        '<td role="gridcell"><div class="ct-row-actions">' +
          (branch ? '<button class="ct-quiet ct-add-child" type="button" data-action="add" aria-label="在' + escape(node.name) + '下添加类目">' + icon('plus') + '添加下级</button>' : '<button class="ct-quiet" type="button" data-action="detail" aria-label="查看' + escape(node.name) + '详情">详情</button>') +
          '<button class="ct-icon-button" type="button" data-action="edit" aria-label="编辑' + escape(node.name) + '" title="编辑类目">' + icon('edit') + '</button></div></td></tr>';
    }).join('');

    const products = nodes.filter((node) => node.kind === 'product').length;
    $('ct-summary').innerHTML = [children(null).length + ' 个一级类目', nodes.length + ' 个类目', products + ' 个建档类目'].map((text) => '<span>' + text + '</span>').join(' · ');
    $('ct-tree-count').textContent = '当前展示 ' + visibleRows.length + ' 项 / 共 ' + nodes.length + ' 个类目';
    table.setAttribute('aria-rowcount', visibleRows.length + 1);
    table.hidden = visibleRows.length === 0;
    $('ct-empty').hidden = visibleRows.length !== 0;
    $('ct-search-result').hidden = !filtered;
    $('ct-match-copy').textContent = '找到 ' + matches.size + ' 个匹配类目，保留所属层级';
    ['ct-expand-all', 'ct-collapse-all'].forEach((id) => {
      $(id).disabled = filtered;
      $(id).title = filtered ? '筛选时自动展开所属层级' : '';
    });
    if (announce) $('ct-announcement').textContent = filtered ? $('ct-match-copy').textContent : $('ct-tree-count').textContent;
  }

  function focusRow(id) {
    const row = [...body.rows].find((item) => item.dataset.id === id);
    if (!row) return;
    focusedId = id;
    [...body.rows].forEach((item) => {
      item.tabIndex = item === row ? 0 : -1;
      item.classList.toggle('ct-row-focused', item === row);
    });
    row.focus({ preventScroll: true });
    row.scrollIntoView({ block: 'nearest' });
  }

  function resetFilters() {
    search.value = '';
    filter.value = 'all';
    render(true);
  }

  function toast(message) {
    window.clearTimeout(toastTimer);
    $('ct-toast').querySelector('span').textContent = message;
    $('ct-toast').hidden = false;
    toastTimer = window.setTimeout(() => { $('ct-toast').hidden = true; }, 3200);
  }

  function showDialog(dialog, trigger) {
    const source = trigger || document.activeElement;
    openers.set(dialog, { element: source, id: source?.closest('tr[data-id]')?.dataset.id });
    $('ct-toast').hidden = true;
    document.body.classList.add('ct-modal-open');
    dialog.showModal();
  }

  function closeDialog(dialog, restore = true) {
    dialog.close();
    document.body.classList.toggle('ct-modal-open', Boolean(document.querySelector('.ct-dialog[open]')));
    if (!restore) return;
    const source = openers.get(dialog);
    if (source?.element?.isConnected) source.element.focus({ preventScroll: true });
    else if (source?.id && find(source.id)) focusRow(source.id);
    else $('ct-create-root').focus({ preventScroll: true });
  }

  function canDelete(node) {
    return children(node.id).length === 0 && !(node.spu > 0);
  }

  function defaultSkuDetail(node) {
    const dimensions = node.defaultSku?.dimensions || [];
    const combinations = defaultSkuCombinations(dimensions);
    return '<section class="ct-default-detail" aria-labelledby="ct-default-detail-title"><div class="ct-default-detail-heading"><h3 id="ct-default-detail-title">默认 SKU</h3><button type="button" class="ct-text-button" data-configure-default>' + icon('edit') + (combinations.length ? '编辑配置' : '设置默认 SKU') + '</button></div>' +
      (combinations.length ? '<div class="ct-default-dimension-summary">' + dimensions.map((dimension) => '<span><strong>' + escape(dimension.name) + '</strong>' + dimension.values.map((value) => escape(value.label)).join('、') + '</span>').join('') + '</div><div class="ct-default-detail-specs">' + combinations.slice(0, 4).map((specs, index) => '<span class="ct-default-sku-row"><span class="ct-sku-number">SKU ' + String(index + 1).padStart(2, '0') + '</span>' + specs.map((spec) => '<span class="ct-sku-chip"><span>' + escape(spec.name) + '</span><strong>' + escape(spec.value) + '</strong></span>').join('') + '</span>').join('') + (combinations.length > 4 ? '<small>另有 ' + (combinations.length - 4) + ' 条组合</small>' : '') + '</div><p>新建本类目 SPU 时带入 ' + combinations.length + ' 条默认 SKU，可在建档时调整；修改此配置不影响已有货物。</p>' : '<p>尚未设置。可预设常用规格，减少新建 SPU 时的重复填写。</p>') + '</section>';
  }

  function openDetail(id, trigger) {
    const node = find(id);
    if (!node) return;
    detailId = id;
    const branch = node.kind === 'branch';
    const path = pathOf(node);
    const facts = [
      ['类目编码', '<span class="ct-code">' + escape(node.code) + '</span>'],
      ['所在层级', '第 ' + path.length + ' 层'],
      branch ? ['直属下级', children(id).length + ' 个类目'] : ['默认单位', escape(node.unit)],
      branch ? ['下属建档类目', descendants(id).filter((item) => item.kind === 'product').length + ' 个'] : ['关联 SPU', node.spu + ' 个'],
      ['同级排序', node.order],
      ['类目用途', branch ? '组织下级分类' : '与品牌组成 SPU']
    ];
    $('ct-detail-body').innerHTML =
      '<div class="ct-detail-identity"><span class="ct-node-icon is-' + node.kind + '">' + icon(branch ? 'folder' : 'box') + '</span><div><h3>' + escape(node.name) + '</h3><div class="ct-detail-tags">' + purposeMarkup(node) + statusMarkup(node) + '</div></div></div>' +
      '<dl class="ct-detail-path"><dt>类目路径</dt><dd>' + path.map((item) => '<span>' + escape(item.name) + '</span>').join(icon('chevron')) + '</dd></dl>' +
      (branch ? '' : defaultSkuDetail(node)) +
      '<dl class="ct-detail-grid">' + facts.map(([label, value]) => '<div><dt>' + label + '</dt><dd>' + value + '</dd></div>').join('') + '</dl>' +
      '<div class="ct-detail-tip">' + icon('info') + '<p>' + (branch
        ? '这是用于组织货物的<strong>分类节点</strong>，可按实际需要继续添加下级。请使用下属建档类目与品牌组成 SPU。'
        : '<strong>品牌 + ' + escape(node.name) + ' = SPU</strong><br>这是可建档的末级类目，无需继续细分；建档资格与所在层数无关。') + '</p></div>';
    $('ct-delete').disabled = !canDelete(node);
    $('ct-delete-help').textContent = children(id).length ? '有下级类目，暂不可删除' : node.spu > 0 ? '已关联 SPU，可停用保留记录' : '';
    showDialog(detail, trigger);
  }

  function selectedKind() {
    return form.querySelector('input[name="kind"]:checked')?.value || 'branch';
  }

  function updatePlacement() {
    const parent = find($('ct-parent').value);
    const parentNames = parent ? pathOf(parent).map((node) => node.name) : [];
    const names = [...parentNames, $('ct-name').value.trim() || '新类目'];
    $('ct-parent-name').textContent = parent ? parentNames.join(' / ') : '无上级类目（一级类目）';
    $('ct-placement').textContent = (editingId ? '当前归属' : '新增位置') + ' · 第 ' + names.length + ' 层 · ' + names.join(' / ');
    updateSkuPreview();
    $('ct-parent-help').textContent = parent && !effectiveEnabled(parent)
      ? '该上级已停用，下属类目也暂不可用于新建 SPU。'
      : editingId
        ? '上级归属随原类目保持不变。'
        : parent
          ? '创建位置已固定；如需更换，请从对应类目点击“添加下级”。'
          : '从“新建一级类目”进入，创建位置已固定。';
  }

  function updateKind() {
    const branch = selectedKind() === 'branch';
    const node = find(editingId);
    $('ct-unit-field').hidden = branch;
    $('ct-unit').required = !branch;
    $('ct-unit').disabled = Boolean(branch || node?.spu > 0);
    $('ct-unit-help').textContent = node?.spu > 0 ? '已关联 SPU，保留现有单位。' : '用于该类目下的货物建档。';
    $('ct-status-help').textContent = branch
      ? '停用后，下属类目也不再用于新建 SPU，已有记录保留。'
      : '停用后不再用于新建 SPU，已有记录保留。';
    $('ct-editor-tabs').hidden = branch;
    if (branch) setEditorTab('basic');
    updateSkuEnabled();
  }

  function setEditorTab(tab, focus = false) {
    const defaults = tab === 'defaults' && selectedKind() === 'product';
    $('ct-basic-panel').hidden = defaults;
    $('ct-default-panel').hidden = !defaults;
    ['basic', 'default'].forEach((name) => {
      const active = name === (defaults ? 'default' : 'basic');
      $('ct-' + name + '-tab').setAttribute('aria-selected', String(active));
      $('ct-' + name + '-tab').tabIndex = active ? 0 : -1;
    });
    form.querySelector('.ct-dialog-body').scrollTop = 0;
    if (focus) $(defaults ? 'ct-default-tab' : 'ct-basic-tab').focus({ preventScroll: true });
  }

  function createDraftDimension(name = '', labels = ['']) {
    return {
      id: 'draft-dimension-' + (++dimensionSequence),
      name,
      values: labels.map((label) => ({ id: 'draft-value-' + (++valueSequence), label }))
    };
  }

  function defaultSkuCombinationCount(dimensions) {
    if (!dimensions?.length) return 0;
    return dimensions.reduce((total, dimension) => {
      const count = dimension.values.filter((value) => value.label.trim()).length;
      return total * count;
    }, 1);
  }

  function defaultSkuCombinations(dimensions, limit = Number.POSITIVE_INFINITY) {
    if (!dimensions?.length || dimensions.some((dimension) => !dimension.name.trim() || !dimension.values.some((value) => value.label.trim()))) return [];
    let combinations = [[]];
    dimensions.forEach((dimension) => {
      const next = [];
      combinations.forEach((combination) => {
        dimension.values.filter((value) => value.label.trim()).forEach((value) => {
          if (next.length < limit) next.push([...combination, { name: dimension.name.trim(), value: value.label.trim() }]);
        });
      });
      combinations = next;
    });
    return combinations;
  }

  function skuDimensionIssue() {
    if (!skuDimensionDraft.length) return { message: '至少保留一个 SKU 维度。' };
    const names = new Map();
    for (const dimension of skuDimensionDraft) {
      const name = dimension.name.trim().toLowerCase();
      if (!name) return { message: '请填写维度名称。', dimensionId: dimension.id, field: 'name' };
      if (names.has(name)) return { message: '维度名称不能重复。', dimensionId: dimension.id, field: 'name' };
      names.set(name, true);
      if (!dimension.values.length) return { message: '每个维度至少需要一个维度值。', dimensionId: dimension.id, field: 'value' };
      const values = new Set();
      for (const value of dimension.values) {
        const label = value.label.trim().toLowerCase();
        if (!label) return { message: '请填写维度值。', dimensionId: dimension.id, valueId: value.id, field: 'value' };
        if (values.has(label)) return { message: '同一维度下的维度值不能重复。', dimensionId: dimension.id, valueId: value.id, field: 'value' };
        values.add(label);
      }
    }
    return null;
  }

  function activeSkuDimension() {
    return skuDimensionDraft.find((dimension) => dimension.id === activeSkuDimensionId) || skuDimensionDraft[0];
  }

  function renderSkuDimensionTabs() {
    $('ct-sku-dimension-tabs').innerHTML = skuDimensionDraft.map((dimension, index) => {
      const active = dimension.id === activeSkuDimensionId;
      return '<div class="ct-sku-dimension-tab' + (active ? ' is-active' : '') + '">' +
        '<button type="button" role="tab" aria-selected="' + active + '" tabindex="' + (active ? '0' : '-1') + '" data-sku-action="select-dimension" data-dimension-id="' + dimension.id + '"><span><strong>' + escape(dimension.name || '未命名维度') + '</strong><small>' + dimension.values.length + ' 个维度值</small></span></button>' +
        '<span class="ct-sku-dimension-move" aria-label="调整维度顺序"><button type="button" data-sku-action="move-dimension-up" data-dimension-id="' + dimension.id + '" aria-label="上移' + escape(dimension.name || '未命名维度') + '"' + (index === 0 ? ' disabled' : '') + '>' + icon('chevron') + '</button><button type="button" data-sku-action="move-dimension-down" data-dimension-id="' + dimension.id + '" aria-label="下移' + escape(dimension.name || '未命名维度') + '"' + (index === skuDimensionDraft.length - 1 ? ' disabled' : '') + '>' + icon('chevron') + '</button></span></div>';
    }).join('');
  }

  function renderSkuDimensionEditor() {
    const dimension = activeSkuDimension();
    if (!dimension) { $('ct-sku-dimension-editor').innerHTML = ''; return; }
    const issue = skuDimensionIssue();
    const values = dimension.values.map((value, index) => '<div class="ct-sku-value-row"><span>' + String(index + 1).padStart(2, '0') + '</span><input id="ct-sku-value-' + value.id + '" type="text" value="' + escape(value.label) + '" maxlength="30" placeholder="例如：4kg" data-sku-field="value" data-dimension-id="' + dimension.id + '" data-value-id="' + value.id + '" aria-label="第 ' + (index + 1) + ' 个维度值"><button class="ct-icon-button" type="button" data-sku-action="remove-value" data-dimension-id="' + dimension.id + '" data-value-id="' + value.id + '" aria-label="删除维度值' + escape(value.label || String(index + 1)) + '"' + (dimension.values.length === 1 ? ' disabled title="每个维度至少保留一个值"' : '') + '>' + icon('trash') + '</button></div>').join('');
    $('ct-sku-dimension-editor').innerHTML = '<div class="ct-sku-editor-card"><label class="ct-sku-editor-label" for="ct-sku-dimension-name"><span>维度名称</span><small>只需填写一次，例如“容量”</small></label><input class="ct-sku-manager-input" id="ct-sku-dimension-name" type="text" value="' + escape(dimension.name) + '" maxlength="20" placeholder="例如：容量" data-sku-field="dimension-name" data-dimension-id="' + dimension.id + '">' +
      '<div class="ct-sku-values-head"><span>维度值</span><small>同一维度下可连续添加 4kg、8kg</small></div><div class="ct-sku-value-list">' + values + '</div><button class="ct-sku-add-value" type="button" data-sku-action="add-value" data-dimension-id="' + dimension.id + '">' + icon('plus') + '添加维度值</button>' +
      '<div class="ct-sku-editor-note">' + icon('info') + '<span>每个维度值会生成对应的默认 SKU；多个维度会自动组合。</span></div></div>' +
      '<div class="ct-sku-dimension-danger"><span><strong>删除此维度</strong><small>只影响尚未保存的默认配置。</small></span><button type="button" data-sku-action="remove-dimension" data-dimension-id="' + dimension.id + '"' + (skuDimensionDraft.length === 1 ? ' disabled' : '') + '>删除维度</button></div>' +
      '<p class="ct-sku-validation" id="ct-sku-validation" role="alert"' + (issue ? '' : ' hidden') + '>' + escape(issue?.message || '') + '</p>';
    syncSkuInvalidState();
  }

  function syncSkuInvalidState() {
    $('ct-sku-fields').querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
    const issue = skuDimensionIssue();
    const validation = $('ct-sku-validation');
    if (validation) { validation.hidden = !issue; validation.textContent = issue?.message || ''; }
    if (!issue || issue.dimensionId !== activeSkuDimensionId) return;
    const target = issue.field === 'name' ? $('ct-sku-dimension-name') : issue.valueId ? $('ct-sku-value-' + issue.valueId) : null;
    if (target) target.setAttribute('aria-invalid', 'true');
  }

  function updateSkuPreview() {
    const name = $('ct-name').value.trim() || '新类目';
    const issue = skuDimensionIssue();
    const count = issue ? 0 : defaultSkuCombinationCount(skuDimensionDraft);
    const combinations = issue ? [] : defaultSkuCombinations(skuDimensionDraft, 12);
    $('ct-sku-category-name').textContent = name;
    $('ct-sku-preview-spu').textContent = '所选品牌 · ' + name;
    $('ct-sku-preview-count').textContent = issue ? '请修正维度配置' : '将生成 ' + count + ' 条默认 SKU';
    $('ct-sku-combinations').innerHTML = combinations.length ? combinations.map((specs, index) => '<div class="ct-sku-combination"><span>SKU ' + String(index + 1).padStart(2, '0') + '</span><div>' + specs.map((spec) => '<span class="ct-sku-chip"><span>' + escape(spec.name) + '</span><strong>' + escape(spec.value) + '</strong></span>').join('') + '</div></div>').join('') + (count > combinations.length ? '<p>另有 ' + (count - combinations.length) + ' 条组合，保存后将在新建 SPU 时一并带入。</p>' : '') : '<p>' + (issue ? '修正维度配置后，这里会重新显示生成结果。' : '添加维度值后，这里会显示生成结果。') + '</p>';
  }

  function updateSkuEnabled() {
    const active = selectedKind() === 'product' && $('ct-sku-enabled').checked;
    $('ct-sku-fields').disabled = !active;
    $('ct-sku-fields').hidden = !active;
    $('ct-sku-off').hidden = active;
    if (active && !skuDimensionDraft.length) {
      const dimension = createDraftDimension();
      skuDimensionDraft.push(dimension);
      activeSkuDimensionId = dimension.id;
      renderSkuDimensionTabs();
      renderSkuDimensionEditor();
    }
    updateSkuPreview();
  }

  function openEditor(node, parentId, trigger, tab = 'basic') {
    editingId = node?.id || null;
    form.reset();
    $('ct-name-error').hidden = true;
    $('ct-name').removeAttribute('aria-invalid');
    $('ct-form-error').hidden = true;
    $('ct-editor-title').textContent = node ? '编辑类目' : parentId ? '添加下级类目' : '新建一级类目';
    $('ct-parent').value = node?.parentId || parentId || 'root';
    const kind = node?.kind || (parentId ? 'product' : 'branch');
    form.querySelector('input[name="kind"][value="' + kind + '"]').checked = true;
    const locked = Boolean(node && (children(node.id).length || node.spu > 0));
    $('ct-kind-fieldset').disabled = locked;
    $('ct-kind-lock').hidden = !locked;
    $('ct-kind-lock').textContent = node?.spu > 0 ? '已关联 SPU，不能改为分类节点。' : '已有下级类目，不能改为建档类目。';
    $('ct-name').value = node?.name || '';
    $('ct-code').value = node?.code || 'CAT-' + String(sequence).padStart(3, '0');
    $('ct-order').value = node ? node.order : Math.min(9999, Math.max(0, ...children(parentId || null).map((item) => item.order)) + 10);
    $('ct-unit').value = node?.unit || '';
    $('ct-enabled').checked = node ? node.enabled : true;
    $('ct-sku-enabled').checked = Boolean(node?.defaultSku);
    const sourceDimensions = node?.defaultSku?.dimensions || (node?.defaultSku?.specs || []).map((spec) => ({ name: spec.name, values: [{ label: spec.value }] }));
    skuDimensionDraft = sourceDimensions.map((dimension) => createDraftDimension(dimension.name, dimension.values.map((value) => value.label)));
    if (!skuDimensionDraft.length) skuDimensionDraft = [createDraftDimension()];
    activeSkuDimensionId = skuDimensionDraft[0].id;
    renderSkuDimensionTabs();
    renderSkuDimensionEditor();
    updateKind();
    updatePlacement();
    setEditorTab(tab);
    showDialog(editor, trigger);
    $(tab === 'defaults' ? 'ct-sku-enabled' : 'ct-name').focus({ preventScroll: true });
  }

  body.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const node = find(button.closest('tr').dataset.id);
    if (button.dataset.action === 'toggle') {
      if (expanded.has(node.id)) expanded.delete(node.id);
      else expanded.add(node.id);
      focusedId = node.id;
      render(true);
      focusRow(node.id);
    } else if (button.dataset.action === 'defaults') openEditor(node, null, button, 'defaults');
    else if (button.dataset.action === 'add') openEditor(null, node.id, button);
    else if (button.dataset.action === 'edit') openEditor(node, null, button);
    else openDetail(node.id, button);
  });

  body.addEventListener('focusin', (event) => {
    const row = event.target.closest('tr[data-id]');
    if (!row) return;
    focusedId = row.dataset.id;
    [...body.rows].forEach((item) => {
      item.tabIndex = item === row ? 0 : -1;
      item.classList.toggle('ct-row-focused', item === row);
    });
  });
  body.addEventListener('focusout', (event) => {
    if (!body.contains(event.relatedTarget)) [...body.rows].forEach((row) => row.classList.remove('ct-row-focused'));
  });

  body.addEventListener('keydown', (event) => {
    if (!event.target.matches('tr[data-id]')) return;
    const index = visibleRows.findIndex(({ node }) => node.id === event.target.dataset.id);
    const current = visibleRows[index];
    if (!current) return;
    const { node } = current;
    const key = event.key;
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', ' '].includes(key)) return;
    event.preventDefault();
    if (key === 'ArrowDown') focusRow(visibleRows[Math.min(index + 1, visibleRows.length - 1)].node.id);
    if (key === 'ArrowUp') focusRow(visibleRows[Math.max(index - 1, 0)].node.id);
    if (key === 'Home') focusRow(visibleRows[0].node.id);
    if (key === 'End') focusRow(visibleRows.at(-1).node.id);
    if (key === 'Enter' || key === ' ') openDetail(node.id, event.target);
    if (key === 'ArrowRight' && children(node.id).length) {
      if (!current.isOpen) { expanded.add(node.id); render(true); focusRow(node.id); }
      else if (visibleRows[index + 1]?.node.parentId === node.id) focusRow(visibleRows[index + 1].node.id);
    }
    if (key === 'ArrowLeft') {
      if (current.isOpen && children(node.id).length && !isFiltering()) {
        expanded.delete(node.id); render(true); focusRow(node.id);
      } else if (node.parentId) focusRow(node.parentId);
    }
  });

  $('ct-create-root').addEventListener('click', (event) => openEditor(null, null, event.currentTarget));
  $('ct-detail-edit').addEventListener('click', () => {
    const source = openers.get(detail);
    closeDialog(detail, false);
    openEditor(find(detailId), null, source?.element);
  });
  $('ct-detail-body').addEventListener('click', (event) => {
    if (!event.target.closest('[data-configure-default]')) return;
    const source = openers.get(detail);
    closeDialog(detail, false);
    openEditor(find(detailId), null, source?.element, 'defaults');
  });
  $('ct-delete').addEventListener('click', () => {
    const node = find(detailId);
    if (!node || !canDelete(node)) return;
    $('ct-confirm-copy').textContent = '删除“' + node.name + '”后，它将从类目树中移除。';
    showDialog(confirmDialog, $('ct-delete'));
  });
  $('ct-confirm-delete').addEventListener('click', () => {
    const node = find(detailId);
    if (!node || !canDelete(node)) return;
    const parentId = node.parentId;
    nodes.splice(nodes.indexOf(node), 1);
    expanded.delete(node.id);
    closeDialog(confirmDialog, false);
    closeDialog(detail, false);
    focusedId = parentId;
    render(true);
    if (parentId && visibleRows.some((row) => row.node.id === parentId)) focusRow(parentId);
    else $('ct-create-root').focus();
    toast('已删除“' + node.name + '”');
  });

  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => closeDialog(button.closest('dialog')));
  });
  [detail, editor, confirmDialog].forEach((dialog) => {
    let outsideStart = false;
    dialog.addEventListener('pointerdown', (event) => { outsideStart = event.target === dialog; });
    dialog.addEventListener('click', (event) => {
      if (outsideStart && event.target === dialog) closeDialog(dialog);
      outsideStart = false;
    });
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeDialog(dialog); });
  });

  search.addEventListener('input', () => render(true));
  filter.addEventListener('change', () => render(true));
  ['ct-reset-search', 'ct-empty-reset'].forEach((id) => $(id).addEventListener('click', () => { resetFilters(); search.focus(); }));
  $('ct-expand-all').addEventListener('click', () => {
    nodes.filter((node) => node.kind === 'branch').forEach((node) => expanded.add(node.id));
    render(true);
  });
  $('ct-collapse-all').addEventListener('click', () => { expanded.clear(); render(true); });
  form.querySelectorAll('input[name="kind"]').forEach((input) => input.addEventListener('change', updateKind));
  $('ct-basic-tab').addEventListener('click', () => setEditorTab('basic'));
  $('ct-default-tab').addEventListener('click', () => setEditorTab('defaults'));
  $('ct-editor-tabs').addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const defaults = event.key === 'End' || (event.key !== 'Home' && event.target.id === 'ct-basic-tab');
    setEditorTab(defaults ? 'defaults' : 'basic', true);
  });
  $('ct-sku-enabled').addEventListener('change', updateSkuEnabled);
  $('ct-sku-add-dimension').addEventListener('click', () => {
    const dimension = createDraftDimension();
    skuDimensionDraft.push(dimension);
    activeSkuDimensionId = dimension.id;
    renderSkuDimensionTabs();
    renderSkuDimensionEditor();
    updateSkuPreview();
    $('ct-sku-dimension-name').focus();
  });
  $('ct-sku-fields').addEventListener('input', (event) => {
    const dimension = skuDimensionDraft.find((item) => item.id === event.target.dataset.dimensionId);
    if (!dimension) return;
    if (event.target.dataset.skuField === 'dimension-name') dimension.name = event.target.value;
    if (event.target.dataset.skuField === 'value') {
      const value = dimension.values.find((item) => item.id === event.target.dataset.valueId);
      if (value) value.label = event.target.value;
    }
    renderSkuDimensionTabs();
    syncSkuInvalidState();
    updateSkuPreview();
  });
  $('ct-sku-fields').addEventListener('focusout', (event) => {
    if (event.target.matches('[data-sku-field]')) syncSkuInvalidState();
  });
  $('ct-sku-fields').addEventListener('click', (event) => {
    const button = event.target.closest('[data-sku-action]');
    if (!button) return;
    const dimension = skuDimensionDraft.find((item) => item.id === button.dataset.dimensionId);
    if (button.dataset.skuAction === 'select-dimension') {
      activeSkuDimensionId = button.dataset.dimensionId;
    } else if (button.dataset.skuAction === 'add-value' && dimension) {
      const value = { id: 'draft-value-' + (++valueSequence), label: '' };
      dimension.values.push(value);
      renderSkuDimensionEditor();
      updateSkuPreview();
      $('ct-sku-value-' + value.id).focus();
      return;
    } else if (button.dataset.skuAction === 'remove-value' && dimension && dimension.values.length > 1) {
      dimension.values = dimension.values.filter((value) => value.id !== button.dataset.valueId);
    } else if (button.dataset.skuAction === 'remove-dimension' && skuDimensionDraft.length > 1) {
      const index = skuDimensionDraft.findIndex((item) => item.id === button.dataset.dimensionId);
      skuDimensionDraft.splice(index, 1);
      activeSkuDimensionId = skuDimensionDraft[Math.max(0, index - 1)].id;
    } else if ((button.dataset.skuAction === 'move-dimension-up' || button.dataset.skuAction === 'move-dimension-down') && dimension) {
      const index = skuDimensionDraft.indexOf(dimension);
      const target = index + (button.dataset.skuAction === 'move-dimension-up' ? -1 : 1);
      if (target >= 0 && target < skuDimensionDraft.length) [skuDimensionDraft[index], skuDimensionDraft[target]] = [skuDimensionDraft[target], skuDimensionDraft[index]];
    }
    renderSkuDimensionTabs();
    renderSkuDimensionEditor();
    updateSkuPreview();
  });
  $('ct-name').addEventListener('input', () => {
    $('ct-name-error').hidden = true;
    $('ct-name').removeAttribute('aria-invalid');
    updatePlacement();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const existing = find(editingId);
    const name = $('ct-name').value.trim();
    const parentId = $('ct-parent').value === 'root' ? null : $('ct-parent').value;
    const kind = selectedKind();
    $('ct-name-error').hidden = true;
    $('ct-form-error').hidden = true;
    const duplicate = children(parentId).some((node) => node.id !== editingId && node.name.toLowerCase() === name.toLowerCase());
    if (!name || duplicate) {
      setEditorTab('basic');
      $('ct-name-error').textContent = !name ? '请输入类目名称。' : '该上级下已有同名类目，请使用不同名称。';
      $('ct-name-error').hidden = false;
      $('ct-name').setAttribute('aria-invalid', 'true');
      $('ct-name').focus();
      return;
    }
    const invalidBasic = [...$('ct-basic-panel').querySelectorAll('input,select')].find((input) => input.willValidate && !input.validity.valid);
    if (invalidBasic) { setEditorTab('basic'); invalidBasic.reportValidity(); return; }
    const useDefaultSku = kind === 'product' && $('ct-sku-enabled').checked;
    if (useDefaultSku) {
      const issue = skuDimensionIssue();
      if (issue) {
        activeSkuDimensionId = issue.dimensionId || skuDimensionDraft[0]?.id;
        setEditorTab('defaults');
        renderSkuDimensionTabs();
        renderSkuDimensionEditor();
        const target = issue.field === 'name' ? $('ct-sku-dimension-name') : issue.valueId ? $('ct-sku-value-' + issue.valueId) : $('ct-sku-add-dimension');
        target?.focus();
        return;
      }
    }
    const invalidParent = parentId && (find(parentId)?.kind !== 'branch' || (existing && [existing.id, ...descendants(existing.id).map((node) => node.id)].includes(parentId)));
    if (invalidParent || (existing && ((kind === 'product' && children(existing.id).length) || (kind === 'branch' && existing.spu > 0)))) {
      $('ct-form-error').textContent = '请检查上级类目和类目用途，类目不能归入自身下级。';
      $('ct-form-error').hidden = false;
      return;
    }
    const saved = {
      id: existing?.id || 'cat-' + sequence,
      code: existing?.code || $('ct-code').value,
      name, parentId, kind, order: Number($('ct-order').value),
      enabled: $('ct-enabled').checked,
      unit: kind === 'product' ? $('ct-unit').value : '',
      spu: kind === 'product' ? (existing?.spu || 0) : 0,
      defaultSku: useDefaultSku ? { dimensions: skuDimensionDraft.map((dimension) => ({ id: dimension.id, name: dimension.name.trim(), values: dimension.values.map((value) => ({ id: value.id, label: value.label.trim() })) })) } : null
    };
    if (existing) Object.assign(existing, saved);
    else { nodes.push(saved); sequence += 1; }
    pathOf(saved).slice(0, -1).forEach((node) => expanded.add(node.id));
    focusedId = saved.id;
    search.value = '';
    filter.value = 'all';
    closeDialog(editor, false);
    render(true);
    focusRow(saved.id);
    toast((existing ? '已更新“' : '已新建“') + name + '”');
  });

  render();
}());
