import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Course } from '../types';

const COURSES_COLLECTION = 'courses';

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    try {
      const coursesCol = collection(db, COURSES_COLLECTION);
      const courseSnapshot = await getDocs(coursesCol);
      return courseSnapshot.docs.map(doc => ({
        ...doc.data() as Course,
        id: doc.id // Firebase возвращает строковый ID
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  async addCourse(course: Omit<Course, 'id'>): Promise<string> {
    try {
      const coursesCol = collection(db, COURSES_COLLECTION);
      const docRef = await addDoc(coursesCol, course);
      return docRef.id;
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
    }
  },

  async updateCourse(courseId: string, course: Partial<Course>): Promise<void> {
    try {
      const courseDoc = doc(db, COURSES_COLLECTION, courseId);
      await updateDoc(courseDoc, course as any);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  async deleteCourse(courseId: string): Promise<void> {
    try {
      const courseDoc = doc(db, COURSES_COLLECTION, courseId);
      await deleteDoc(courseDoc);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }
};

