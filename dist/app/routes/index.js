"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = require("../modules/auth/auth.routes");
const user_routes_1 = require("../modules/user/user.routes");
const category_router_1 = require("../modules/category/category.router");
const brand_router_1 = require("../modules/brand/brand.router");
const image_gallery_routes_1 = require("../modules/image-gallery/image-gallery.routes");
const product_router_1 = require("../modules/product/product.router");
const barcode_router_1 = require("../modules/barcode/barcode.router");
const storefront_router_1 = require("../modules/storefront/storefront.router");
const offers_router_1 = require("../modules/offers/offers.router");
const variant_router_1 = require("../modules/variant/variant.router");
const unit_router_1 = require("../modules/unit/unit.router");
const tax_router_1 = require("../modules/tax/tax.router");
const supplier_router_1 = require("../modules/supplier/supplier.router");
const section_router_1 = require("../modules/section/section.router");
const review_router_1 = require("../modules/review/review.router");
const coupon_router_1 = require("../modules/coupon/coupon.router");
const order_router_1 = require("../modules/order/order.router");
const Quantity_router_1 = require("../modules/Quantity/Quantity.router");
const Stock_router_1 = require("../modules/Stock/Stock.router");
const Billers_router_1 = require("../modules/Billers/Billers.router");
const Customers_router_1 = require("../modules/Customers/Customers.router");
const quotations_router_1 = require("../modules/quotations/quotations.router");
const purchase_router_1 = require("../modules/purchase/purchase.router");
const expense_router_1 = require("../modules/expense/expense.router");
const combo_router_1 = require("../modules/combo/combo.router");
const blog_router_1 = require("../modules/blog/blog.router");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/auth',
        routes: auth_routes_1.authRoutes
    },
    {
        path: '/user',
        routes: user_routes_1.userRoutes
    },
    {
        path: '/category',
        routes: category_router_1.categoryRoutes
    },
    {
        path: '/brand',
        routes: brand_router_1.brandRoutes
    },
    {
        path: '/image-gallery',
        routes: image_gallery_routes_1.imageGalleryRoutes
    },
    {
        path: '/product',
        routes: product_router_1.productRoutes
    },
    {
        path: '/variant',
        routes: variant_router_1.variantRoutes
    },
    {
        path: '/unit',
        routes: unit_router_1.unitRoutes
    },
    {
        path: '/tax',
        routes: tax_router_1.taxRoutes
    },
    {
        path: '/barcode',
        routes: barcode_router_1.barcodeRoutes
    },
    {
        path: '/storefront',
        routes: storefront_router_1.storefrontRoutes
    },
    {
        path: '/offers',
        routes: offers_router_1.offersRoutes
    },
    {
        path: '/supplier',
        routes: supplier_router_1.supplierRoutes
    },
    {
        path: '/billers',
        routes: Billers_router_1.BillersRoutes
    },
    {
        path: '/customers',
        routes: Customers_router_1.CustomersRoutes
    },
    {
        path: '/section',
        routes: section_router_1.sectionRoutes
    },
    {
        path: '/review',
        routes: review_router_1.reviewRoutes
    },
    {
        path: '/coupon',
        routes: coupon_router_1.couponRoutes
    },
    {
        path: '/order',
        routes: order_router_1.orderRoutes
    },
    {
        path: '/quantity-adjustment',
        routes: Quantity_router_1.QuantityRoutes
    },
    {
        path: '/stock-counts',
        routes: Stock_router_1.StockRoutes
    },
    {
        path: '/quotations',
        routes: quotations_router_1.quotationsRoutes
    },
    {
        path: '/purchase',
        routes: purchase_router_1.purchaseRoutes
    },
    {
        path: '/expense',
        routes: expense_router_1.expenseRoutes
    },
    {
        path: '/combo',
        routes: combo_router_1.comboRoutes
    },
    {
        path: '/blog',
        routes: blog_router_1.blogRoutes
    }
];
moduleRoutes.forEach((route) => router.use(route.path, route.routes));
exports.default = router;
