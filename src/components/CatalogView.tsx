import React, { useState } from 'react';
import { LearningTopic } from '../types';
import { Icons } from './Icons';

interface CatalogViewProps {
  topics: LearningTopic[];
  onBack: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ topics, onBack }) => {
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  const toggleCourseExpand = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  if (selectedTopic) {
    return (
      <div className="catalog-container">
        <div className="catalog-header">
          <button onClick={() => setSelectedTopic(null)} className="back-btn">
            <Icons.ChevronLeft /> Назад к темам
          </button>
          <div className="topic-header-large" style={{borderLeftColor: selectedTopic.color}}>
            <span className="topic-icon-large">{selectedTopic.icon}</span>
            <div>
              <h1>{selectedTopic.title}</h1>
              <p>{selectedTopic.description}</p>
            </div>
          </div>
        </div>

        <div className="courses-list">
          <h2>Курсы по теме ({selectedTopic.courses.length})</h2>
          <div className="catalog-courses-grid">
            {selectedTopic.courses.map((course) => {
              const isExpanded = expandedCourses.has(course.id);
              return (
                <div key={course.id} className="catalog-course-card">
                  <div className="catalog-course-header">
                    <h3>{course.title}</h3>
                    <div className="catalog-course-meta">
                      <span className="level-badge" style={{background: selectedTopic.color + '20', color: selectedTopic.color}}>
                        {course.level}
                      </span>
                      <span className="duration-badge">
                        <Icons.Clock /> {course.duration}
                      </span>
                    </div>
                  </div>
                  <p className="catalog-course-description">{course.description}</p>
                  <button 
                    className="expand-course-btn" 
                    onClick={() => toggleCourseExpand(course.id)}
                  >
                    {isExpanded ? 'Скрыть детали' : 'Показать детали'}
                    <Icons.ChevronRight style={{transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s'}} />
                  </button>
                  {isExpanded && (
                    <div className="catalog-course-details">
                      <div className="detail-item">
                        <strong>Что вы узнаете:</strong>
                        <ul>
                          <li>Практические навыки применения</li>
                          <li>Теоретические основы</li>
                          <li>Реальные кейсы и примеры</li>
                        </ul>
                      </div>
                      <button className="enroll-btn" style={{background: selectedTopic.color}}>
                        Записаться на курс
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <button onClick={onBack} className="back-btn">
          <Icons.ChevronLeft /> Назад к главной
        </button>
        <h1>Каталог курсов</h1>
        <p>Выберите тему обучения для просмотра доступных курсов</p>
      </div>

      <div className="topics-grid">
        {topics.map((topic) => (
          <div 
            key={topic.id} 
            className="topic-card"
            onClick={() => setSelectedTopic(topic)}
            style={{borderTopColor: topic.color}}
          >
            <div className="topic-icon" style={{background: topic.color + '20'}}>
              <span style={{fontSize: '2.5rem'}}>{topic.icon}</span>
            </div>
            <div className="topic-content">
              <h3>{topic.title}</h3>
              <p>{topic.description}</p>
              <div className="topic-meta">
                <span className="courses-count">
                  <Icons.Book /> {topic.coursesCount} курсов
                </span>
                <span className="view-link" style={{color: topic.color}}>
                  Посмотреть <Icons.ChevronRight />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
