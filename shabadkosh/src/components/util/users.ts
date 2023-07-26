import { DocumentReference, collection, doc, documentId, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import db from './controller'

export const usersCollection = collection(db, 'users');
export const checkUser = async (uid: string, email: string) => {
    // const userRef = doc(firestore, 'users', uid)
    // const userSnap = await getDoc(userRef);
    const q = query(usersCollection, where(documentId(), '==', uid), where('email', '==', email));
    const usersSnapshot = await getDocs(q);
    if (!usersSnapshot.empty) {
        return true;
    }
    return false;
}

export const checkIfUsernameUnique = async (username: string) => {
    const q = query(usersCollection, where('username', '==', username));
    const usersSnapshot = await getDocs(q);
    return usersSnapshot.empty;
}

export const checkIfEmailUnique = async (email: string) => {
    const q = query(usersCollection, where('email', '==', email));
    const usersSnapshot = await getDocs(q);
    return usersSnapshot.empty;
}

export const updateUser = async (userRef: DocumentReference, userData: any) => {
    const updatedUser = await setDoc(userRef, { ...userData });
    return updatedUser;
}

export const getUser = async (email: string, uid: string) => {
    // uid is the document id of the user
    const getUser = doc(usersCollection, uid);
    const userDoc = await getDoc(getUser);
    if (userDoc.exists()) {
        const user = userDoc.data();
        // check if the email matches
        if (user.email === email) {
            return user;
        }
    }
    return null;
}