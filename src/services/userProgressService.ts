import { doc, setDoc, getDoc, updateDoc, collection, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Course, Module, QuizResult } from '../types';

export interface UserProgressData {
  courses: {
    [courseId: string]: {
      progress: number;
      startedDate: string;
      lastAccessDate: string;
      completedDate: string | null;
      averageScore: number;
      modules: {
        [moduleId: string]: {
          completed: boolean;
          completedDate: string | null;
          quizResults: QuizResult[];
        };
      };
    };
  };
}

export const userProgressService = {
  // Создать профиль пользователя при регистрации
  async createUserProfile(userId: string, displayName: string, email: string) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        displayName,
        email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  // Обновить время последнего входа
  async updateLastLogin(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  },

  // Получить весь прогресс пользователя
  async getUserProgress(userId: string): Promise<UserProgressData | null> {
    try {
      const progressRef = doc(db, 'userProgress', userId);
      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        return progressSnap.data() as UserProgressData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  },

  // Сохранить/обновить прогресс курса
  async saveCourseProgress(userId: string, course: Course) {
    try {
      const progressRef = doc(db, 'userProgress', userId);
      const courseData = {
        progress: course.progress,
        startedDate: course.startedDate || new Date().toLocaleDateString('ru-RU'),
        lastAccessDate: new Date().toLocaleDateString('ru-RU'),
        completedDate: course.progress === 100 ? new Date().toLocaleDateString('ru-RU') : null,
        averageScore: course.averageScore || 0,
        modules: {} as any,
      };

      // Преобразуем модули в объект
      course.modules.forEach((module) => {
        courseData.modules[module.id] = {
          completed: module.completed,
          completedDate: module.completedDate || null,
          quizResults: module.quizResults || [],
        };
      });

      // Обновляем или создаем документ
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        await updateDoc(progressRef, {
          [`courses.${course.id}`]: courseData,
        });
      } else {
        await setDoc(progressRef, {
          courses: {
            [course.id]: courseData,
          },
        });
      }
    } catch (error) {
      console.error('Error saving course progress:', error);
      throw error;
    }
  },

  // Обновить прогресс модуля
  async updateModuleProgress(
    userId: string,
    courseId: string,
    moduleId: string,
    completed: boolean,
    quizResults?: QuizResult[]
  ) {
    try {
      const progressRef = doc(db, 'userProgress', userId);
      const updateData: any = {
        [`courses.${courseId}.modules.${moduleId}.completed`]: completed,
        [`courses.${courseId}.lastAccessDate`]: new Date().toLocaleDateString('ru-RU'),
      };

      if (completed) {
        updateData[`courses.${courseId}.modules.${moduleId}.completedDate`] = 
          new Date().toLocaleDateString('ru-RU');
      }

      if (quizResults) {
        updateData[`courses.${courseId}.modules.${moduleId}.quizResults`] = quizResults;
      }

      await updateDoc(progressRef, updateData);
    } catch (error) {
      console.error('Error updating module progress:', error);
      throw error;
    }
  },

  // Подписаться на изменения прогресса (real-time)
  subscribeToProgress(userId: string, callback: (progress: UserProgressData | null) => void) {
    const progressRef = doc(db, 'userProgress', userId);
    
    return onSnapshot(progressRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProgressData);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error in progress subscription:', error);
      callback(null);
    });
  },

  // Восстановить курсы из прогресса Firebase
  restoreCoursesFromProgress(courses: Course[], progressData: UserProgressData | null): Course[] {
    if (!progressData || !progressData.courses) {
      return courses;
    }

    return courses.map((course) => {
      const savedProgress = progressData.courses[course.id];
      
      if (!savedProgress) {
        return course;
      }

      // Восстанавливаем модули
      const restoredModules = course.modules.map((module) => {
        const savedModule = savedProgress.modules[module.id];
        
        if (!savedModule) {
          return module;
        }

        return {
          ...module,
          completed: savedModule.completed,
          completedDate: savedModule.completedDate,
          quizResults: savedModule.quizResults || [],
        };
      });

      // Восстанавливаем курс
      return {
        ...course,
        progress: savedProgress.progress,
        startedDate: savedProgress.startedDate,
        lastAccessDate: savedProgress.lastAccessDate,
        completedDate: savedProgress.completedDate,
        averageScore: savedProgress.averageScore,
        modules: restoredModules,
      };
    });
  },
};
