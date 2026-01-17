import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import { Icons } from './Icons';

export const CourseManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const fetchedCourses = await courseService.getAllCourses();
      setCourses(fetchedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {  // Вместо number
  if (!confirm('Вы уверены, что хотите удалить этот курс?')) return;
  
  try {
    await courseService.deleteCourse(courseId); // Без .toString()
    setCourses(courses.filter(c => c.id !== courseId));
    alert('Курс успешно удалён!');
  } catch (error) {
    console.error('Error deleting course:', error);
    alert('Ошибка при удалении курса');
  }
};


  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Загрузка курсов...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="empty-state">
        <Icons.Book style={{ width: 64, height: 64, color: '#9ca3af' }} />
        <h3>Нет курсов</h3>
        <p>Создайте первый курс с помощью AI-генератора</p>
      </div>
    );
  }

  return (
    <div className="course-manager">
      <div className="manager-header">
        <h3>Всего курсов: {courses.length}</h3>
        <button onClick={loadCourses} className="refresh-btn">
          <Icons.TrendingUp /> Обновить
        </button>
      </div>

      <div className="courses-table">
        <div className="table-header">
          <span>Курс</span>
          <span>Преподаватель</span>
          <span>Категория</span>
          <span>Модули</span>
          <span>Действия</span>
        </div>

        {courses.map(course => (
          <div key={course.id} className="table-row">
            <div className="course-cell">
              <img src={course.image} alt={course.title} />
              <div>
                <strong>{course.title}</strong>
                <small>{course.duration}</small>
              </div>
            </div>
            <span>{course.instructor}</span>
            <span>
              <span className="category-tag">{course.category}</span>
            </span>
            <span>{course.modules.length} модулей</span>
            <div className="actions-cell">
              <button 
                onClick={() => handleDeleteCourse(course.id)}
                className="delete-btn"
                title="Удалить курс"
              >
                <Icons.X />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
