import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Rename file to include extension so OpenAI knows the format
    const originalName = req.file.originalname;
    const extension = path.extname(originalName);
    filePath = req.file.path + extension;
    fs.renameSync(req.file.path, filePath);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
    });

    // Clean up the uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ text: transcription.text });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    // Clean up file if error occurs
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    } else if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

export default router;
