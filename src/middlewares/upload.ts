import multer from "multer";
import path from "path";


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, "../../public/foto_siswa");
        console.log("SAVING TO:", dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + "-" + file.originalname;
        console.log("FILENAME:", filename);
        cb(null, filename);
    }
});


const uploadFile = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, //LIMIT UKURAN FILE ()
})

export default uploadFile
