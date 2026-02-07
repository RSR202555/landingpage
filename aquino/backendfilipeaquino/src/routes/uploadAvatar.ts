// @ts-nocheck
import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma";

export const uploadAvatarRouter = Router();

const uploadDir = path.join(__dirname, "..", "uploads", "avatars");

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

// POST /api/admin/upload-avatar
uploadAvatarRouter.post("/", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const relativeUrl = `/uploads/avatars/${req.file.filename}`;

    let setting = await prisma.setting.findFirst();
    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          avatarUrl: relativeUrl,
        },
      });
    } else {
      setting = await prisma.setting.update({
        where: { id: setting.id },
        data: { avatarUrl: relativeUrl },
      });
    }

    res.json({ avatarUrl: relativeUrl });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao enviar avatar" });
  }
});
