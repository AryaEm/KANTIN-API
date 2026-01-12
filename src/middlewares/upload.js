"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dest = path_1.default.join(__dirname, "../../public/foto_siswa");
        console.log("SAVING TO:", dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + "-" + file.originalname;
        console.log("FILENAME:", filename);
        cb(null, filename);
    }
});
const uploadFile = (0, multer_1.default)({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, //LIMIT UKURAN FILE ()
});
exports.default = uploadFile;
