import React from 'react';
import { Course } from '../types';
import { Icons } from './Icons';

interface StatisticsProps {
  courses: Course[];
  userName: string;
  onBack: () => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ courses, userName, onBack }) => {
  const completedCourses = courses.filter(c => c.progress === 100).length;
  const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100).length;
  const totalProgress = courses.reduce((sum, c) => sum + c.progress, 0) / courses.length || 0;
  const totalHours = courses.reduce((sum, c) => {
    const match = c.duration?.match(/(\d+)ч/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <button onClick={onBack} className="back-btn">
          <Icons.ChevronLeft /> Назад
        </button>
        <h1>Статистика обучения</h1>
        <p>{userName}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#dbeafe'}}>
            <Icons.Book style={{color: '#3b82f6'}} />
          </div>
          <div className="stat-content">
            <h3>{courses.length}</h3>
            <p>Всего курсов</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: '#dcfce7'}}>
            <Icons.CheckCircle style={{color: '#10b981'}} />
          </div>
          <div className="stat-content">
            <h3>{completedCourses}</h3>
            <p>Завершено</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: '#fef3c7'}}>
            <Icons.TrendingUp style={{color: '#f59e0b'}} />
          </div>
          <div className="stat-content">
            <h3>{inProgressCourses}</h3>
            <p>В процессе</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: '#f3e8ff'}}>
            <Icons.Clock style={{color: '#a855f7'}} />
          </div>
          <div className="stat-content">
            <h3>{totalHours}ч</h3>
            <p>Всего часов</p>
          </div>
        </div>
      </div>

      <div className="progress-overview">
        <h2>Общий прогресс</h2>
        <div className="progress-circle">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20" />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="20"
              strokeDasharray={`${(totalProgress / 100) * 502.4} 502.4`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="progress-text">
            <span className="progress-percent">{Math.round(totalProgress)}%</span>
            <span className="progress-label">завершено</span>
          </div>
        </div>
      </div>

      <div className="courses-breakdown">
        <h2>Детализация по курсам</h2>
        {courses.map((course) => (
          <div key={course.id} className="course-stat-item">
            <div className="course-stat-header">
              <h4>{course.title}</h4>
              <span className="course-stat-percent">{course.progress}%</span>
            </div>
            <div className="course-stat-bar">
              <div className="course-stat-fill" style={{width: `${course.progress}%`}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
