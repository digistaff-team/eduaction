import React, { useState } from 'react';
import { courseService } from '../services/courseService';
import { Icons } from './Icons';
import { Module } from '../types';

const BOT_TOKEN = import.meta.env.VITE_PROTALK_BOT_TOKEN;
const BOT_ID = import.meta.env.VITE_PROTALK_BOT_ID;
const API_URL = import.meta.env.VITE_PROTALK_API_URL;

export const CourseGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    category: '',
    duration: '',
    moduleCount: 3,
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    image: ''
  });

  const [generating, setGenerating] = useState(false);
  const [generatedModules, setGeneratedModules] = useState<Module[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateModuleWithProTalk = async (moduleNumber: number): Promise<Module> => {
    if (!BOT_TOKEN || !BOT_ID || !API_URL) {
      throw new Error('Pro-Talk credentials не настроены в .env.local');
    }

    const difficultyNames = {
      beginner: 'Начальный',
      intermediate: 'Средний',
      advanced: 'Продвинутый'
    };

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

    const chatId = `course_gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log(`🤖 Генерирую модуль ${moduleNumber} через Pro-Talk API...`);

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
      const text = data.done || data.response;

      if (!text) {
        throw new Error('Пустой ответ от API');
      }

      console.log(`✅ Модуль ${moduleNumber} сгенерирован`);

      // Очистка от markdown
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Попытка парсинга JSON
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

      // Fallback: возвращаем заглушку
      return {
        id: `m${moduleNumber}`,
        title: `Модуль ${moduleNumber}: ${formData.title}`,
        content: `Это модуль ${moduleNumber} курса "${formData.title}". Содержание будет добавлено позже. Ошибка генерации: ${error.message}`,
        completed: false,
        quiz: {
          id: `q${moduleNumber}`,
          title: `Квиз модуля ${moduleNumber}`,
          questions: [
            {
              id: `q${moduleNumber}_1`,
              text: 'Тестовый вопрос 1',
              options: ['Вариант A', 'Вариант B', 'Вариант C', 'Вариант D'],
              correctAnswer: 0
            }
          ]
        }
      };
    }
  };

  const handleGenerate = async () => {
    if (!formData.title || !formData.instructor || !formData.category) {
      alert('Заполните все обязательные поля');
      return;
    }

    if (!BOT_TOKEN || !BOT_ID || !API_URL) {
      alert('⚠️ Pro-Talk API не настроен. Проверьте .env.local файл');
      return;
    }

    setGenerating(true);
    setCurrentStep(2);
    setProgress(0);

    try {
      const modules: Module[] = [];

      for (let i = 0; i < formData.moduleCount; i++) {
        setProgress(Math.round(((i + 1) / formData.moduleCount) * 100));

        const module = await generateModuleWithProTalk(i + 1);
        modules.push(module);

        // Задержка между запросами 10 сек, чтобы не превысить rate limit
        if (i < formData.moduleCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }

      setGeneratedModules(modules);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error generating course:', error);
      alert('Ошибка при генерации курса. Попробуйте снова.');
      setCurrentStep(1);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveCourse = async () => {
    try {
      const newCourse = {
        title: formData.title,
        instructor: formData.instructor,
        category: formData.category,
        duration: formData.duration || `${formData.moduleCount}h 00m`,
        progress: 0,
        image: formData.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400',
        modules: generatedModules,
        averageScore: 0
      };

      await courseService.addCourse(newCourse);
      alert('✅ Курс успешно создан и добавлен в базу!');

      // Сброс формы
      setFormData({
        title: '',
        instructor: '',
        category: '',
        duration: '',
        moduleCount: 3,
        difficulty: 'intermediate',
        image: ''
      });
      setGeneratedModules([]);
      setCurrentStep(1);
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Ошибка при сохранении курса');
    }
  };

  return (
    <div className="course-generator">
      {/* Шаг 1: Основная информация */}
      {currentStep === 1 && (
        <div className="generator-step">
          <h3>📝 Шаг 1: Основная информация о курсе</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Название курса *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Например: Наставничество на производстве"
                required
              />
            </div>

            <div className="form-group">
              <label>Преподаватель *</label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                placeholder="Например: Александр Бобков"
                required
              />
            </div>

            <div className="form-group">
              <label>Категория *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите категорию</option>
                <option value="Communication Skills">Навыки коммуникации</option>
                <option value="Management">Навыки регулярного менеджмента</option>
                <option value="Leadership Skills">Развитие лидерства</option>
                <option value="Team management">Формирование команды</option>
                <option value="Time management and productivity">Личная продуктивность</option>
                <option value="Career Skills">Построение карьеры</option>
                <option value="Creativity Tools">Развитие креативности</option>
		<option value="Decision Making">Принятие решений</option>
		<option value="Learning Skills">Навыки обучения</option>
		<option value="Problem Solving">Решение проблем</option>
		<option value="Project Management">Управление проектами</option>
		<option value="Strategy Tools">Инструменты стратегирования</option>
		<option value="Stress Management">Управление стрессом</option>
              </select>
            </div>

            <div className="form-group">
              <label>Длительность</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="Например: 4h 30m"
              />
            </div>

            <div className="form-group">
              <label>Количество модулей</label>
              <input
                type="number"
                name="moduleCount"
                value={formData.moduleCount}
                onChange={handleInputChange}
                min="2"
                max="10"
              />
            </div>

            <div className="form-group">
              <label>Уровень сложности</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                <option value="beginner">Начальный</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>URL изображения (необязательно)</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/..."
              />
              <small>Если не указано, будет использовано изображение по умолчанию</small>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="generate-btn"
            disabled={generating}
          >
            <Icons.Sparkles /> Сгенерировать курс с AI (Pro-Talk)
          </button>
        </div>
      )}

      {/* Шаг 2: Генерация */}
      {currentStep === 2 && (
        <div className="generator-step">
          <h3>🤖 Шаг 2: AI генерирует контент курса</h3>
          <div className="generation-progress">
            <div className="progress-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="8"
                  strokeDasharray={`${progress * 2.827} 282.7`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <span className="progress-text">{progress}%</span>
            </div>
            <p>Создаю модули: {Math.ceil((progress / 100) * formData.moduleCount)} из {formData.moduleCount}</p>
            <p className="progress-hint">AI анализирует тему и создаёт текст учебного модуля...</p>
          </div>
        </div>
      )}

      {/* Шаг 3: Предпросмотр */}
      {currentStep === 3 && (
        <div className="generator-step">
          <h3>✅ Шаг 3: Предпросмотр и сохранение</h3>

          <div className="course-preview">
            <div className="preview-header">
              <h4>{formData.title}</h4>
              <p>Преподаватель: {formData.instructor} | Категория: {formData.category}</p>
            </div>

            <div className="modules-preview">
              <h5>Модули курса ({generatedModules.length}):</h5>
              {generatedModules.map((module, idx) => (
                <div key={module.id} className="module-preview-card">
                  <div className="module-preview-header">
                    <span className="module-number">{idx + 1}</span>
                    <h6>{module.title}</h6>
                  </div>
                  <p className="module-content-preview">
                    {module.content.substring(0, 150)}...
                  </p>
                  {module.quiz && (
                    <div className="quiz-indicator">
                      <Icons.Award /> Квиз с {module.quiz.questions.length} вопросами
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="preview-actions">
              <button onClick={() => setCurrentStep(1)} className="back-btn-secondary">
                Изменить информацию
              </button>
              <button onClick={handleSaveCourse} className="save-course-btn">
                💾 Сохранить курс
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
