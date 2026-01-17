import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Course } from './types';
import { COURSES } from './data/courses';
import { LEARNING_TOPICS } from './data/topics';
import { Icons } from './components/Icons';
import { Dashboard } from './components/Dashboard';
import { CatalogView } from './components/CatalogView';
import { UserProfile } from './components/UserProfile';
import { CoursePlayer } from './components/CoursePlayer';
import { AdminPanel } from './components/AdminPanel';
import { courseService } from './services/courseService';
import './styles.css';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'catalog' | 'profile' | 'course'>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [courses, setCourses] = useState<Course[]>(COURSES);

  // Загрузка курсов из Firebase при старте
  useEffect(() => {
    loadCoursesFromFirebase();
  }, []);

  const loadCoursesFromFirebase = async () => {
    try {
      const firebaseCourses = await courseService.getAllCourses();
      if (firebaseCourses.length > 0) {
        // Объединяем статические курсы и курсы из Firebase
        setCourses([...COURSES, ...firebaseCourses]);
      }
    } catch (error) {
      console.error('Error loading Firebase courses:', error);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setView('course');
  };

  const handleBack = () => {
    setSelectedCourse(null);
    setView('dashboard');
  };

  const handleViewProfile = () => {
    setView('profile');
  };

  const handleViewCatalog = () => {
    setView('catalog');
  };

  // Обработчик секретной комбинации для открытия админ-панели (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdminPanel(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="logo" onClick={handleBack}>
          <Icons.Brain />
          <span>EduAction</span>
        </div>
        <div className="nav-links">
          <span 
            className={view === 'dashboard' ? 'active' : ''} 
            onClick={handleBack}
          >
            <Icons.Home /> Главная
          </span>
          <span 
            className={view === 'catalog' ? 'active' : ''}
            onClick={handleViewCatalog}
          >
            <Icons.Grid /> Каталог
          </span>
          <span 
            className={view === 'profile' ? 'active' : ''}
            onClick={handleViewProfile}
          >
            <Icons.User /> Личный кабинет
          </span>
        </div>
        <div className="user-avatar" onClick={() => setShowAdminPanel(true)} title="Админ-панель">
          АД
        </div>
      </nav>

      {view === 'dashboard' && (
        <Dashboard courses={courses} onSelectCourse={handleSelectCourse} />
      )}
      
      {view === 'profile' && (
        <UserProfile courses={courses} onBack={handleBack} />
      )}
      
      {view === 'catalog' && (
        <CatalogView topics={LEARNING_TOPICS} onBack={handleBack} />
      )}
      
      {view === 'course' && selectedCourse && (
        <CoursePlayer course={selectedCourse} onBack={handleBack} />
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => {
          setShowAdminPanel(false);
          loadCoursesFromFirebase(); // Обновляем курсы после закрытия админ-панели
        }} />
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
