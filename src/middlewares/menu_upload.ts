import multer from "multer";
import path from "path";
import fs from "fs";

const folderPath = path.join(__dirname, "../../public/foto_menu");

if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const uploadMenuFile = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
});

export default uploadMenuFile;
