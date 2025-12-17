import multer from "multer";
import path from "path";
import fs from "fs";

// Create folder if not exists
const equipmentDir = path.join(process.cwd(), "uploads", "equipment");
if (!fs.existsSync(equipmentDir)) fs.mkdirSync(equipmentDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, equipmentDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;
