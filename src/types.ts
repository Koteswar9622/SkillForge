export interface User {
  id: string;
  email: string;
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
  currentProgress: number;
  updatedOn: string;
}

export interface AssessmentResult {
  topic: string;
  rating: number;
  description: string;
}

export interface Assessment {
  userId: string;
  careerObjective: string;
  results: AssessmentResult[];
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
    score: number;
    answers: number[];
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
  agentType: string;
  messages: Message[];
  updatedOn: string;
}

export interface InterviewAnswer {
  question: string;
  answer: string;
  feedback: string;
  score: number;
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
