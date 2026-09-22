/**
 * 燧安进销存后台公共壳层
 *
 * 新页面用法：
 * <admin-sidebar active="goods-list"></admin-sidebar>
 * <admin-topbar trail="库存管理|货物列表"></admin-topbar>
 *
 * active 用于控制侧边栏高亮；trail 使用 | 分隔顶部层级。
 */
(function () {
  'use strict';

  const shellScript = document.currentScript || document.querySelector('script[src$="admin-shell.js"]');
  const projectRoot = shellScript && shellScript.src
    ? new URL('../', shellScript.src)
    : new URL('../', window.location.href);

  function resolvePageHref(path) {
    return path === '#' ? '#' : new URL(path, projectRoot).href;
  }

  const icons = {
    brand: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c2.5 3 5.2 5.5 5.2 9.1A5.2 5.2 0 0 1 12 17.3a5.2 5.2 0 0 1-5.2-5.2C6.8 9.7 8 7.5 9.4 6c.2 2 1 3.1 2 3.7.7-2.7.4-4.7.6-6.7Z"></path><path d="M5 21h14"></path></svg>',
    mobileBrand: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3c2.5 3 5.2 5.5 5.2 9.1A5.2 5.2 0 0 1 12 17.3a5.2 5.2 0 0 1-5.2-5.2C6.8 9.7 8 7.5 9.4 6c.2 2 1 3.1 2 3.7.7-2.7.4-4.7.6-6.7Z"></path></svg>',
    overview: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"></rect><rect x="14" y="3" width="7" height="7" rx="2"></rect><rect x="3" y="14" width="7" height="7" rx="2"></rect><rect x="14" y="14" width="7" height="7" rx="2"></rect></svg>',
    purchase: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16v13H4z"></path><path d="M8 7V5a4 4 0 0 1 8 0v2"></path><path d="M9 12h6"></path></svg>',
    sales: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1"></circle><circle cx="19" cy="20" r="1"></circle><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H7"></path></svg>',
    inventory: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"></path><path d="m4 7.5 8 4.5 8-4.5M12 12v9"></path></svg>',
    foundation: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v15H4z"></path><path d="M8 5V3h8v2M8 10h8M8 14h5"></path></svg>',
    down: '<svg class="nav-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"></path></svg>',
    next: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 18 6-6-6-6"></path></svg>'
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function userConfig(element) {
    return {
      name: escapeHtml(element.getAttribute('user-name') || '陈晓峰'),
      role: escapeHtml(element.getAttribute('user-role') || '仓库管理员'),
      avatar: escapeHtml(element.getAttribute('user-avatar') || '陈')
    };
  }

  class AdminSidebar extends HTMLElement {
    connectedCallback() {
      if (this.dataset.rendered === 'true') return;

      const current = this.getAttribute('active') || '';
      const activeKey = current === 'goods-detail' ? 'goods-list' : current;
      const inventoryKeys = ['goods-list', 'stocktake', 'transfer', 'flows'];
      const inventoryOpen = inventoryKeys.includes(activeKey);
      const foundationOpen = ['foundation', 'goods-categories', 'brands', 'suppliers'].includes(activeKey);
      const user = userConfig(this);

      const sideLink = (key, label, href, icon) => {
        const active = current === key;
        return `<a class="side-link${active ? ' parent-active' : ''}" href="${resolvePageHref(href)}" aria-label="${label}" title="${label}"${active ? ' aria-current="page"' : ''}>${icon}<span>${label}</span></a>`;
      };

      const subLink = (key, label, href) => {
        const active = activeKey === key;
        const isCurrent = current === key;
        return `<a class="sub-link${active ? ' active' : ''}" href="${resolvePageHref(href)}"${isCurrent ? ' aria-current="page"' : ''}>${label}</a>`;
      };

      this.innerHTML = `
        <aside class="sidebar" aria-label="主导航">
          <div class="side-brand">
            <span class="brand-mark" aria-hidden="true">${icons.brand}</span>
            <span class="side-brand-copy"><span class="side-brand-name">燧安进销存</span><span class="side-brand-sub">消防器材管理系统</span></span>
          </div>
          <div class="side-scroll">
            <p class="side-label">工作台</p>
            <nav class="side-nav" aria-label="业务模块">
              ${sideLink('overview', '经营概览', '#', icons.overview)}
              ${sideLink('purchase', '采购管理', '#', icons.purchase)}
              ${sideLink('sales', '销售管理', '#', icons.sales)}
              <a class="side-link${inventoryOpen ? ' parent-active' : ''}" href="${resolvePageHref('goods/v1/goods-list.html')}" aria-label="库存管理" title="库存管理" aria-expanded="${inventoryOpen}">
                ${icons.inventory}<span>库存管理</span>${icons.down}
              </a>
              <div class="subnav"${inventoryOpen ? '' : ' hidden'}>
                ${subLink('goods-list', '货物列表', 'goods/v1/goods-list.html')}
                ${subLink('stocktake', '库存盘点', '#')}
                ${subLink('transfer', '仓库调拨', '#')}
                ${subLink('flows', '出入库记录', '#')}
              </div>
              <a class="side-link${foundationOpen ? ' parent-active' : ''}" href="${resolvePageHref('foundation/goods-category/goods-categories.html')}" aria-label="基础资料" title="基础资料" aria-expanded="${foundationOpen}"${current === 'foundation' ? ' aria-current="page"' : ''}>
                ${icons.foundation}<span>基础资料</span>${icons.down}
              </a>
              <div class="subnav"${foundationOpen ? '' : ' hidden'}>
                ${subLink('goods-categories', '货物类目', 'foundation/goods-category/goods-categories.html')}
                ${subLink('brands', '品牌管理', 'foundation/brand/brands.html')}
                ${subLink('suppliers', '供应商管理', 'foundation/supplier/suppliers.html')}
              </div>
            </nav>
          </div>
          <div class="side-user" aria-label="当前用户：${user.role}">
            <span class="user-avatar" aria-hidden="true">${user.avatar}</span>
            <span class="user-meta"><strong>${user.name}</strong><span>${user.role}</span></span>
          </div>
        </aside>`;

      this.dataset.rendered = 'true';
    }
  }

  class AdminTopbar extends HTMLElement {
    connectedCallback() {
      if (this.dataset.rendered === 'true') return;

      const trail = (this.getAttribute('trail') || '经营概览')
        .split('|')
        .map((item) => item.trim())
        .filter(Boolean)
        .map(escapeHtml);
      const syncText = escapeHtml(this.getAttribute('sync-text') || '库存数据已同步');
      const user = userConfig(this);
      const breadcrumbs = trail.map((item, index) => {
        const current = index === trail.length - 1;
        const label = current ? `<strong aria-current="page">${item}</strong>` : `<span>${item}</span>`;
        return `${index ? icons.next : ''}${label}`;
      }).join('');

      this.innerHTML = `
        <header class="topbar">
          <nav class="nav" aria-label="顶部工具栏">
            <div class="mobile-brand">
              <span class="brand-mark" aria-hidden="true">${icons.mobileBrand}</span>
              <span>燧安进销存</span>
            </div>
            <div class="breadcrumb" aria-label="当前位置">${breadcrumbs}</div>
            <div class="top-tools">
              <div class="sync-state" aria-label="同步状态：${syncText}"><span class="sync-dot" aria-hidden="true"></span><span>${syncText}</span></div>
              <span class="top-divider" aria-hidden="true"></span>
              <div class="top-user"><span class="user-avatar" aria-hidden="true">${user.avatar}</span><span>${user.role}</span></div>
            </div>
          </nav>
        </header>`;

      this.dataset.rendered = 'true';
    }
  }

  if (!customElements.get('admin-sidebar')) customElements.define('admin-sidebar', AdminSidebar);
  if (!customElements.get('admin-topbar')) customElements.define('admin-topbar', AdminTopbar);
}());
