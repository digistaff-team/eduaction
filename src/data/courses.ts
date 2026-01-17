import { Course } from '../types';

export const COURSES: Course[] = [
  {
    id: '1',
    title: "Effective Leadership in the AI Era",
    instructor: "Dr. Sarah Chen",
    duration: "4h 30m",
    category: "Management",
    progress: 75,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400",
    startedDate: "2026-01-05",
    lastAccessDate: "2026-01-15",
    averageScore: 88,
    modules: [
      { 
        id: 'm1', 
        title: "Understanding AI Dynamics", 
        completed: true,
        completedDate: "2026-01-08",
        content: "AI is reshaping leadership by automating routine tasks, allowing leaders to focus on strategy and empathy.",
        quiz: {
          id: 'q1',
          title: "Quiz: AI Leadership Basics",
          questions: [
            {
              id: 'q1_1',
              text: "Which leadership style is most emphasized for the AI era?",
              options: ["Transactional", "Transformational", "Autocratic", "Laissez-faire"],
              correctAnswer: 1
            },
            {
              id: 'q1_2',
              text: "True or False: AI tools replace all human decision-making.",
              options: ["True", "False"],
              correctAnswer: 1
            }
          ]
        },
        quizResults: [
          { quizId: 'q1', score: 100, date: "2026-01-08", passed: true }
        ]
      },
      { 
        id: 'm2', 
        title: "Decision Making with Data", 
        completed: true,
        completedDate: "2026-01-12",
        content: "Data-driven decision making is crucial.",
        quizResults: [
          { quizId: 'q2', score: 75, date: "2026-01-12", passed: true }
        ]
      },
      { 
        id: 'm3', 
        title: "Ethical Considerations", 
        completed: false, 
        content: "Ethical frameworks for AI leadership." 
      },
    ]
  },
  {
    id: '2',
    title: "Corporate Cybersecurity Essentials",
    instructor: "Mark Volkov",
    duration: "2h 15m",
    category: "IT & Security",
    progress: 50,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400",
    startedDate: "2026-01-10",
    lastAccessDate: "2026-01-14",
    averageScore: 92,
    modules: [
      { 
        id: 'c1', 
        title: "Phishing & Social Engineering", 
        completed: true,
        completedDate: "2026-01-11",
        content: "90% of breaches start with phishing.",
        quizResults: [
          { quizId: 'qc1', score: 92, date: "2026-01-11", passed: true }
        ]
      },
      { 
        id: 'c2', 
        title: "Password Hygiene", 
        completed: false, 
        content: "Password management best practices." 
      },
    ]
  },
  {
    id: '3',
    title: "Agile Methodologies for Teams",
    instructor: "Jessica Wu",
    duration: "6h 00m",
    category: "Productivity",
    progress: 0,
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400",
    modules: [
      { id: 'a1', title: "Scrum Framework Basics", completed: false, content: "Introduction to Scrum." },
      { id: 'a2', title: "Kanban vs. Scrum", completed: false, content: "Workflow comparison." },
    ]
  }
];
