import { userProgressService } from './userProgressService';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const authService = {
    async register(email: string, password: string, name: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Обновить displayName
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });

        // Создать профиль в Firestore
        await userProgressService.createUserProfile(
          userCredential.user.uid,
          name,
          email
        );
      }
      
      return userCredential.user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  },

    async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Обновить последний вход
      if (userCredential.user) {
        await userProgressService.updateLastLogin(userCredential.user.uid);
      }
      
      return userCredential.user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  },


  async logout(): Promise<void> {
    await signOut(auth);
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  }
};
