import { component } from 'astrajs.dev/core';
import { Sidebar } from '../components/sidebar.js';
import { DashboardPage } from '../pages/dashboard.js';
import { ProductsPage } from '../pages/products.js';
import { OrdersPage } from '../pages/orders.js';
import { CartPage } from '../pages/cart.js';
import { FormDemoPage } from '../pages/form-demo.js';
import { UploadPage } from '../pages/upload-demo.js';
import { routes } from '../routes.js';

export const DashboardLayout = component(() => (
  <div class="layout">
    <Sidebar />
    <main class="main-content">
      {(() => {
        if (routes.dashboard) return <DashboardPage />;
        if (routes.products) return <ProductsPage />;
        if (routes.orders) return <OrdersPage />;
        if (routes.cart) return <CartPage />;
        if (routes.formDemo) return <FormDemoPage />;
        if (routes.upload) return <UploadPage />;
        return <div class="page"><h1>404</h1></div>;
      })()}
    </main>
  </div>
));
