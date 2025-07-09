import * as fs from 'fs';
import * as path from 'path';
import {
  interfaceTemplate,
  controllerTemplate,
  serviceTemplate,
  modelTemplate,
  routerTemplate,
  validationTemplate,
  swaggerTemplate
} from '../templates/module-templates';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Please provide a module name.');
  process.exit(1);
}

const moduleFolderPath = path.join(
  process.cwd(), // Current working directory
  'src/app/modules',
  moduleName
);

const filesToCreate = [
  {
    fileName: `${moduleName}.interface.ts`,
    template: interfaceTemplate
  },
  {
    fileName: `${moduleName}.controller.ts`,
    template: controllerTemplate
  },
  {
    fileName: `${moduleName}.service.ts`,
    template: serviceTemplate
  },
  {
    fileName: `${moduleName}.model.ts`,
    template: modelTemplate
  },
  {
    fileName: `${moduleName}.router.ts`,
    template: routerTemplate
  },
  {
    fileName: `${moduleName}.validation.ts`,
    template: validationTemplate
  },
  {
    fileName: `${moduleName}.swagger.yaml`,
    template: swaggerTemplate
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
      .replace(
        /{{moduleNameUpperCase}}/g,
        moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
      );

    fs.writeFileSync(path.join(moduleFolderPath, fileName), fileContent);
  });

  console.log(`Module '${moduleName}' created successfully.`);
}

if (fs.existsSync(moduleFolderPath)) {
  console.error(`Module '${moduleName}' already exists.`);
} else {
  createFiles();
}
