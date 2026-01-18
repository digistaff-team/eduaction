import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { Icons } from './Icons';
import { QuizView } from './QuizView';
import { AITutor } from './AITutor';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
  userProgress?: any;
  onProgressUpdate?: (progress: any) => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ 
  course,
  onBack,
  userProgress,
  onProgressUpdate
}) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [showAI, setShowAI] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [moduleScores, setModuleScores] = useState<Record<number, number>>({});
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set([0]));
  const [hoveredLock, setHoveredLock] = useState<number | null>(null);
  const [autoTransitionTimer, setAutoTransitionTimer] = useState<NodeJS.Timeout | null>(null);

  const activeModule = course.modules[activeModuleIndex];
  const PASS_THRESHOLD = 80;
  const AUTO_TRANSITION_DELAY = 5000;

  // Восстановление прогресса при загрузке
  useEffect(() => {
    if (userProgress) {
      console.log('📥 Restoring course progress:', userProgress);
      
      // Восстанавливаем завершённые модули
      const completed = new Set<number>([0]); // Первый модуль всегда открыт
      userProgress.modules?.forEach((mod: any, idx: number) => {
        if (mod.completedDate) {
          completed.add(idx);
        }
      });
      setCompletedModules(completed);
      
      // Восстанавливаем scores из квизов
      const scores: Record<number, number> = {};
      userProgress.modules?.forEach((mod: any, idx: number) => {
        if (mod.averageScore !== undefined) {
          scores[idx] = mod.averageScore;
        }
      });
      setModuleScores(scores);
    }
  }, [userProgress]);

  // Сброс режима квиза при смене модуля
  useEffect(() => {
    setQuizMode(false);
    if (autoTransitionTimer) {
      clearTimeout(autoTransitionTimer);
      setAutoTransitionTimer(null);
    }
  }, [activeModuleIndex]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (autoTransitionTimer) {
        clearTimeout(autoTransitionTimer);
      }
    };
  }, [autoTransitionTimer]);

  // Проверка разблокировки модуля
  const isModuleUnlocked = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return true;
    
    const previousModule = course.modules[moduleIndex - 1];
    
    // Если у предыдущего модуля есть квиз - проверяем score
    if (previousModule.quiz) {
      const previousModuleScore = moduleScores[moduleIndex - 1];
      return previousModuleScore !== undefined && previousModuleScore >= PASS_THRESHOLD;
    }
    
    // Если квиза нет - проверяем что модуль завершён
    return completedModules.has(moduleIndex - 1);
  };

  // Завершение модуля без квиза
  const handleCompleteModule = () => {
    console.log('✅ Module completed:', activeModuleIndex);
    
    // Создаём обновлённый Set СРАЗУ
    const newCompletedModules = new Set([...completedModules, activeModuleIndex]);
    setCompletedModules(newCompletedModules);
    
    // Сохраняем в Firebase используя НОВОЕ значение
    if (onProgressUpdate) {
      const updatedProgress = {
        ...userProgress,
        modules: course.modules.map((mod, idx) => ({
          moduleId: mod.id,
          completedDate: newCompletedModules.has(idx)
            ? new Date().toISOString() 
            : userProgress?.modules?.[idx]?.completedDate || null,
          averageScore: moduleScores[idx] || userProgress?.modules?.[idx]?.averageScore || 0
        })),
        lastAccessDate: new Date().toISOString(),
        progress: Math.round((newCompletedModules.size / course.modules.length) * 100)
      };
      
      onProgressUpdate(updatedProgress);
      console.log('💾 Progress saved to Firebase:', updatedProgress);
    }
    
    // Автоматически переходим к следующему модулю через 1 секунду
    if (activeModuleIndex < course.modules.length - 1) {
      setTimeout(() => {
        setActiveModuleIndex(prev => prev + 1);
      }, 1000);
    }
  };

  // Переход к следующему модулю
  const moveToNextModule = () => {
    if (autoTransitionTimer) {
      clearTimeout(autoTransitionTimer);
      setAutoTransitionTimer(null);
    }

    if (activeModuleIndex < course.modules.length - 1) {
      setQuizMode(false);
      setActiveModuleIndex(prev => prev + 1);
    } else {
      setQuizMode(false);
    }
  };

  // Завершение квиза
  const handleQuizComplete = (score: number) => {
    console.log('Quiz score:', score);
    
    // Обновляем scores
    const newScores = {
      ...moduleScores,
      [activeModuleIndex]: score
    };
    setModuleScores(newScores);
    
    // Отмечаем модуль как завершённый если квиз пройден
    let newCompletedModules = completedModules;
    if (score >= PASS_THRESHOLD) {
      newCompletedModules = new Set([...completedModules, activeModuleIndex]);
      setCompletedModules(newCompletedModules);
    }
    
    // Сохраняем в Firebase используя НОВЫЕ значения
    if (onProgressUpdate && score >= PASS_THRESHOLD) {
      const updatedProgress = {
        ...userProgress,
        modules: course.modules.map((mod, idx) => ({
          moduleId: mod.id,
          completedDate: newCompletedModules.has(idx)
            ? new Date().toISOString()
            : userProgress?.modules?.[idx]?.completedDate || null,
          averageScore: newScores[idx] || userProgress?.modules?.[idx]?.averageScore || 0
        })),
        lastAccessDate: new Date().toISOString(),
        progress: Math.round((newCompletedModules.size / course.modules.length) * 100)
      };
      
      onProgressUpdate(updatedProgress);
      console.log('💾 Quiz result saved to Firebase:', updatedProgress);
    }
    
    if (score >= PASS_THRESHOLD && activeModuleIndex < course.modules.length - 1) {
      const timer = setTimeout(() => {
        moveToNextModule();
      }, AUTO_TRANSITION_DELAY);
      
      setAutoTransitionTimer(timer);
    } else if (score >= PASS_THRESHOLD) {
      const timer = setTimeout(() => {
        setQuizMode(false);
      }, AUTO_TRANSITION_DELAY);
      
      setAutoTransitionTimer(timer);
    }
  };

  const handleContinueLearning = () => {
    moveToNextModule();
  };

  const handleModuleClick = (idx: number) => {
    if (isModuleUnlocked(idx)) {
      setActiveModuleIndex(idx);
    }
  };

  return (
    <div className="course-player-container">
      <div className="player-header">
        <button onClick={onBack} className="back-btn">
          <Icons.ChevronLeft /> Назад
        </button>
        <h2>{course.title}</h2>
      </div>

      <div className="player-layout">
        <div className="main-content">
          <div className="lesson-content">
            <div className="lesson-header">
              <h3>{activeModule.title}</h3>
              <div className="header-actions">
                {activeModule.quiz && (
                  <button 
                    className={`action-btn ${quizMode ? 'active' : ''}`}
                    onClick={() => setQuizMode(!quizMode)}
                  >
                    <Icons.Award /> {quizMode ? 'Скрыть квиз' : 'Пройти квиз'}
                  </button>
                )}
                <button className="ai-fab" onClick={() => setShowAI(true)}>
                  <Icons.Sparkles /> AI Помощь
                </button>
              </div>
            </div>

            {quizMode && activeModule.quiz ? (
              <QuizView 
                quiz={activeModule.quiz} 
                onComplete={handleQuizComplete}
                onContinue={handleContinueLearning}
                onClose={() => setQuizMode(false)}
                isLastModule={activeModuleIndex === course.modules.length - 1}
              />
            ) : (
              <div className="text-content-block">
                <div className="content-text">
                  {activeModule.content}
                </div>
                <div className="content-footer">
  <div className="info-action-card ai-card">
    <div className="info-action-content">
      <Icons.Brain style={{ width: 20, height: 20, color: '#4f46e5', flexShrink: 0 }} />
      <span>Используйте AI-тренера для получения дополнительной информации и примеров</span>
    </div>
    <button className="card-action-btn ai-btn" onClick={() => setShowAI(true)}>
      <Icons.Sparkles style={{ width: 18, height: 18 }} />
      AI Помощь
    </button>
  </div>
  
  {/* Кнопка для модулей БЕЗ квиза */}
  {!activeModule.quiz && !completedModules.has(activeModuleIndex) && (
    <div className="info-action-card complete-card">
      <div className="info-action-content">
        <Icons.CheckCircle style={{ width: 20, height: 20, color: '#10b981', flexShrink: 0 }} />
        <span>
          {activeModuleIndex === course.modules.length - 1
            ? 'Поздравляем! Вы изучили все материалы курса'
            : 'Изучили материалы модуля? Отметьте как завершённый для перехода к следующему'
          }
        </span>
      </div>
      <button 
        className="card-action-btn complete-btn" 
        onClick={activeModuleIndex === course.modules.length - 1 ? () => {
          handleCompleteModule();
          setTimeout(() => onBack(), 1500);
        } : handleCompleteModule}
      >
        <Icons.CheckCircle style={{ width: 18, height: 18 }} />
        {activeModuleIndex === course.modules.length - 1 ? 'Завершить курс' : 'Завершить модуль'}
      </button>
    </div>
  )}
  
  {/* Карточка для модулей С квизом - ИСПРАВЛЕНО: показывается для ВСЕХ модулей с квизом */}
  {activeModule.quiz && (
    <div className="info-action-card quiz-card">
      <div className="info-action-content">
        <Icons.Award style={{ width: 20, height: 20, color: '#f59e0b', flexShrink: 0 }} />
        <span>
          {activeModuleIndex === course.modules.length - 1
            ? 'Пройдите финальный квиз для завершения курса'
            : `Для перехода к следующему модулю пройдите квиз с результатом не менее ${PASS_THRESHOLD}%`
          }
        </span>
      </div>
      <button className="card-action-btn quiz-btn" onClick={() => setQuizMode(true)}>
        <Icons.Award style={{ width: 18, height: 18 }} />
        Пройти квиз
      </button>
    </div>
  )}
</div>

              </div>
            )}
          </div>
        </div>

        <div className="sidebar">
          <h3>Содержание курса</h3>
          <div className="module-list">
            {course.modules.map((mod, idx) => {
              const isUnlocked = isModuleUnlocked(idx);
              const isActive = idx === activeModuleIndex;
              const score = moduleScores[idx];
              const isCompleted = completedModules.has(idx) || (score !== undefined && score >= PASS_THRESHOLD);
              
              return (
                <div 
                  key={mod.id} 
                  className={`module-item ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                  onClick={() => handleModuleClick(idx)}
                  style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
                >
                  <div className="module-status">
                    {isCompleted ? (
                      <Icons.CheckCircle className="completed" style={{ color: '#10b981' }} />
                    ) : (
                      <div className="circle"></div>
                    )}
                  </div>
                  <div className="module-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                      <span className="module-title" style={{ flex: 1 }}>{mod.title}</span>
                      
                      {!isUnlocked && (
                        <div 
                          className="lock-icon-wrapper"
                          onMouseEnter={() => setHoveredLock(idx)}
                          onMouseLeave={() => setHoveredLock(null)}
                          style={{ position: 'relative' }}
                        >
                          <Icons.Lock style={{ width: 16, height: 16, color: '#9ca3af' }} />
                          
                          {hoveredLock === idx && (
                            <div className="lock-tooltip">
                              {course.modules[idx - 1]?.quiz 
                                ? `Изучите материалы предыдущего модуля и пройдите квиз с результатом не менее ${PASS_THRESHOLD}%`
                                : 'Завершите предыдущий модуль для разблокировки'
                              }
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="module-meta">
                      <span className="module-duration">~15 мин</span>
                      {mod.quiz && <span className="quiz-badge">Квиз</span>}
                      {score !== undefined && (
                        <span 
                          className={`score-badge ${score >= PASS_THRESHOLD ? 'pass' : 'fail'}`}
                        >
                          {score}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showAI && (
        <div className="ai-tutor-overlay">
          <AITutor 
            context={{
              courseTitle: course.title,
              moduleTitle: activeModule.title,
              moduleContent: activeModule.content
            }}
            onClose={() => setShowAI(false)}
          />
        </div>
      )}
    </div>
  );
};