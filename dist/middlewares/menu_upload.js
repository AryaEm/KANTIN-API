"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const folderPath = path_1.default.join(__dirname, "../../public/foto_menu");
if (!fs_1.default.existsSync(folderPath)) {
    fs_1.default.mkdirSync(folderPath, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const uploadMenuFile = (0, multer_1.default)({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
});
exports.default = uploadMenuFile;
