"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const section_interface_1 = require("./section.interface");
const imageSchema = new mongoose_1.Schema({
    desktop: {
        type: [
            {
                url: { type: String, required: true },
                link: { type: String, required: true }
            }
        ],
        required: false
    },
    mobile: {
        type: [
            {
                url: { type: String, required: true },
                link: { type: String, required: true }
            }
        ],
        required: false
    }
}, { _id: false });
const sectionSchema = new mongoose_1.Schema({
    title: { type: String, required: false },
    subTitle: { type: String, required: false },
    description: { type: String, required: false },
    images: { type: imageSchema, required: false },
    products: [{ type: mongoose_1.Types.ObjectId, ref: 'Product', required: false }],
    status: { type: String, enum: section_interface_1.SectionStatus, default: section_interface_1.SectionStatus.Active },
    type: { type: String, enum: section_interface_1.SectionType, required: true },
    style: { type: String, enum: section_interface_1.SectionStyle, default: section_interface_1.SectionStyle.Grid },
    row: { type: Number, default: 4 }
}, {
    timestamps: true
});
const Section = (0, mongoose_1.model)('Section', sectionSchema);
exports.default = Section;
