"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const config_1 = __importDefault(require("../config"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Softypy E-commerce API Documentation',
            version: '1.0.0',
            description: 'This api is for an e-commerce application. This is a RESTful API. It is built with Node.js, Express, and MongoDB. It is documented with Swagger.',
            contact: {
                name: 'Softypy',
                url: 'https://softypy.com',
                email: 'softypy@gmail.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${config_1.default.PORT}/api/v1`,
                description: 'Development server'
            },
            {
                url: `https://e-soft-server.vercel.app/api/v1`,
                description: 'Production server'
            }
        ]
    },
    apis: ['src/app/modules/**/*.swagger.yaml']
};
exports.specs = (0, swagger_jsdoc_1.default)(options);
