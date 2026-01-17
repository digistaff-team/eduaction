export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface QuizResult {
  quizId: string;
  score: number;
  date: string;
  passed: boolean;
}

export interface Module {
  id: string;
  title: string;
  completed: boolean;
  completedDate?: string;
  content: string;
  quiz?: Quiz;
  quizResults?: QuizResult[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  category: string;
  progress: number;
  image: string;
  modules: Module[];
  startedDate?: string;
  lastAccessDate?: string;
  averageScore?: number;
}

export interface CatalogCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  coursesCount: number;
  courses: CatalogCourse[];
}
