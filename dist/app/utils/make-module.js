"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const module_templates_1 = require("../templates/module-templates");
const moduleName = process.argv[2];
if (!moduleName) {
    console.error('Please provide a module name.');
    process.exit(1);
}
const moduleFolderPath = path.join(process.cwd(), // Current working directory
'src/app/modules', moduleName);
const filesToCreate = [
    {
        fileName: `${moduleName}.interface.ts`,
        template: module_templates_1.interfaceTemplate
    },
    {
        fileName: `${moduleName}.controller.ts`,
        template: module_templates_1.controllerTemplate
    },
    {
        fileName: `${moduleName}.service.ts`,
        template: module_templates_1.serviceTemplate
    },
    {
        fileName: `${moduleName}.model.ts`,
        template: module_templates_1.modelTemplate
    },
    {
        fileName: `${moduleName}.router.ts`,
        template: module_templates_1.routerTemplate
    },
    {
        fileName: `${moduleName}.validation.ts`,
        template: module_templates_1.validationTemplate
    },
    {
        fileName: `${moduleName}.swagger.yaml`,
        template: module_templates_1.swaggerTemplate
    }
];
function createFiles() {
    // Create module folder
    fs.mkdirSync(moduleFolderPath);
    // Create files with template content
    filesToCreate.forEach(({ fileName, template }) => {
        // Replace placeholders in template with actual module name
        const fileContent = template
            .replace(/{{moduleName}}/g, moduleName)
            .replace(/{{moduleNameUpperCase}}/g, moduleName.charAt(0).toUpperCase() + moduleName.slice(1));
        fs.writeFileSync(path.join(moduleFolderPath, fileName), fileContent);
    });
    console.log(`Module '${moduleName}' created successfully.`);
}
if (fs.existsSync(moduleFolderPath)) {
    console.error(`Module '${moduleName}' already exists.`);
}
else {
    createFiles();
}
