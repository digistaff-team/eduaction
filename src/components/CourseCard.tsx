import React from 'react';
import { Course } from '../types';
import { Icons } from './Icons';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <div className="course-card" onClick={() => onClick(course)}>
      <div className="card-image" style={{backgroundImage: `url(${course.image})`}}>
        <div className="category-badge">{course.category}</div>
      </div>
      <div className="card-content">
        <h3>{course.title}</h3>
        <p className="instructor">{course.instructor}</p>
        <div className="meta-info">
          <span><Icons.Book /> {course.modules.length} модулей</span>
          <span>{course.duration}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{width: `${course.progress}%`}}></div>
        </div>
      </div>
    </div>
  );
};
