import { DocumentReference, addDoc, collection, deleteDoc, documentId, getDocs, query, setDoc, where } from 'firebase/firestore';
import {firestore as db} from '../../firebase';
import { NewWordType } from '../../types/word';

export default db; 

// Words collection
export const wordsCollection = collection(db, 'words');

// add new word to words collection
export const addWord = async (wordData: any) => {
    const newWord = await addDoc(wordsCollection, {...wordData});
    // console.log(`New word added with ID: ${newWord.id}`);
    return newWord.id;
}

// update word in words collection
export const updateWord = async (word: DocumentReference, wordData: NewWordType) => {
    const updatedWord = await setDoc(word, {...wordData});
    // console.log(`Word updated with ID: ${updatedWord}`);
    return updatedWord;
}

export const deleteWord = async (word: DocumentReference) => {
    const delWord = await deleteDoc(word);
    return delWord;
}

// get word from words collection
export const getWords = async () => {
    const querySnapshot = await getDocs(wordsCollection);
    const words: any[] = [];
    querySnapshot.forEach((doc) => {
        words.push({...doc.data(), id: doc.id});
    });
    return words;
}

// set word status as reviewed
export const reviewWord = async (word: DocumentReference, wordData: NewWordType) => {
    const revWord = await setDoc(word, {...wordData, status: 'reviewed'});
    return revWord;
}

// get word from a list of word ids
export const getWordsByIdList = async (idList: string[]) => {
    if (idList.length > 0) {
        const q = query(wordsCollection, where(documentId(), 'in', idList));
        const result = await getDocs(q);
        return result.docs;
    }
}

// Sentences collection
export const sentencesCollection = collection(db, 'sentences');

export const addSentence = async (sentenceData: any) => {
    const newSentence = await addDoc(sentencesCollection, {...sentenceData});
    // console.log(`New sentence added with ID: ${newSentence.id}`);
    return newSentence.id;
}

export const updateSentence =async (sentence: DocumentReference, sentenceData: any) => {
    const updatedSentence = await setDoc(sentence,{...sentenceData});
    // console.log(`Sentence updated with ID: ${updatedSentence}`);
    return updatedSentence;
}

export const deleteSentence = async (sentence: DocumentReference) => {
    const delSentence = deleteDoc(sentence);
    // console.log(`Sentence with id ${sentence.id} has been deleted!`);
    return delSentence;
}

// delete sentence by word id
export const deleteSentenceByWordId = async (wordId: string) => {
    const querySnapshot = await getDocs(sentencesCollection);
    querySnapshot.forEach((doc) => {
        if (doc.data().wordId === wordId) {
            deleteSentence(doc.ref);
        }
    });
}

// Questions collection
export const questionsCollection = collection(db, 'questions');

export const addQuestion = async (questionData: any) => {
    const newQuestion = await addDoc(questionsCollection, {...questionData});
    // console.log(`New sentence added with ID: ${newQuestion.id}`);
    return newQuestion.id;
}

export const updateQuestion =async (question: DocumentReference, questionData: any) => {
    const updatedQuestion = await setDoc(question,{...questionData});
    // console.log(`Question updated with ID: ${updatedQuestion}`);
    return updatedQuestion;
}

export const deleteQuestion = async (question: DocumentReference) => {
    const delQuestion = deleteDoc(question);
    // console.log(`Question with id ${question.id} has been deleted!`);
    return delQuestion;
}

// delete question by word id
export const deleteQuestionByWordId = async (wordId: string) => {
    const querySnapshot = await getDocs(questionsCollection);
    querySnapshot.forEach((doc) => {
        if (doc.data().wordId === wordId) {
            deleteQuestion(doc.ref);
        }
    });
}

// Wordlists collection
export const wordlistsCollection = collection(db, 'wordlists');

export const addNewWordlist = async (wordlistData: any) => {
    const newWordlist = await addDoc(wordlistsCollection, {...wordlistData});
    console.log(`New wordlist added with ID: ${newWordlist.id}`);
    return newWordlist.id;
}

export const updateWordlist = async (wordlist: DocumentReference, wordlistData: any) => {
    const updatedWordlist = await setDoc(wordlist, {...wordlistData});
    console.log('Updated Wordlist!');
    return updatedWordlist;
}

export const deleteWordlist = async (wordlist: DocumentReference) => {
    const delWordlist = await deleteDoc(wordlist);
    return delWordlist;
}

export const usersCollection = collection(db, 'users');