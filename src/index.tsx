import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config/firebase';
import { Course } from './types';
import { COURSES } from './data/courses';
import { LEARNING_TOPICS } from './data/topics';
import { Icons } from './components/Icons';
import { Landing } from './components/Landing';
import { CatalogView } from './components/CatalogView';
import { UserProfile } from './components/UserProfile';
import { CoursePlayer } from './components/CoursePlayer';
import { AdminPanel } from './components/AdminPanel';
import { courseService } from './services/courseService';
import { authService } from './services/authService';
import './styles.css';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'catalog' | 'profile' | 'course'>('landing');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [courses, setCourses] = useState<Course[]>(COURSES);

  // Отслеживание состояния аутентификации
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      // Если пользователь вошел, загружаем его курсы
      if (currentUser) {
        loadCoursesFromFirebase();
        setView('profile'); // Перенаправляем в личный кабинет
      } else {
        setView('landing');
      }
    });

    return () => unsubscribe();
  }, []);

  const loadCoursesFromFirebase = async () => {
    try {
      const firebaseCourses = await courseService.getAllCourses();
      if (firebaseCourses.length > 0) {
        setCourses([...COURSES, ...firebaseCourses]);
      }
    } catch (error) {
      console.error('Error loading Firebase courses:', error);
    }
  };

  // Обработчики аутентификации
  const handleLogin = async (email: string, password: string) => {
    await authService.login(email, password);
    // onAuthStateChanged автоматически обновит состояние
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    await authService.register(email, password, name);
    // onAuthStateChanged автоматически обновит состояние
  };

  const handleLogout = async () => {
    await authService.logout();
    setView('landing');
    setCourses(COURSES);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setView('course');
  };

  const handleBack = () => {
    setSelectedCourse(null);
    setView('profile');
  };

  const handleViewProfile = () => {
    setView('profile');
  };

  const handleViewCatalog = () => {
    setView('catalog');
  };

  // Секретная комбинация для админ-панели (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdminPanel(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Показываем загрузку пока проверяется аутентификация
  if (authLoading) {
    return (
      <div className="app-container loading">
        <div className="loading-spinner">
          <Icons.Brain />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован - показываем лендинг
  if (!user && view === 'landing') {
    return <Landing onLogin={handleLogin} onRegister={handleRegister} />;
  }

  // Авторизованное приложение
  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="logo" onClick={handleViewProfile}>
          <Icons.Brain />
          <span>EduAction</span>
        </div>
        
        <div className="nav-links">
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

        <div className="nav-actions">
          <div 
            className="user-avatar" 
            onClick={() => setShowAdminPanel(true)} 
            title="Админ-панель"
          >
            {user?.displayName?.substring(0, 2).toUpperCase() || 'АД'}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Выйти">
            <Icons.X />
          </button>
        </div>
      </nav>

      {view === 'profile' && (
        <UserProfile 
          courses={courses} 
          userName={user?.displayName || 'Пользователь'}
          onSelectCourse={handleSelectCourse}
          onBack={handleBack}
        />
      )}
      
      {view === 'catalog' && (
        <CatalogView topics={LEARNING_TOPICS} onBack={handleViewProfile} />
      )}
      
      {view === 'course' && selectedCourse && (
        <CoursePlayer course={selectedCourse} onBack={handleBack} />
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => {
          setShowAdminPanel(false);
          loadCoursesFromFirebase();
        }} />
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
