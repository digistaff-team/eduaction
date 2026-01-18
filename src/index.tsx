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
import { userProgressService } from './services/userProgressService';
import './styles.css';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'catalog' | 'profile' | 'course'>('landing');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [progressLoading, setProgressLoading] = useState(false);

  // Функции загрузки данных (определяем ДО useEffect)
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

  const loadUserProgress = async (userId: string) => {
    setProgressLoading(true);
    try {
      // Загружаем прогресс из Firebase
      const progressData = await userProgressService.getUserProgress(userId);
      
      // Загружаем курсы из Firebase (если есть)
      const firebaseCourses = await courseService.getAllCourses();
      const allCourses = firebaseCourses.length > 0 
        ? [...COURSES, ...firebaseCourses] 
        : COURSES;
      
      // Восстанавливаем прогресс
      const coursesWithProgress = userProgressService.restoreCoursesFromProgress(
        allCourses,
        progressData
      );
      
      setCourses(coursesWithProgress);
    } catch (error) {
      console.error('Error loading user progress:', error);
      // В случае ошибки загружаем курсы без прогресса
      loadCoursesFromFirebase();
    } finally {
      setProgressLoading(false);
    }
  };

  // Отслеживание состояния аутентификации
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      // Если пользователь вошел, загружаем его прогресс
      if (currentUser) {
        loadUserProgress(currentUser.uid);
        setView('profile');
      } else {
        setView('landing');
        setCourses(COURSES);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time синхронизация прогресса
  useEffect(() => {
    if (!user) return;

    const unsubscribe = userProgressService.subscribeToProgress(
      user.uid,
      (progressData) => {
        if (progressData) {
          setCourses((prevCourses) => 
            userProgressService.restoreCoursesFromProgress(prevCourses, progressData)
          );
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Автоматическое сохранение прогресса при изменении курсов
  useEffect(() => {
    if (!user || authLoading || progressLoading) return;

    const saveCourses = async () => {
      for (const course of courses) {
        if (course.progress > 0) {
          try {
            await userProgressService.saveCourseProgress(user.uid, course);
          } catch (error) {
            console.error(`Error saving progress for course ${course.id}:`, error);
          }
        }
      }
    };

    // Debounce: сохраняем через 2 секунды после изменения
    const timeoutId = setTimeout(saveCourses, 2000);

    return () => clearTimeout(timeoutId);
  }, [courses, user, authLoading, progressLoading]);

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

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-wrapper')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Обработчики аутентификации
  const handleLogin = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    await authService.register(email, password, name);
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

  // Показываем загрузку пока проверяется аутентификация или загружается прогресс
  if (authLoading || progressLoading) {
    return (
      <div className="app-container loading">
        <div className="loading-spinner">
          <Icons.Brain />
          <p>{progressLoading ? 'Загрузка прогресса...' : 'Загрузка...'}</p>
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
          <div className="user-menu-wrapper">
            <div 
              className="user-avatar" 
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={user?.displayName || 'Пользователь'}
            >
              {user?.displayName?.substring(0, 2).toUpperCase() || 'АД'}
            </div>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <strong>{user?.displayName || 'Пользователь'}</strong>
                  <span>{user?.email}</span>
                </div>
                
                <button 
                  onClick={() => { 
                    setShowAdminPanel(true); 
                    setShowUserMenu(false);
                  }}
                  className="dropdown-item"
                >
                  <Icons.Settings />
                  <span>Админ-панель</span>
                </button>
                
                <button 
                  onClick={() => {
                    handleViewProfile();
                    setShowUserMenu(false);
                  }}
                  className="dropdown-item"
                >
                  <Icons.User />
                  <span>Личный кабинет</span>
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button 
                  onClick={handleLogout}
                  className="dropdown-item danger"
                >
                  <Icons.X />
                  <span>Выйти</span>
                </button>
              </div>
            )}
          </div>
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
