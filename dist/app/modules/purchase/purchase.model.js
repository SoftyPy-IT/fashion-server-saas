"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const purchaseSchema = new mongoose_1.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    reference: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Ordered', 'Received'],
        required: true
    },
    attachDocument: {
        url: String,
        publicId: String
    },
    supplier: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    items: [
        {
            product_name: {
                type: String,
                required: true
            },
            product_code: {
                type: String,
                required: true
            },
            product_id: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            unit_price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            discount: {
                type: Number,
                default: 0
            },
            tax: {
                type: Number,
                default: 0
            },
            sub_total: {
                type: Number,
                required: true
            }
        }
    ],
    orderTax: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tax'
    },
    discount: {
        type: Number,
        default: 0
    },
    shipping: {
        type: Number,
        default: 0
    },
    paymentTerms: {
        type: String
    },
    note: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Virtuals for computed fields
purchaseSchema.virtual('total').get(function () {
    return this.items.reduce((total, item) => total + item.sub_total, 0);
});
purchaseSchema.virtual('total_quantity').get(function () {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});
purchaseSchema.virtual('total_tax').get(function () {
    if (!this.orderTax) {
        return 0;
    }
    const thisModel = this;
    if (thisModel.orderTax.type === 'Fixed') {
        return thisModel.orderTax.rate;
    }
    else if (thisModel.orderTax.type === 'Percentage') {
        return parseFloat((thisModel.total * (thisModel.orderTax.rate / 100)).toFixed(2));
    }
    return 0;
});
purchaseSchema.virtual('total_discount').get(function () {
    return this.items.reduce((total, item) => total + (item.discount || 0), 0);
});
purchaseSchema.virtual('grand_total').get(function () {
    return this.total + (this.shipping || 0) - this.total_discount + this.total_tax;
});
// Export the model
const Purchase = (0, mongoose_1.model)('Purchase', purchaseSchema);
exports.default = Purchase;
