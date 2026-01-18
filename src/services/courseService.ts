import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Course } from '../types';

const COURSES_COLLECTION = 'courses';

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    try {
      console.log('🔄 Fetching courses from Firestore...'); // ← ДОБАВЛЕНО
      const coursesCol = collection(db, COURSES_COLLECTION);
      const courseSnapshot = await getDocs(coursesCol);
      
      const courses = courseSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data as Course,
          id: doc.id // Firebase возвращает строковый ID
        };
      });
      
      console.log(`✅ Loaded ${courses.length} courses from Firebase:`, courses.map(c => ({id: c.id, title: c.title}))); // ← ДОБАВЛЕНО
      return courses;
    } catch (error) {
      console.error('❌ Error fetching courses:', error); // ← УЛУЧШЕНО
      return []; // ← ИЗМЕНЕНО: возвращаем пустой массив вместо throw
    }
  },

  async addCourse(course: Omit<Course, 'id'>): Promise<string> {
    try {
      console.log('➕ Adding new course to Firestore:', course.title); // ← ДОБАВЛЕНО
      const coursesCol = collection(db, COURSES_COLLECTION);
      const docRef = await addDoc(coursesCol, course);
      console.log('✅ Course added with ID:', docRef.id); // ← ДОБАВЛЕНО
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding course:', error);
      throw error;
    }
  },

  async updateCourse(courseId: string, course: Partial<Course>): Promise<void> {
    try {
      console.log('📝 Updating course:', courseId); // ← ДОБАВЛЕНО
      const courseDoc = doc(db, COURSES_COLLECTION, courseId);
      await updateDoc(courseDoc, course as any);
      console.log('✅ Course updated successfully'); // ← ДОБАВЛЕНО
    } catch (error) {
      console.error('❌ Error updating course:', error);
      throw error;
    }
  },

  async deleteCourse(courseId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting course:', courseId); // ← ДОБАВЛЕНО
      const courseDoc = doc(db, COURSES_COLLECTION, courseId);
      await deleteDoc(courseDoc);
      console.log('✅ Course deleted successfully'); // ← ДОБАВЛЕНО
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      throw error;
    }
  }
};
