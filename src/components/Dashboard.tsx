import React from 'react';
import { Course } from '../types';
import { CourseCard } from './CourseCard';

interface DashboardProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ courses, onSelectCourse }) => {
  return (
    <div className="dashboard">
      <header className="hero">
        <h1>Добро пожаловать, Алексей! 👋</h1>
        <p>У вас {courses.length} активных курса. Продолжайте обучение!</p>
      </header>

      <section className="course-section">
        <h2>Мои курсы</h2>
        <div className="course-grid">
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onClick={onSelectCourse} 
            />
          ))}
        </div>
      </section>
    </div>
  );
};
