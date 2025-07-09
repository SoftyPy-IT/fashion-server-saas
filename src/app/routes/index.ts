import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { userRoutes } from '../modules/user/user.routes';
import { categoryRoutes } from '../modules/category/category.router';
import { brandRoutes } from '../modules/brand/brand.router';
import { imageGalleryRoutes } from '../modules/image-gallery/image-gallery.routes';
import { productRoutes } from '../modules/product/product.router';
import { barcodeRoutes } from '../modules/barcode/barcode.router';
import { storefrontRoutes } from '../modules/storefront/storefront.router';
import { offersRoutes } from '../modules/offers/offers.router';
import { variantRoutes } from '../modules/variant/variant.router';
import { unitRoutes } from '../modules/unit/unit.router';
import { taxRoutes } from '../modules/tax/tax.router';
import { supplierRoutes } from '../modules/supplier/supplier.router';
import { sectionRoutes } from '../modules/section/section.router';
import { reviewRoutes } from '../modules/review/review.router';
import { couponRoutes } from '../modules/coupon/coupon.router';
import { orderRoutes } from '../modules/order/order.router';
import { QuantityRoutes } from '../modules/Quantity/Quantity.router';
import { StockRoutes } from '../modules/Stock/Stock.router';
import { BillersRoutes } from '../modules/Billers/Billers.router';
import { CustomersRoutes } from '../modules/Customers/Customers.router';
import { quotationsRoutes } from '../modules/quotations/quotations.router';
import { purchaseRoutes } from '../modules/purchase/purchase.router';
import { expenseRoutes } from '../modules/expense/expense.router';
import { comboRoutes } from '../modules/combo/combo.router';
import { blogRoutes } from '../modules/blog/blog.router';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    routes: authRoutes
  },
  {
    path: '/user',
    routes: userRoutes
  },
  {
    path: '/category',
    routes: categoryRoutes
  },
  {
    path: '/brand',
    routes: brandRoutes
  },
  {
    path: '/image-gallery',
    routes: imageGalleryRoutes
  },
  {
    path: '/product',
    routes: productRoutes
  },
  {
    path: '/variant',
    routes: variantRoutes
  },
  {
    path: '/unit',
    routes: unitRoutes
  },
  {
    path: '/tax',
    routes: taxRoutes
  },
  {
    path: '/barcode',
    routes: barcodeRoutes
  },
  {
    path: '/storefront',
    routes: storefrontRoutes
  },
  {
    path: '/offers',
    routes: offersRoutes
  },
  {
    path: '/supplier',
    routes: supplierRoutes
  },
  {
    path: '/billers',
    routes: BillersRoutes
  },
  {
    path: '/customers',
    routes: CustomersRoutes
  },
  {
    path: '/section',
    routes: sectionRoutes
  },
  {
    path: '/review',
    routes: reviewRoutes
  },
  {
    path: '/coupon',
    routes: couponRoutes
  },
  {
    path: '/order',
    routes: orderRoutes
  },
  {
    path: '/quantity-adjustment',
    routes: QuantityRoutes
  },
  {
    path: '/stock-counts',
    routes: StockRoutes
  },
  {
    path: '/quotations',
    routes: quotationsRoutes
  },
  {
    path: '/purchase',
    routes: purchaseRoutes
  },
  {
    path: '/expense',
    routes: expenseRoutes
  },
  {
    path: '/combo',
    routes: comboRoutes
  },
  {
    path: '/blog',
    routes: blogRoutes
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.routes));

export default router;
