import { Module } from '../types';

const BOT_TOKEN = import.meta.env.VITE_PROTALK_BOT_TOKEN;
const BOT_ID = import.meta.env.VITE_PROTALK_BOT_ID;
const API_URL = import.meta.env.VITE_PROTALK_API_URL;

if (!BOT_TOKEN || !BOT_ID) {
  console.error('⚠️ Pro-Talk credentials не найдены!');
}

interface CourseGenerationParams {
  title: string;
  category: string;
  instructor: string;
  moduleCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Генерация уникального chat_id для каждого запроса
const generateChatId = () => `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const aiCourseGenerator = {
  async generateCourse(params: CourseGenerationParams): Promise<Module[]> {
    const modules: Module[] = [];

    for (let i = 0; i < params.moduleCount; i++) {
      if (i > 0) {
        console.log(`⏳ Пауза 5 секунд между модулями...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      const module = await this.generateModule(params, i + 1);
      modules.push(module);
    }

    return modules;
  },

  async generateModule(params: CourseGenerationParams, moduleNumber: number): Promise<Module> {
    if (!BOT_TOKEN || !BOT_ID) {
      return {
    id: `m_${Date.now()}_${moduleNumber}`, // Уникальный строковый ID
    title: moduleData.title,
    content: moduleData.content,
    completed: false,
    quiz: {
      id: `q_${Date.now()}_${moduleNumber}`, // Строковый ID
      title: moduleData.quiz.title,
      questions: moduleData.quiz.questions.map((q: any, idx: number) => ({
        id: `q${moduleNumber}_${idx + 1}`, // Строковый ID
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    }
  };
}

    const prompt = `
Твоя роль - эксперт-методолог по созданию учебных материалов для онлайн-курсов.
Создай образовательный модуль для курса "${params.title}" (категория: ${params.category}).
Используй обоснованный подход и проверенные временем лучшие практики.
Уровень сложности: ${params.difficulty}.
Это модуль номер ${moduleNumber} из ${params.moduleCount}.

Верни JSON в следующем формате (БЕЗ markdown, ТОЛЬКО JSON):
{
  "title": "Название модуля (краткое, до 50 символов)",
  "content": "Подробный образовательный контент модуля (200-300 слов на русском языке). Объясни концепции, дай примеры, добавь практические рекомендации. Используй HTML формат, только теги <b>, </b>, <i>, </i>",
  "quiz": {
    "title": "Квиз: Название модуля",
    "questions": [
      {
        "text": "Вопрос 1",
        "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
        "correctAnswer": 0
      },
      {
        "text": "Вопрос 2",
        "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
        "correctAnswer": 1
      },
      {
        "text": "Вопрос 3",
        "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
        "correctAnswer": 2
      },
{
        "text": "Вопрос 4",
        "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
        "correctAnswer": 4
      },
{
        "text": "Вопрос 5",
        "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
        "correctAnswer": 3
      }

    ]
  }
}
`;

    try {
      console.log(`🤖 Генерирую модуль ${moduleNumber}...`);
      
      const chatId = generateChatId();
      const response = await fetch(`${API_URL}/ask/${BOT_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: parseInt(BOT_ID),
          chat_id: chatId,
          message: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const text = data.done;
      
      console.log(`✅ Модуль ${moduleNumber} сгенерирован`);
      console.log(`📊 Длина ответа: ${text.length} символов`);
      
      // Очистка от markdown
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const moduleData = JSON.parse(jsonText);

      return {
        id: `m${moduleNumber}`,
        title: moduleData.title,
        content: moduleData.content,
        completed: false,
        quiz: {
          id: `q${moduleNumber}`,
          title: moduleData.quiz.title,
          questions: moduleData.quiz.questions.map((q: any, idx: number) => ({
            id: `q${moduleNumber}_${idx + 1}`,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer
          }))
        }
      };
    } catch (error: any) {
      console.error(`❌ Ошибка генерации модуля ${moduleNumber}:`, error);
      
      let errorMessage = 'Ошибка генерации';
      
      if (error.message?.includes('401')) {
        errorMessage = '⚠️ Неверный токен Pro-Talk. Проверьте credentials.';
      } else if (error.message?.includes('400')) {
        errorMessage = '⚠️ Неверный формат запроса к Pro-Talk API.';
      } else if (error.message?.includes('500')) {
        errorMessage = '⚠️ Внутренняя ошибка сервера Pro-Talk.';
      } else {
        errorMessage = `Ошибка: ${error.message}`;
      }
      
      return {
        id: `m${moduleNumber}`,
        title: `Модуль ${moduleNumber}`,
        content: errorMessage,
        completed: false
      };
    }
  }
};
