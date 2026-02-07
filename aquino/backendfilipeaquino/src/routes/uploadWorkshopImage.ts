// @ts-nocheck
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

export const uploadWorkshopImageRouter = Router();

// Importante: o index.ts serve arquivos estáticos de
// path.join(__dirname, "..", "uploads"), onde __dirname é "src".
// Portanto, precisamos salvar em backend/uploads/workshops, não em src/uploads.
const uploadDir = path.join(__dirname, "..", "..", "uploads", "workshops");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "_");
        const timestamp = Date.now();
        cb(null, `${base}-${timestamp}${ext}`);
    },
});

const upload = multer({ storage });

// POST /api/admin/upload-workshop-image
uploadWorkshopImageRouter.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo enviado" });
        }

        const relativeUrl = `/uploads/workshops/${req.file.filename}`;

        res.json({ imageUrl: relativeUrl });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erro ao enviar imagem" });
    }
});
