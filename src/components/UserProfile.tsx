import React, { useState } from 'react';
import { Course } from '../types';
import { Icons } from './Icons';
import { CourseCard } from './CourseCard';

interface UserProfileProps {
  courses: Course[];
  userName: string;
  onSelectCourse: (course: Course) => void;
  onBack: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  courses, 
  userName,
  onSelectCourse,
  onBack 
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'stats'>('courses');

  const activeCourses = courses.filter(c => c.progress > 0);
  const completedModules = courses.reduce((sum, course) => 
    sum + course.modules.filter(m => m.completed).length, 0
  );
  const totalModules = courses.reduce((sum, course) => sum + course.modules.length, 0);
  const avgScore = activeCourses.length > 0 
    ? Math.round(activeCourses.reduce((sum, c) => sum + (c.averageScore || 0), 0) / activeCourses.length) 
    : 0;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-header-content">
          <h1>Добро пожаловать, {userName}! 👋</h1>
          <p>Ваш личный кабинет с курсами и статистикой</p>
        </div>
      </div>

      {/* Табы для переключения между курсами и статистикой */}
      <div className="profile-tabs">
        <button
          className={activeTab === 'courses' ? 'active' : ''}
          onClick={() => setActiveTab('courses')}
        >
          <Icons.Book />
          Мои курсы ({courses.length})
        </button>
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          <Icons.TrendingUp />
          Статистика и история
        </button>
      </div>

      {/* Вкладка: Мои курсы */}
      {activeTab === 'courses' && (
        <div className="profile-courses-section">
          <div className="section-header">
            <h2>Активные курсы</h2>
            <p>У вас {courses.length} курсов в процессе обучения</p>
          </div>

          {courses.length > 0 ? (
            <div className="course-grid">
              {courses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onClick={onSelectCourse} 
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icons.Book style={{width: 64, height: 64, color: '#9ca3af'}} />
              <h3>У вас пока нет курсов</h3>
              <p>Перейдите в каталог, чтобы выбрать интересующие курсы</p>
              <button className="primary-btn" onClick={onBack}>
                <Icons.Grid />
                Открыть каталог
              </button>
            </div>
          )}
        </div>
      )}

      {/* Вкладка: Статистика */}
      {activeTab === 'stats' && (
        <div className="profile-stats-section">
          {/* Карточки статистики */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#eef2ff'}}>
                <Icons.Book style={{color: '#4f46e5'}} />
              </div>
              <div className="stat-info">
                <h3>{activeCourses.length}</h3>
                <p>Активных курсов</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{background: '#f0fdf4'}}>
                <Icons.CheckCircle style={{color: '#10b981'}} />
              </div>
              <div className="stat-info">
                <h3>{completedModules}/{totalModules}</h3>
                <p>Модулей завершено</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{background: '#fef3c7'}}>
                <Icons.Award style={{color: '#f59e0b'}} />
              </div>
              <div className="stat-info">
                <h3>{avgScore}%</h3>
                <p>Средний балл</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{background: '#fce7f3'}}>
                <Icons.TrendingUp style={{color: '#ec4899'}} />
              </div>
              <div className="stat-info">
                <h3>{Math.round((completedModules / totalModules) * 100) || 0}%</h3>
                <p>Общий прогресс</p>
              </div>
            </div>
          </div>

          {/* История обучения */}
          <div className="course-history-section">
            <h2>История обучения</h2>
            <div className="course-history-list">
              {activeCourses.map(course => (
                <div key={course.id} className="history-course-card">
                  <div className="history-course-header">
                    <img src={course.image} alt={course.title} />
                    <div className="history-course-info">
                      <h3>{course.title}</h3>
                      <p className="instructor-name">{course.instructor}</p>
                      <div className="course-dates">
                        <span><Icons.Calendar /> Начато: {course.startedDate}</span>
                        <span><Icons.Calendar /> Последний вход: {course.lastAccessDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="history-course-stats">
                    <div className="stat-badge success">
                      <Icons.Award />
                      <span>{course.averageScore}%</span>
                      <small>Средний балл</small>
                    </div>
                    <div className="stat-badge primary">
                      <Icons.TrendingUp />
                      <span>{course.progress}%</span>
                      <small>Прогресс</small>
                    </div>
                  </div>

                  <button 
                    className="toggle-details-btn" 
                    onClick={() => setSelectedCourse(
                      selectedCourse?.id === course.id ? null : course
                    )}
                  >
                    {selectedCourse?.id === course.id ? 'Скрыть модули' : 'Показать модули'}
                  </button>

                  {selectedCourse?.id === course.id && (
                    <div className="course-details">
                      <h4>Модули курса</h4>
                      <div className="modules-table">
                        <div className="table-header">
                          <span>Модуль</span>
                          <span>Статус</span>
                          <span>Дата завершения</span>
                          <span>Оценка</span>
                        </div>
                        {course.modules.map(module => (
                          <div key={module.id} className="table-row">
                            <span className="module-name">
                              {module.completed ? (
                                <Icons.CheckCircle className="completed" />
                              ) : (
                                <div className="circle"></div>
                              )}
                              {module.title}
                            </span>
                            <span className={`status-badge ${
                              module.completed ? 'completed' : 'in-progress'
                            }`}>
                              {module.completed ? 'Завершено' : 'В процессе'}
                            </span>
                            <span className="date-cell">
                              {module.completedDate || '—'}
                            </span>
                            <span className="score-cell">
                              {module.quizResults && module.quizResults.length > 0 ? (
                                <span className={`score-badge ${
                                  module.quizResults[0].passed ? 'pass' : 'fail'
                                }`}>
                                  {module.quizResults[0].score}%
                                </span>
                              ) : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {activeCourses.length === 0 && (
              <div className="empty-state">
                <Icons.Book style={{width: 48, height: 48, color: '#9ca3af'}} />
                <h3>Нет активных курсов</h3>
                <p>Начните обучение, чтобы увидеть здесь историю</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
