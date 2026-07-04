import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import { db, User } from './db';
import { processDocument, queryRAG } from './rag';
import { ProfileAgent, SkillGapAgent, LearningPathAgent, TutorAgent, PracticeAgent, ProjectAgent, InterviewAgent, ProgressAgent } from './agents';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to extract and authenticate user from Authorization header
function authenticate(req: Request, res: Response): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token format. Please log in.' });
    return null;
  }
  const userId = authHeader.split(' ')[1];
  const users = db.getUsers();
  const exists = users.find((u) => u.id === userId);
  if (!exists) {
    res.status(401).json({ error: 'Unauthorized: User does not exist.' });
    return null;
  }
  return userId;
}

// ==========================================
// 1. AUTHENTICATION
// ==========================================

// POST /register
router.post('/register', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const users = db.getUsers();
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    res.status(400).json({ error: 'A user with this email already exists.' });
    return;
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    passwordHash: password, // For hackathon preview, we keep plain password storage or simple hashing
    createdAt: new Date().toISOString(),
  };

  db.saveUser(newUser);

  // Return user info and simulated token (user ID acts as the bearer token)
  res.status(201).json({
    message: 'Registration successful!',
    token: newUser.id,
    user: { id: newUser.id, email: newUser.email },
  });
});

// POST /login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const users = db.getUsers();
  const user = users.find((u) => u.email === email && u.passwordHash === password);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  res.json({
    message: 'Login successful!',
    token: user.id,
    user: { id: user.id, email: user.email },
  });
});

// POST /reset-account (Completely wipe user account and associated information)
router.post('/reset-account', (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  try {
    db.resetUser(userId);
    res.json({ message: 'Your account and learning history have been completely reset.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reset user account.' });
  }
});

// ==========================================
// 2. STUDENT PROFILE
// ==========================================

// GET /profile
router.get('/profile', (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const profile = db.getProfile(userId);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found. Please complete profile registration.' });
    return;
  }

  res.json(profile);
});

// POST /profile (Save/Create Profile & Analyze via ProfileAgent)
router.post('/profile', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const { name, targetCareer, goals, rawBackground } = req.body;
  if (!name || !targetCareer || !goals || !rawBackground) {
    res.status(400).json({ error: 'Name, targetCareer, goals, and rawBackground are required.' });
    return;
  }

  try {
    const profile = await ProfileAgent.analyzeAndSaveProfile(userId, {
      name,
      targetCareer,
      goals,
      rawBackground,
    });
    res.status(201).json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal error in ProfileAgent.' });
  }
});

// ==========================================
// 3. SKILL ASSESSMENT
// ==========================================

// POST /assessment (Run skill gap agent assessment)
router.post('/assessment', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  try {
    const report = await SkillGapAgent.identifySkillGaps(userId);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error running skill gap assessment.' });
  }
});

// GET /assessment (Retrieve current assessment results)
router.get('/assessment', (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const assessment = db.getAssessment(userId);
  if (!assessment) {
    res.status(404).json({ error: 'No assessment found. Run POST /api/assessment first.' });
    return;
  }

  res.json(assessment);
});

// ==========================================
// 4. LEARNING ROADMAP
// ==========================================

// GET /roadmap (Fetch learning path roadmap)
router.get('/roadmap', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  let lp = db.getLearningPath(userId);
  if (!lp) {
    // Auto-generate roadmap if none exists but profile does
    const profile = db.getProfile(userId);
    if (profile) {
      try {
        lp = await LearningPathAgent.generateRoadmap(userId);
      } catch (err: any) {
        res.status(500).json({ error: 'Failed to auto-generate learning roadmap.' });
        return;
      }
    } else {
      res.status(404).json({ error: 'Please create profile and goals first.' });
      return;
    }
  }

  res.json(lp);
});

// POST /roadmap (Generate fresh/regenerate roadmap)
router.post('/roadmap', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  try {
    const lp = await LearningPathAgent.generateRoadmap(userId);
    res.json(lp);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate learning path.' });
  }
});

// POST /roadmap/complete-node (Force/Complete a Concept node)
router.post('/roadmap/complete-node', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const { nodeId } = req.body;
  if (!nodeId) {
    res.status(400).json({ error: 'nodeId is required.' });
    return;
  }

  try {
    const lp = await ProgressAgent.completeConceptNode(userId, nodeId);
    res.json({ message: 'Node completed successfully!', roadmap: lp });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to complete node.' });
  }
});

// ==========================================
// 5. AI TUTOR CHAT
// ==========================================

// GET /chat (Get current chat messages history)
router.get('/chat', (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const conversation = db.getConversation(userId, 'tutor');
  res.json(conversation);
});

// POST /chat (Ask Tutor Agent a question with RAG support)
router.post('/chat', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Message is required.' });
    return;
  }

  try {
    const responseText = await TutorAgent.teachConcept(userId, message);
    res.json({ response: responseText });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error processing tutor response.' });
  }
});

// ==========================================
// 6. PRACTICE QUIZ
// ==========================================

// POST /quiz (Generate Quiz for a specific node)
router.post('/quiz', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const { nodeId } = req.body;
  if (!nodeId) {
    res.status(400).json({ error: 'nodeId is required.' });
    return;
  }

  try {
    const quiz = await PracticeAgent.generateQuiz(userId, nodeId);
    res.json(quiz);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error generating practice quiz.' });
  }
});

// GET /quiz/:quizId (Retrieve quiz by ID)
router.get('/quiz/:quizId', (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const quiz = db.getQuiz(req.params.quizId);
  if (!quiz) {
    res.status(404).json({ error: 'Quiz not found.' });
    return;
  }

  res.json(quiz);
});

// POST /quiz/submit (Submit quiz answers and score results)
router.post('/quiz/submit', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const { quizId, answers } = req.body; // array of number answers indices
  if (!quizId || !Array.isArray(answers)) {
    res.status(400).json({ error: 'quizId and answers array are required.' });
    return;
  }

  const quiz = db.getQuiz(quizId);
  if (!quiz) {
    res.status(404).json({ error: 'Quiz not found.' });
    return;
  }

  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    if (answers[idx] === q.answerIndex) {
      correctCount++;
    }
  });

  const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = scorePercentage >= 60;

  quiz.results = {
    score: scorePercentage,
    answers,
    passed,
  };

  db.saveQuiz(quiz);

  // Trigger ProgressAgent to sync state and potentially unlock the next node
  try {
    await ProgressAgent.updateProgressAndRoadmap(userId);
  } catch (err) {
    console.error('Error updating progress on quiz submit:', err);
  }

  res.json({
    message: 'Quiz submitted successfully!',
    results: quiz.results,
    questions: quiz.questions, // contains answers and explanations for correction
  });
});

// ==========================================
// 7. PROJECTS
// ==========================================

// GET /project (Get user recommended projects)
router.get('/project', (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const projects = db.getProjects(userId);
  res.json(projects);
});

// POST /project (Generate/Recommend project for a nodeId)
router.post('/project', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const { nodeId } = req.body;
  if (!nodeId) {
    res.status(400).json({ error: 'nodeId is required.' });
    return;
  }

  try {
    const project = await ProjectAgent.recommendProject(userId, nodeId);
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error recommending project.' });
  }
});

// POST /project/submit (Submit project GitHub link & description)
router.post('/project/submit', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const { projectId, submissionLink, description } = req.body;
  if (!projectId || !submissionLink || !description) {
    res.status(400).json({ error: 'projectId, submissionLink, and description are required.' });
    return;
  }

  try {
    const updatedProject = await ProjectAgent.reviewProjectSubmission(projectId, submissionLink, description);
    res.json({
      message: 'Project graded and marked complete!',
      project: updatedProject,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error reviewing project submission.' });
  }
});

// ==========================================
// 8. MOCK INTERVIEWS
// ==========================================

// POST /interview (Start a fresh Interview loop session)
router.post('/interview', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  try {
    const interview = await InterviewAgent.startInterview(userId);
    res.json(interview);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error starting mock interview.' });
  }
});

// POST /interview/answer (Submit answer to current interview question)
router.post('/interview/answer', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const { interviewId, answer } = req.body;
  if (!interviewId || !answer) {
    res.status(400).json({ error: 'interviewId and answer text are required.' });
    return;
  }

  try {
    const updatedInterview = await InterviewAgent.submitAnswer(interviewId, answer);
    res.json(updatedInterview);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error recording interview answer.' });
  }
});

// GET /interview (Retrieve past and current interview sessions)
router.get('/interview', (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const interviews = db.getInterviews(userId);
  res.json(interviews);
});

// ==========================================
// 9. PROGRESS DASHBOARD
// ==========================================

// GET /progress
router.get('/progress', (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const progress = db.getProgress(userId);
  res.json(progress);
});

// ==========================================
// 10. DOCUMENT UPLOAD & RAG
// ==========================================

// POST /upload (Upload PDF or text for RAG chunking & embeddings extraction)
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded.' });
    return;
  }

  try {
    const docRecord = await processDocument(
      userId,
      req.file.originalname,
      req.file.mimetype,
      req.file.buffer
    );

    res.status(201).json({
      message: 'File uploaded and parsed into Vector Store successfully!',
      document: docRecord,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to process document in RAG engine.' });
  }
});

// GET /documents (Get lists of uploaded files)
router.get('/documents', (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const docs = db.getDocuments(userId);
  res.json(docs);
});

// POST /rag (Direct query matching diagnostic API)
router.post('/rag', async (req: Request, res: Response) => {
  const userId = authenticate(req, res);
  if (!userId) return;

  const { query } = req.body;
  if (!query) {
    res.status(400).json({ error: 'Query parameter is required.' });
    return;
  }

  const chunks = await queryRAG(userId, query);
  res.json({ query, matchedChunks: chunks });
});

export default router;
