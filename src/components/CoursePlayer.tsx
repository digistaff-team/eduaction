import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { Icons } from './Icons';
import { QuizView } from './QuizView';
import { AITutor } from './AITutor';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack }) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [showAI, setShowAI] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [moduleScores, setModuleScores] = useState<Record<number, number>>({});
  const [hoveredLock, setHoveredLock] = useState<number | null>(null);
  const [autoTransitionTimer, setAutoTransitionTimer] = useState<NodeJS.Timeout | null>(null);

  const activeModule = course.modules[activeModuleIndex];
  const PASS_THRESHOLD = 80;
  const AUTO_TRANSITION_DELAY = 5000; // 5 секунд

  useEffect(() => {
    setQuizMode(false);
    // Очистка таймера при смене модуля
    if (autoTransitionTimer) {
      clearTimeout(autoTransitionTimer);
      setAutoTransitionTimer(null);
    }
  }, [activeModuleIndex]);

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (autoTransitionTimer) {
        clearTimeout(autoTransitionTimer);
      }
    };
  }, [autoTransitionTimer]);

  const isModuleUnlocked = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return true;
    const previousModuleScore = moduleScores[moduleIndex - 1];
    return previousModuleScore !== undefined && previousModuleScore >= PASS_THRESHOLD;
  };

  const moveToNextModule = () => {
    // Очистка существующего таймера
    if (autoTransitionTimer) {
      clearTimeout(autoTransitionTimer);
      setAutoTransitionTimer(null);
    }

    // Переход к следующему модулю
    if (activeModuleIndex < course.modules.length - 1) {
      setQuizMode(false);
      setActiveModuleIndex(prev => prev + 1);
    } else {
      // Если это последний модуль, просто закрываем квиз
      setQuizMode(false);
    }
  };

  const handleQuizComplete = (score: number) => {
    console.log('Quiz score:', score);
    setModuleScores(prev => ({
      ...prev,
      [activeModuleIndex]: score
    }));
    
    // Если квиз пройден успешно И есть следующий модуль
    if (score >= PASS_THRESHOLD && activeModuleIndex < course.modules.length - 1) {
      // Запускаем автоматический переход через 5 секунд
      const timer = setTimeout(() => {
        moveToNextModule();
      }, AUTO_TRANSITION_DELAY);
      
      setAutoTransitionTimer(timer);
    } else if (score >= PASS_THRESHOLD) {
      // Если это последний модуль, просто закрываем квиз через 5 секунд
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
                  
                  {activeModule.quiz && activeModuleIndex < course.modules.length - 1 && (
                    <div className="info-action-card quiz-card">
                      <div className="info-action-content">
                        <Icons.Award style={{ width: 20, height: 20, color: '#f59e0b', flexShrink: 0 }} />
                        <span>Для перехода к следующему модулю пройдите квиз с результатом не менее {PASS_THRESHOLD}%</span>
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
              
              return (
                <div 
                  key={mod.id} 
                  className={`module-item ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                  onClick={() => handleModuleClick(idx)}
                  style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
                >
                  <div className="module-status">
                    {score !== undefined && score >= PASS_THRESHOLD ? (
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
                              Изучите материалы предыдущего модуля и пройдите квиз с результатом не менее {PASS_THRESHOLD}%
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
