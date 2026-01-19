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
  const [userProgress, setUserProgress] = useState<any>(null);

  // ← ДОБАВЬТЕ ЛОГ ЗДЕСЬ
  console.log('🎯 App State:', { 
    view, 
    authLoading, 
    progressLoading, 
    coursesCount: courses.length,
    hasUser: !!user 
  });

  // Загрузка курсов из Firebase (созданных через AdminPanel)
  const loadCoursesFromFirebase = async () => {
    try {
      console.log('📥 Loading courses from Firebase...');
      const firebaseCourses = await courseService.getAllCourses();
      if (firebaseCourses.length > 0) {
        console.log('✅ Firebase courses loaded:', firebaseCourses.length);
        setCourses([...COURSES, ...firebaseCourses]);
      }
    } catch (error) {
      console.error('❌ Error loading Firebase courses:', error);
    }
  };

  // Загрузка прогресса пользователя
  const loadUserProgress = async (userId: string) => {
    console.log('🔄 Loading progress for user:', userId);
    setProgressLoading(true);
    try {
      // Загружаем прогресс пользователя
      const progressData = await userProgressService.getUserProgress(userId);
      console.log('📊 Progress data from Firebase:', progressData);
      setUserProgress(progressData);
      
      // Загружаем курсы из Firebase
      const firebaseCourses = await courseService.getAllCourses();
      console.log('📚 Firebase courses:', firebaseCourses);
      
      // Объединяем статические курсы и курсы из Firebase
      const allCourses = [...COURSES, ...firebaseCourses];
      console.log('📖 All courses (static + firebase):', allCourses.map(c => ({id: c.id, title: c.title})));
      
      // Восстанавливаем прогресс для всех курсов
      const coursesWithProgress = userProgressService.restoreCoursesFromProgress(
        allCourses,
        progressData
      );
      console.log('✅ Final courses with restored progress:', coursesWithProgress);
      
      setCourses(coursesWithProgress);
    console.log('✅ Final courses with restored progress:', coursesWithProgress);
  } catch (error) {
    console.error('❌ Error loading user progress:', error);
    await loadCoursesFromFirebase();
  } finally {
    console.log('✅ Setting progressLoading = false'); // ← ДОБАВЬТЕ
    setProgressLoading(false);
  }
};

// Отслеживание состояния аутентификации
useEffect(() => {
  console.log('🔧 Setting up auth listener');
  let isFirstLoad = true;
  
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    console.log('🔐 Auth state changed:', { 
      hasUser: !!currentUser,
      userId: currentUser?.uid,
      isFirstLoad,
      currentView: view
    });
    
    setUser(currentUser);
    setAuthLoading(false);
    
    if (currentUser) {
      console.log('✅ User logged in, setting view to profile');
      setView('profile');
      
      if (isFirstLoad) {
        console.log('📥 First load - loading user progress');
        isFirstLoad = false;
        loadUserProgress(currentUser.uid);
      } else {
        console.log('🔄 Not first load - skipping progress load');
      }
    } else {
      console.log('❌ User logged out, resetting to landing');
      setView('landing');
      setCourses(COURSES);
      setUserProgress(null);
    }
  });

  return () => {
    console.log('🧹 Cleaning up auth listener');
    unsubscribe();
  };
}, []);


  // Real-time синхронизация прогресса с автоматической загрузкой Firebase курсов
  useEffect(() => {
    if (!user) return;

    const unsubscribe = userProgressService.subscribeToProgress(
      user.uid,
      async (progressData) => {
        if (progressData) {
          console.log('🔄 Real-time progress update:', progressData);
          setUserProgress(progressData);
          
          // Загружаем курсы из Firebase перед восстановлением прогресса
          try {
            const firebaseCourses = await courseService.getAllCourses();
            const allCourses = firebaseCourses.length > 0 
              ? [...COURSES, ...firebaseCourses]
              : COURSES;
            
            console.log('📚 All courses for restore (static + firebase):', allCourses.length);
            
            // Восстанавливаем прогресс используя ВСЕ курсы
            const coursesWithProgress = userProgressService.restoreCoursesFromProgress(
              allCourses,
              progressData
            );
            
            setCourses(coursesWithProgress);
          } catch (error) {
            console.error('❌ Error loading courses in real-time update:', error);
            // Fallback: используем текущие курсы
            setCourses((prevCourses) => 
              userProgressService.restoreCoursesFromProgress(prevCourses, progressData)
            );
          }
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

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
    setUserProgress(null);
  };

  // Обработчики навигации
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

 // Показываем загрузку
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

// Лендинг для неавторизованных пользователей
if (!user && view === 'landing') {
  return <Landing onLogin={handleLogin} onRegister={handleRegister} />;
}

// ← ДОБАВЬТЕ DEBUG БЛОК ЗДЕСЬ
if (user && view === 'landing') {
  console.warn('⚠️ User logged in but view is still "landing"!');
  return (
    <div className="app-container">
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>⚠️ Debug: User logged in but view = {view}</p>
        <p>User: {user.uid}</p>
        <p>Courses: {courses.length}</p>
        <button onClick={() => setView('profile')}>Перейти к профилю</button>
      </div>
    </div>
  );
}

// Авторизованное приложение
return (
  <div className="app-container">
      <nav className="top-nav">
        <div className="logo" onClick={handleViewProfile}>
          <Icons.Brain />
          <span>EduAction</span>
        </div>
        
        <div className="nav-actions">
          <div className="user-menu-wrapper">
            <div 
              className="user-avatar" 
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={user?.displayName || 'Пользователь'}
            >
              {user?.displayName?.substring(0, 2).toUpperCase() || 'FI'}
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
                    handleViewCatalog();
                    setShowUserMenu(false);
                  }}
                  className="dropdown-item"
                >
                  <Icons.Grid />
                  <span>Каталог</span>
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
        <CoursePlayer 
          course={selectedCourse} 
          onBack={handleBack}
          userProgress={
            userProgress?.courses && Array.isArray(userProgress.courses)
              ? userProgress.courses.find((c: any) => c.courseId === selectedCourse.id)
              : undefined
          }
          onProgressUpdate={async (courseProgress) => {
            console.log('💾 Saving course progress:', courseProgress);
            
            // Безопасная работа с courses - проверяем что это массив
            const existingCourses = Array.isArray(userProgress?.courses) 
              ? userProgress.courses 
              : [];
            
            // Обновляем прогресс в существующем массиве
            const updatedCourses = existingCourses.map((c: any) => 
              c.courseId === selectedCourse.id 
                ? { courseId: selectedCourse.id, ...courseProgress } 
                : c
            );
            
            // Если курса нет в массиве - добавляем
            if (!updatedCourses.find((c: any) => c.courseId === selectedCourse.id)) {
              updatedCourses.push({ 
                courseId: selectedCourse.id, 
                ...courseProgress 
              });
            }
            
            // Создаём обновлённый объект прогресса
            const newUserProgress = {
              ...userProgress,
              courses: updatedCourses
            };
            
            // Обновляем state
            setUserProgress(newUserProgress);
            
            // Сохраняем в Firebase
            if (user) {
              try {
                await userProgressService.updateUserProgress(user.uid, newUserProgress);
                console.log('✅ Progress saved to Firebase successfully');
              } catch (error) {
                console.error('❌ Error saving to Firebase:', error);
              }
            }
          }}
        />
      )}

      {showAdminPanel && (
        <AdminPanel 
          onClose={() => {
            setShowAdminPanel(false);
            loadCoursesFromFirebase();
          }} 
        />
      )}
    </div>
  );
};

// Рендер приложения
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
