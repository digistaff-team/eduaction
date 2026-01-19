import React from 'react';
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
  const activeCourses = courses.filter(c => c.progress > 0);

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-header-content">
          <h1>Добро пожаловать, {userName}! 👋</h1>
          <p>Ваши активные курсы и прогресс обучения</p>
        </div>
      </div>

      <div className="profile-section-header">
        <h2>
          <Icons.Book />
          Мои курсы ({activeCourses.length})
        </h2>
      </div>

      <div className="courses-grid">
        {activeCourses.length > 0 ? (
          activeCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => onSelectCourse(course)}
            />
          ))
        ) : (
          <div className="empty-state">
            <Icons.Book />
            <h3>У вас пока нет активных курсов</h3>
            <p>Перейдите в каталог, чтобы начать обучение</p>
          </div>
        )}
      </div>
    </div>
  );
};
