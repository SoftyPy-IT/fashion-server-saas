"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionStyle = exports.SectionStatus = exports.SectionType = void 0;
var SectionType;
(function (SectionType) {
    SectionType["Product"] = "product";
    SectionType["Banner"] = "banner";
})(SectionType || (exports.SectionType = SectionType = {}));
var SectionStatus;
(function (SectionStatus) {
    SectionStatus["Active"] = "active";
    SectionStatus["Inactive"] = "inactive";
})(SectionStatus || (exports.SectionStatus = SectionStatus = {}));
var SectionStyle;
(function (SectionStyle) {
    SectionStyle["Grid"] = "grid";
    SectionStyle["Carousel"] = "carousel";
})(SectionStyle || (exports.SectionStyle = SectionStyle = {}));
