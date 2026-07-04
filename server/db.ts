import fs from 'fs';
import path from 'path';

// Define TS Types for our Core Data Models
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Profile {
  userId: string;
  name: string;
  targetCareer: string;
  goals: string;
  currentSkills: string[];
  strengths: string[];
  weaknesses: string[];
  updatedOn: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'active' | 'completed';
  type: 'concept' | 'project' | 'quiz' | 'interview';
  order: number;
  duration: string;
  skillsAcquired: string[];
  resources: string[];
}

export interface LearningPath {
  userId: string;
  nodes: RoadmapNode[];
  targetCareer: string;
  currentProgress: number; // 0 to 100
  updatedOn: string;
}

export interface Assessment {
  userId: string;
  careerObjective: string;
  results: {
    topic: string;
    rating: number; // 1 to 5
    description: string;
  }[];
  missingSkills: string[];
  recommendedPath: string;
  createdOn: string;
}

export interface Progress {
  userId: string;
  completedNodes: string[];
  totalQuizzesTaken: number;
  averageQuizScore: number;
  projectsCompleted: number;
  interviewsCompleted: number;
  updatedOn: string;
}

export interface ProjectMilestone {
  title: string;
  desc: string;
  status: 'pending' | 'completed';
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  skills: string[];
  technologies: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  milestones: ProjectMilestone[];
  status: 'not_started' | 'in_progress' | 'submitted' | 'completed';
  submissionLink?: string;
  feedback?: string;
  score?: number;
  createdOn: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  hint: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  userId: string;
  nodeId?: string;
  title: string;
  difficulty: string;
  questions: QuizQuestion[];
  results?: {
    score: number; // percentage
    answers: number[]; // student answers indexes
    passed: boolean;
  };
  createdOn: string;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  size: number;
  chunkCount: number;
  textContent: string;
  createdOn: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  agentType: string; // 'tutor' | 'profile' | 'roadmap' | 'gap' etc.
  messages: Message[];
  updatedOn: string;
}

export interface InterviewAnswer {
  question: string;
  answer: string;
  feedback: string;
  score: number; // 0 to 100
}

export interface Interview {
  id: string;
  userId: string;
  careerTarget: string;
  questions: string[];
  currentQuestionIndex: number;
  answers: InterviewAnswer[];
  overallScore?: number;
  overallFeedback?: string;
  status: 'active' | 'completed';
  createdOn: string;
}

// Full Database Schema Representation
interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  learning_paths: LearningPath[];
  assessments: Assessment[];
  progress: Progress[];
  projects: Project[];
  quizzes: Quiz[];
  documents: DocumentRecord[];
  conversations: Conversation[];
  interviews: Interview[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class JSONDatabase {
  private db: DatabaseSchema = {
    users: [],
    profiles: [],
    learning_paths: [],
    assessments: [],
    progress: [],
    projects: [],
    quizzes: [],
    documents: [],
    conversations: [],
    interviews: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = { ...this.db, ...JSON.parse(data) };
      } else {
        this.save();
      }
    } catch (error) {
      console.error('Error initializing Local JSON DB:', error);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving Local JSON DB:', error);
    }
  }

  // General Generic CRUD Methods
  public getCollection<K extends keyof DatabaseSchema>(collectionName: K): DatabaseSchema[K] {
    return this.db[collectionName];
  }

  public setCollection<K extends keyof DatabaseSchema>(collectionName: K, data: DatabaseSchema[K]) {
    this.db[collectionName] = data;
    this.save();
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.getCollection('users');
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id || u.email === user.email);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setCollection('users', users);
  }

  // --- Profiles ---
  public getProfile(userId: string): Profile | undefined {
    return this.getCollection('profiles').find((p) => p.userId === userId);
  }

  public saveProfile(profile: Profile): void {
    const profiles = this.getCollection('profiles');
    const index = profiles.findIndex((p) => p.userId === profile.userId);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    this.setCollection('profiles', profiles);
  }

  // --- Learning Paths ---
  public getLearningPath(userId: string): LearningPath | undefined {
    return this.getCollection('learning_paths').find((lp) => lp.userId === userId);
  }

  public saveLearningPath(lp: LearningPath): void {
    const lps = this.getCollection('learning_paths');
    const index = lps.findIndex((item) => item.userId === lp.userId);
    if (index >= 0) {
      lps[index] = lp;
    } else {
      lps.push(lp);
    }
    this.setCollection('learning_paths', lps);
  }

  // --- Assessments ---
  public getAssessment(userId: string): Assessment | undefined {
    return this.getCollection('assessments').find((a) => a.userId === userId);
  }

  public saveAssessment(assessment: Assessment): void {
    const assessments = this.getCollection('assessments');
    const index = assessments.findIndex((a) => a.userId === assessment.userId);
    if (index >= 0) {
      assessments[index] = assessment;
    } else {
      assessments.push(assessment);
    }
    this.setCollection('assessments', assessments);
  }

  // --- Progress ---
  public getProgress(userId: string): Progress {
    let progress = this.getCollection('progress').find((p) => p.userId === userId);
    if (!progress) {
      progress = {
        userId,
        completedNodes: [],
        totalQuizzesTaken: 0,
        averageQuizScore: 0,
        projectsCompleted: 0,
        interviewsCompleted: 0,
        updatedOn: new Date().toISOString(),
      };
      this.saveProgress(progress);
    }
    return progress;
  }

  public saveProgress(progress: Progress): void {
    const progresses = this.getCollection('progress');
    const index = progresses.findIndex((p) => p.userId === progress.userId);
    if (index >= 0) {
      progresses[index] = progress;
    } else {
      progresses.push(progress);
    }
    this.setCollection('progress', progresses);
  }

  // --- Projects ---
  public getProjects(userId: string): Project[] {
    return this.getCollection('projects').filter((p) => p.userId === userId);
  }

  public getProject(projectId: string): Project | undefined {
    return this.getCollection('projects').find((p) => p.id === projectId);
  }

  public saveProject(project: Project): void {
    const projects = this.getCollection('projects');
    const index = projects.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    this.setCollection('projects', projects);
  }

  // --- Quizzes ---
  public getQuizzes(userId: string): Quiz[] {
    return this.getCollection('quizzes').filter((q) => q.userId === userId);
  }

  public getQuiz(quizId: string): Quiz | undefined {
    return this.getCollection('quizzes').find((q) => q.id === quizId);
  }

  public saveQuiz(quiz: Quiz): void {
    const quizzes = this.getCollection('quizzes');
    const index = quizzes.findIndex((q) => q.id === quiz.id);
    if (index >= 0) {
      quizzes[index] = quiz;
    } else {
      quizzes.push(quiz);
    }
    this.setCollection('quizzes', quizzes);
  }

  // --- Documents ---
  public getDocuments(userId: string): DocumentRecord[] {
    return this.getCollection('documents').filter((d) => d.userId === userId);
  }

  public saveDocument(doc: DocumentRecord): void {
    const docs = this.getCollection('documents');
    docs.push(doc);
    this.setCollection('documents', docs);
  }

  // --- Conversations ---
  public getConversation(userId: string, agentType: string): Conversation {
    let conv = this.getCollection('conversations').find((c) => c.userId === userId && c.agentType === agentType);
    if (!conv) {
      conv = {
        id: `conv_${userId}_${agentType}`,
        userId,
        agentType,
        messages: [],
        updatedOn: new Date().toISOString(),
      };
      this.saveConversation(conv);
    }
    return conv;
  }

  public saveConversation(conv: Conversation): void {
    const convs = this.getCollection('conversations');
    const index = convs.findIndex((c) => c.id === conv.id);
    if (index >= 0) {
      convs[index] = conv;
    } else {
      convs.push(conv);
    }
    this.setCollection('conversations', convs);
  }

  // --- Interviews ---
  public getInterviews(userId: string): Interview[] {
    return this.getCollection('interviews').filter((i) => i.userId === userId);
  }

  public getInterview(interviewId: string): Interview | undefined {
    return this.getCollection('interviews').find((i) => i.id === interviewId);
  }

  public saveInterview(interview: Interview): void {
    const interviews = this.getCollection('interviews');
    const index = interviews.findIndex((i) => i.id === interview.id);
    if (index >= 0) {
      interviews[index] = interview;
    } else {
      interviews.push(interview);
    }
    this.setCollection('interviews', interviews);
  }

  public resetUser(userId: string): void {
    this.db.users = this.db.users.filter((u) => u.id !== userId);
    this.db.profiles = this.db.profiles.filter((p) => p.userId !== userId);
    this.db.learning_paths = this.db.learning_paths.filter((lp) => lp.userId !== userId);
    this.db.assessments = this.db.assessments.filter((a) => a.userId !== userId);
    this.db.progress = this.db.progress.filter((p) => p.userId !== userId);
    this.db.projects = this.db.projects.filter((p) => p.userId !== userId);
    this.db.quizzes = this.db.quizzes.filter((q) => q.userId !== userId);
    this.db.documents = this.db.documents.filter((d) => d.userId !== userId);
    this.db.conversations = this.db.conversations.filter((c) => c.userId !== userId);
    this.db.interviews = this.db.interviews.filter((i) => i.userId !== userId);
    this.save();
  }
}

export const db = new JSONDatabase();
