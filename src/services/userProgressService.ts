import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Course } from '../types';

const USER_PROGRESS_COLLECTION = 'userProgress';

export const userProgressService = {
  // Получение прогресса пользователя
  async getUserProgress(userId: string): Promise<any> {
    try {
      const userProgressRef = doc(db, USER_PROGRESS_COLLECTION, userId);
      const docSnap = await getDoc(userProgressRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log('No progress found for user:', userId);
        return { courses: [] };
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return { courses: [] };
    }
  },

  // Сохранение прогресса курса
  async saveCourseProgress(userId: string, course: Course): Promise<void> {
    try {
      const userProgressRef = doc(db, USER_PROGRESS_COLLECTION, userId);
      const docSnap = await getDoc(userProgressRef);
      
      let progressData: any = { courses: [] };
      
      if (docSnap.exists()) {
        progressData = docSnap.data();
      }
      
      // Инициализируем courses если его нет
      if (!Array.isArray(progressData.courses)) {
        progressData.courses = [];
      }
      
      // Ищем курс в прогрессе
      const courseIndex = progressData.courses.findIndex(
        (c: any) => c.courseId === course.id
      );
      
      const courseProgress = {
        courseId: course.id,
        progress: course.progress,
        completedDate: null,
        startedDate: course.startedDate || new Date().toISOString(),
        lastAccessDate: new Date().toISOString(),
        modules: course.modules.map(m => ({
          moduleId: m.id,
          completedDate: m.completedDate || null,
          averageScore: 0
        }))
      };
      
      if (courseIndex >= 0) {
        // Обновляем существующий курс
        progressData.courses[courseIndex] = courseProgress;
      } else {
        // Добавляем новый курс
        progressData.courses.push(courseProgress);
      }
      
      // Сохраняем в Firestore
      await setDoc(userProgressRef, progressData, { merge: true });
    } catch (error) {
      console.error('Error saving course progress:', error);
      throw error;
    }
  },

  // Обновление прогресса пользователя (НОВАЯ ФУНКЦИЯ)
  async updateUserProgress(userId: string, progressData: any): Promise<void> {
    try {
      console.log('💾 Updating user progress in Firebase:', userId);
      const userProgressRef = doc(db, USER_PROGRESS_COLLECTION, userId);
      
      // Обновляем или создаём документ
      await setDoc(userProgressRef, {
        ...progressData,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      console.log('✅ User progress updated successfully');
    } catch (error) {
      console.error('❌ Error updating user progress:', error);
      throw error;
    }
  },

  // Подписка на изменения прогресса в реальном времени
  subscribeToProgress(userId: string, callback: (data: any) => void): () => void {
    const userProgressRef = doc(db, USER_PROGRESS_COLLECTION, userId);
    
    return onSnapshot(userProgressRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    });
  },

  // Восстановление курсов с прогрессом
  restoreCoursesFromProgress(courses: Course[], progressData: any): Course[] {
    console.log('📊 Restoring progress from Firebase:', progressData);
    console.log('📚 Courses to restore:', courses);
    
    if (!progressData || !Array.isArray(progressData.courses)) {
      return courses;
    }
    
    return courses.map(course => {
      const savedProgress = progressData.courses.find(
        (cp: any) => cp.courseId === course.id
      );
      
      console.log(`🔍 Checking course ID: "${course.id}", Found in Firebase:`, !!savedProgress);
      
      if (!savedProgress) {
        console.log(`ℹ️ No saved progress for course: ${course.title}`);
        return course;
      }
      
      console.log(`✅ Restoring progress for: ${course.title}`, savedProgress);
      
      // Восстанавливаем прогресс модулей
      const restoredModules = course.modules.map(module => {
        const savedModule = savedProgress.modules?.find(
          (sm: any) => sm.moduleId === module.id
        );
        
        if (savedModule) {
          return {
            ...module,
            completedDate: savedModule.completedDate,
            averageScore: savedModule.averageScore || 0
          };
        }
        
        return module;
      });
      
      return {
        ...course,
        modules: restoredModules,
        progress: savedProgress.progress || 0,
        completedDate: savedProgress.completedDate,
        startedDate: savedProgress.startedDate,
        lastAccessDate: savedProgress.lastAccessDate
      };
    });
  }
};
