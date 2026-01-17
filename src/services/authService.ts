import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const authService = {
  async register(email: string, password: string, name: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential.user;
  },

  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  }
};
