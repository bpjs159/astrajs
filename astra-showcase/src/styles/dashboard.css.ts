/**
 * AstraStore — Dashboard Styles
 *
 * Zero-runtime CSS using the `css` tagged template macro.
 * At build time, the AST compiler extracts these rules into
 * static `.css` files with content-hashed class names.
 *
 * The `css` function is completely removed from the bundle —
 * only `{ sidebar: 'sc-sidebar_a1b2c3', ... }` remains.
 */

import { css } from '@astrajs/compiler';

export const styles = css`
  /* ─── Layout ─────────────────────────── */
  .app-shell {
    display: flex;
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #1e293b;
  }

  .sidebar {
    width: 260px;
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
    color: #e2e8f0;
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
  }

  .sidebar-brand {
    padding: 0 24px 24px;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sidebar-nav {
    flex: 1;
    padding: 0 12px;
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    color: #94a3b8;
    text-decoration: none;
    font-size: 0.925rem;
    font-weight: 500;
    transition: all 0.15s ease;
    margin-bottom: 2px;
  }

  .sidebar-link:hover {
    background: rgba(255,255,255,0.06);
    color: #e2e8f0;
  }

  .sidebar-link.active {
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    font-weight: 600;
  }

  .sidebar-footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(255,255,255,0.08);
    font-size: 0.8rem;
    color: #64748b;
  }

  /* ─── Main Content ────────────────────── */
  .main-content {
    flex: 1;
    margin-left: 260px;
    padding: 32px;
    min-height: 100vh;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .page-title {
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #0f172a;
  }

  .page-subtitle {
    font-size: 0.925rem;
    color: #64748b;
    margin-top: 4px;
  }

  /* ─── Stats Grid ──────────────────────── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    transition: box-shadow 0.15s ease;
  }

  .stat-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }

  .stat-icon {
    font-size: 2rem;
    margin-bottom: 12px;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #0f172a;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #64748b;
    margin-top: 2px;
  }

  /* ─── Product Grid ────────────────────── */
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .product-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .product-card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    transform: translateY(-2px);
    border-color: #c7d2fe;
  }

  .product-image {
    height: 120px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
  }

  .product-info {
    padding: 16px;
  }

  .product-name {
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 4px;
  }

  .product-category {
    font-size: 0.8rem;
    color: #6366f1;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .product-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .product-price {
    font-weight: 700;
    font-size: 1.15rem;
    color: #0f172a;
  }

  .product-rating {
    font-size: 0.85rem;
    color: #f59e0b;
  }

  /* ─── Buttons ─────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-primary {
    background: #6366f1;
    color: white;
  }

  .btn-primary:hover {
    background: #4f46e5;
  }

  .btn-secondary {
    background: #f1f5f9;
    color: #475569;
  }

  .btn-secondary:hover {
    background: #e2e8f0;
  }

  .btn-danger {
    background: #ef4444;
    color: white;
  }

  .btn-danger:hover {
    background: #dc2626;
  }

  /* ─── Filters ─────────────────────────── */
  .filters-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .filter-select {
    padding: 8px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    font-size: 0.875rem;
    color: #334155;
    cursor: pointer;
  }

  .search-input {
    padding: 8px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    flex: 1;
    min-width: 200px;
    max-width: 400px;
  }

  /* ─── Cart Badge ──────────────────────── */
  .cart-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #6366f1;
    color: white;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 700;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
  }

  /* ─── Order Table ─────────────────────── */
  .table {
    width: 100%;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
    padding: 14px 20px;
    background: #f8fafc;
    font-weight: 600;
    font-size: 0.8rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e2e8f0;
  }

  .table-row {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
    padding: 14px 20px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.9rem;
    align-items: center;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .status-pending { background: #fef3c7; color: #92400e; }
  .status-processing { background: #dbeafe; color: #1e40af; }
  .status-shipped { background: #d1fae5; color: #065f46; }
  .status-delivered { background: #e0e7ff; color: #3730a3; }
  .status-cancelled { background: #fee2e2; color: #991b1b; }

  /* ─── Detail Page ─────────────────────── */
  .detail-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 32px;
  }

  .detail-image {
    height: 300px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 6rem;
  }

  .detail-info h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .detail-info .category {
    color: #6366f1;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 16px;
  }

  .detail-info .description {
    color: #475569;
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .detail-meta {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
  }

  .detail-meta-item {
    text-align: center;
  }

  .detail-meta-value {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .detail-meta-label {
    font-size: 0.8rem;
    color: #64748b;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #6366f1;
    text-decoration: none;
    font-weight: 500;
    margin-bottom: 24px;
    cursor: pointer;
  }

  .back-link:hover {
    color: #4f46e5;
  }
`;
