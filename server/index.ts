import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { DeepgramService } from './services/deepgram';
import { GroqService } from './services/groq';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to accept only audio/video files
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mp4',
    'audio/m4a',
    'audio/ogg',
    'audio/webm',
    'video/mp4',
    'video/mpeg',
    'video/webm',
    'video/quicktime',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only audio/video files are allowed.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Initialize services
const deepgramService = new DeepgramService();
const groqService = new GroqService();

// Create nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '14soulemanesow@gmail.com',
    pass: process.env.EMAIL_PASSWORD || '', // Gmail App Password
  },
});

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'One-Take Studio API is running' });
});

/**
 * POST /api/transcribe
 * Upload an audio/video file and get back structured transcript chunks
 */
app.post('/api/transcribe', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload an audio or video file',
      });
    }

    console.log(`[API] Received file: ${req.file.originalname}`);
    console.log(`[API] File size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`[API] Mime type: ${req.file.mimetype}`);

    // Get options from request body
    const chunkDuration = parseInt(req.body.chunkDuration) || 30;
    const usePauseBasedChunking = req.body.usePauseBasedChunking === 'true';

    console.log(`[API] Chunk duration: ${chunkDuration}s`);
    console.log(`[API] Use pause-based chunking: ${usePauseBasedChunking}`);

    // Transcribe the file
    const transcript = await deepgramService.transcribeFile(req.file.path, {
      chunkDuration,
      usePauseBasedChunking,
      useSmartFormat: true,
      model: 'nova-3',
    });

    // Analyze with Groq AI (optional - won't fail if Groq has issues)
    let analysis = null;
    let tiktokScripts = [];
    let twitterThreads = [];
    let linkedinPosts = [];
    let newsletters = [];

    try {
      console.log('[API] Analyzing transcript with Groq AI...');
      analysis = await groqService.analyzeTranscript(transcript);
      console.log('[API] Analysis complete');

      // Generate all content types in parallel for speed
      if (analysis) {
        console.log('[API] Generating all content types...');
        const [tiktok, twitter, linkedin, newsletter] = await Promise.all([
          groqService.generateTikTokScripts(transcript, analysis),
          groqService.generateTwitterThreads(transcript, analysis),
          groqService.generateLinkedInPosts(transcript, analysis),
          groqService.generateNewsletter(transcript, analysis),
        ]);

        tiktokScripts = tiktok;
        twitterThreads = twitter;
        linkedinPosts = linkedin;
        newsletters = newsletter;

        console.log(`[API] Generated: ${tiktokScripts.length} TikToks, ${twitterThreads.length} Threads, ${linkedinPosts.length} LinkedIn, ${newsletters.length} Newsletter`);
      }
    } catch (analysisError: any) {
      console.error('[API] Groq analysis failed (continuing without it):', analysisError.message);
      // Continue without analysis - we'll still have the transcript
    }

    // Clean up: delete the uploaded file
    try {
      fs.unlinkSync(req.file.path);
      console.log(`[API] Deleted temporary file: ${req.file.path}`);
    } catch (cleanupError) {
      console.error('[API] Error deleting temporary file:', cleanupError);
    }

    // Return the structured transcript, analysis, and generated content
    res.json({
      success: true,
      data: {
        transcript,
        analysis,
        generatedContent: {
          tiktok: tiktokScripts,
          twitter: twitterThreads,
          linkedin: linkedinPosts,
          newsletter: newsletters,
        },
      },
    });
  } catch (error: any) {
    console.error('[API] Error processing transcription:', error);

    // Clean up file if it exists
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({
      error: 'Transcription failed',
      message: error.message || 'An unknown error occurred',
    });
  }
});

/**
 * POST /api/transcribe-url
 * Transcribe an audio/video file from a URL
 */
app.post('/api/transcribe-url', async (req: Request, res: Response) => {
  try {
    const { url, chunkDuration, usePauseBasedChunking } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'No URL provided',
        message: 'Please provide a URL to an audio or video file',
      });
    }

    console.log(`[API] Transcribing from URL: ${url}`);

    // Transcribe the URL
    const result = await deepgramService.transcribeUrl(url, {
      chunkDuration: chunkDuration || 30,
      usePauseBasedChunking: usePauseBasedChunking || false,
      useSmartFormat: true,
      model: 'nova-3',
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API] Error processing URL transcription:', error);

    res.status(500).json({
      error: 'Transcription failed',
      message: error.message || 'An unknown error occurred',
    });
  }
});

/**
 * POST /api/send-newsletter
 * Send a newsletter email using Nodemailer (Gmail)
 */
app.post('/api/send-newsletter', async (req: Request, res: Response) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide to, subject, and body',
      });
    }

    console.log(`[API] Sending newsletter to: ${to}`);

    // Check if email credentials are configured
    if (!process.env.EMAIL_PASSWORD) {
      console.error('[API] EMAIL_PASSWORD not configured');
      return res.status(500).json({
        error: 'Email service not configured',
        message: 'Please configure EMAIL_PASSWORD in environment variables',
      });
    }

    // Send email using nodemailer
    const info = await transporter.sendMail({
      from: `One-Take Studio <${process.env.EMAIL_USER || '14soulemanesow@gmail.com'}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text: body,
      html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${body}</pre>`,
    });

    console.log(`[API] Newsletter sent successfully, Message ID: ${info.messageId}`);

    res.json({
      success: true,
      data: {
        messageId: info.messageId,
        message: 'Newsletter sent successfully',
      },
    });
  } catch (error: any) {
    console.error('[API] Error sending newsletter:', error);

    res.status(500).json({
      error: 'Server error',
      message: error.message || 'An unknown error occurred',
    });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[API] Unhandled error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Maximum file size is 100MB',
      });
    }
  }

  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unknown error occurred',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 One-Take Studio API Server`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🎤 Ready to transcribe audio/video files\n`);
});
