/**
 * AstraStore — Route Definitions
 *
 * The route tree defines the app's navigation structure.
 * Routes are nested: the DashboardLayout wraps all child routes
 * and renders them through its `<Outlet />`.
 */

import type { RouteDefinition } from '@astrajs/router';
import { DashboardLayout } from './layouts/dashboard.js';
import { HomePage } from './pages/home.js';
import { ProductsPage } from './pages/products.js';
import { ProductDetailPage } from './pages/product-detail.js';
import { OrdersPage } from './pages/orders.js';

/**
 * The full route tree for AstraStore.
 *
 * Structure:
 * ```
 * /                    → DashboardLayout → HomePage
 * /products            → DashboardLayout → ProductsPage
 * /products/:id        → DashboardLayout → ProductDetailPage
 * /orders              → DashboardLayout → OrdersPage
 * ```
 *
 * The DashboardLayout renders once with the Sidebar. Navigation
 * between child routes only swaps the content inside `<Outlet />`.
 */
export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: '',
        component: HomePage,
        meta: { title: 'Dashboard — AstraStore' },
      },
      {
        path: 'products',
        component: ProductsPage,
        meta: { title: 'Products — AstraStore' },
      },
      {
        path: 'products/:id',
        component: ProductDetailPage,
        meta: { title: 'Product Detail — AstraStore' },
      },
      {
        path: 'orders',
        component: OrdersPage,
        meta: { title: 'Orders — AstraStore' },
      },
    ],
  },
];
