"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_seed_1 = __importDefault(require("./seeds/admin.seed"));
const storefront_seed_1 = __importDefault(require("./seeds/storefront.seed"));
const variants_seed_1 = __importDefault(require("./seeds/variants.seed"));
const tax_seed_1 = __importDefault(require("./seeds/tax.seed"));
const unit_seed_1 = __importDefault(require("./seeds/unit.seed"));
const seeders = [admin_seed_1.default, storefront_seed_1.default, variants_seed_1.default, tax_seed_1.default, unit_seed_1.default];
exports.default = seeders;
