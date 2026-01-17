import React, { useState, useEffect } from 'react';
import { Quiz } from '../types';
import { Icons } from './Icons';

interface QuizViewProps {
  quiz: Quiz;
  onComplete: (score: number) => void;
  onClose?: () => void;
  onContinue?: () => void; // НОВЫЙ PROP
}

export const QuizView: React.FC<QuizViewProps> = ({ quiz, onComplete, onClose, onContinue }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const PASS_THRESHOLD = 80;

  const handleOptionSelect = (optionIndex: number) => {
    if (isTransitioning) return;
    
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
    setIsTransitioning(true);

    setTimeout(() => {
      if (isLastQuestion) {
        let correctCount = 0;
        const updatedAnswers = { ...selectedAnswers, [currentQuestion.id]: optionIndex };
        
        quiz.questions.forEach(q => {
          if (updatedAnswers[q.id] === q.correctAnswer) correctCount++;
        });
        
        const score = Math.round((correctCount / totalQuestions) * 100);
        setFinalScore(score);
        setShowResult(true);
        onComplete(score);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsTransitioning(false);
      }
    }, 600);
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResult(false);
    setFinalScore(0);
    setIsTransitioning(false);
  };

  if (showResult) {
    const isPassed = finalScore >= PASS_THRESHOLD;
    
    return (
      <div className="quiz-container">
        <div className={`quiz-results ${isPassed ? 'pass' : 'fail'}`}>
          <div className="score-circle">
            <span className="score-val">{finalScore}%</span>
            <span className="score-label">Оценка</span>
          </div>
          <div className="result-text">
            <h4>{isPassed ? '🎉 Квиз пройден!' : '📚 Попробуйте снова'}</h4>
            <p>
              {isPassed 
                ? 'Отличная работа! Следующий модуль разблокирован.' 
                : `Для прохождения требуется минимум ${PASS_THRESHOLD}%. Повторите материал и попробуйте ещё раз.`}
            </p>
          </div>
          <div className="result-actions">
            {!isPassed && (
              <button className="retry-btn" onClick={handleRetake}>
                <Icons.TrendingUp /> Пройти заново
              </button>
            )}
            {isPassed && onContinue && (
              <button className="retry-btn" onClick={onContinue}>
                Продолжить обучение
              </button>
            )}
            {onClose && !isPassed && (
              <button className="close-btn-secondary" onClick={onClose}>
                Закрыть квиз
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-wrapper">
      <div className="quiz-container single-question">
        <div className="quiz-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            Вопрос {currentQuestionIndex + 1} из {totalQuestions}
          </span>
        </div>

        <div className="question-card single">
          <p className="question-text">
            <span className="q-num">{currentQuestionIndex + 1}.</span> {currentQuestion.text}
          </p>
          <div className="options-grid">
            {currentQuestion.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
              
              return (
                <button 
                  key={optIdx} 
                  className={`option-btn ${isSelected ? 'selected' : ''} ${isTransitioning ? 'disabled' : ''}`}
                  onClick={() => handleOptionSelect(optIdx)}
                  disabled={isTransitioning}
                >
                  <div className="radio-circle">
                    {isSelected && <div className="radio-dot" />}
                  </div>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
