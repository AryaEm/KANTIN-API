"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log("JWT_SECRET ENTRY:", process.env.JWT_SECRET);
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const user_route_1 = __importDefault(require("./routers/user_route"));
const menu_route_1 = __importDefault(require("./routers/menu_route"));
const diskon_route_1 = __importDefault(require("./routers/diskon_route"));
const order_route_1 = __importDefault(require("./routers/order_route"));
const global_1 = require("./global");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://kantin-plus.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", (0, cors_1.default)());
app.use(express_1.default.json());
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Ordering System API',
            version: '1.0.0',
            description: 'API documentation for the ordering system',
        },
        servers: [
            {
                url: `http://localhost:${global_1.PORT}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routers/*.ts'],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
app.use("/foto_menu", express_1.default.static(path_1.default.join(__dirname, "..", "public", "foto_menu")));
app.use(`/user`, user_route_1.default);
app.use(`/menu`, menu_route_1.default);
app.use(`/diskon`, diskon_route_1.default);
app.use(`/order`, order_route_1.default);
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
app.listen(global_1.PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${global_1.PORT}`);
});
