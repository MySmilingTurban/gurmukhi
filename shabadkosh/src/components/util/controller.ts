import { DocumentReference, Timestamp, addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, documentId, getDoc, getDocs, query, setDoc, where, writeBatch } from 'firebase/firestore';
import {firestore as db, firestore} from '../../firebase';
import { NewWordType } from '../../types/word';
import { MiniWordlist } from '../../types/wordlist';

export default db; 

// Words collection
export const wordsCollection = collection(db, 'words');

// add new word to words collection
export const addWord = async (word_data: any) => {
    const newWord = await addDoc(wordsCollection, {...word_data});
    // console.log(`New word added with ID: ${newWord.id}`);
    return newWord.id;
}

// update word in words collection
export const updateWord = async (word: DocumentReference, word_data: NewWordType) => {
    const updatedWord = await setDoc(word, {...word_data});
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
export const reviewWord = async (word: DocumentReference, word_data: NewWordType, status: string, updated_by: string) => {
    const revWord = await setDoc(word, {...word_data, status, updated_at: Timestamp.now(), updated_by});
    return revWord;
}

// get word from a list of word ids
export const getWordsByIdList = async (id_list: string[]) => {
    if (id_list.length > 0) {
        const q = query(wordsCollection, where(documentId(), 'in', id_list));
        const result = await getDocs(q);
        return result.docs;
    }
}

// Sentences collection
export const sentencesCollection = collection(db, 'sentences');

export const addSentence = async (sentence_data: any) => {
    const newSentence = await addDoc(sentencesCollection, {...sentence_data});
    // console.log(`New sentence added with ID: ${newSentence.id}`);
    return newSentence.id;
}

export const updateSentence =async (sentence: DocumentReference, sentence_data: any) => {
    const updatedSentence = await setDoc(sentence,{...sentence_data});
    // console.log(`Sentence updated with ID: ${updatedSentence}`);
    return updatedSentence;
}

export const deleteSentence = async (sentence: DocumentReference) => {
    const delSentence = deleteDoc(sentence);
    // console.log(`Sentence with id ${sentence.id} has been deleted!`);
    return delSentence;
}

// delete sentence by word id
export const deleteSentenceByWordId = async (word_id: string) => {
    const q = query(sentencesCollection, where('word_id', '==', word_id));
    const querySnapshot = await getDocs(q).then((data) => {
        data.docs.forEach((doc) => {
            if (doc.data().word_id === word_id) {
                deleteDoc(doc.ref);
            }
        });
    })
    return querySnapshot
}

// Questions collection
export const questionsCollection = collection(db, 'questions');

export const addQuestion = async (question_data: any) => {
    const newQuestion = await addDoc(questionsCollection, {...question_data});
    // console.log(`New sentence added with ID: ${newQuestion.id}`);
    return newQuestion.id;
}

export const updateQuestion =async (question: DocumentReference, question_data: any) => {
    const updatedQuestion = await setDoc(question,{...question_data});
    // console.log(`Question updated with ID: ${updatedQuestion}`);
    return updatedQuestion;
}

export const deleteQuestion = async (question: DocumentReference) => {
    const delQuestion = deleteDoc(question);
    // console.log(`Question with id ${question.id} has been deleted!`);
    return delQuestion;
}

// delete question by word id
export const deleteQuestionByWordId = async (word_id: string) => {
    const q = query(questionsCollection, where('word_id', '==', word_id));
    const querySnapshot = await getDocs(q).then((data) => {
        data.docs.forEach((doc) => {
            if (doc.data().word_id === word_id) {
                deleteDoc(doc.ref);
            }
        });
    })
    return querySnapshot
}

// Wordlists collection
export const wordlistsCollection = collection(db, 'wordlists');

export const addNewWordlist = async (wordlist_data: any) => {
    const newWordlist = await addDoc(wordlistsCollection, {...wordlist_data});
    console.log(`New wordlist added with ID: ${newWordlist.id}`);
    return newWordlist.id;
}

export const getWordlist = async (wordlist_ref: DocumentReference) => {
    const gotWlist = await getDoc(wordlist_ref);
    return gotWlist;
}

export const updateWordlist = async (wordlist: DocumentReference, wordlist_data: any) => {
    const updatedWordlist = await setDoc(wordlist, {...wordlist_data});
    console.log('Updated Wordlist!');
    return updatedWordlist;
}

export const deleteWordlist = async (wordlist: DocumentReference) => {
    const delWordlist = await deleteDoc(wordlist);
    return delWordlist;
}

// get word from a list of word ids
export const getWordlistsByIdList = async (id_list: string[]) => {
    if (id_list.length > 0) {
        const q = query(wordlistsCollection, where(documentId(), 'in', id_list));
        const result = await getDocs(q);
        return result.docs;
    }
}

// get wordlists with a word id as a part of it
export const getWordlistsByWordId = async (word_id: string) => {
    const q = query(wordlistsCollection, where('words', 'array-contains', word_id))
    const result = await getDocs(q);
    return result.docs;
}

// set word in wordlist
export const setWordInWordlists = async (add_wlist_ids: MiniWordlist[], rem_wlist_ids: MiniWordlist[], word_id: string) => {
    const batch = writeBatch(firestore)
    if (add_wlist_ids.length > 0) {
        add_wlist_ids.map((wlist: MiniWordlist) => {
            const wlistRef = doc(firestore, 'wordlists', wlist.id as string)
            batch.update(wlistRef, {words: arrayUnion(word_id)})
        })
    }
    if (rem_wlist_ids.length > 0) {
        rem_wlist_ids.map((wlist: MiniWordlist) => {
            const wlistRef = doc(firestore, 'wordlists', wlist.id as string)
            batch.update(wlistRef, {words: arrayRemove(word_id)})
        })
    }
    const res = await batch.commit()
    return res
}

export const removeWordFromWordlists = async (word_id: string) => {
    const batch = writeBatch(firestore)
    await getWordlistsByWordId(word_id).then((ele) => {
        ele.map((val, idx) => {
            const wlRef = doc(firestore, 'wordlists', val.id)
            const data = val.data()
            console.log('wl ', idx, val.id, data)
            batch.update(wlRef, {words: arrayRemove(word_id)})
        })
    })
    const res = await batch.commit()
    return res
}

export const addWordIdToWordlists = async (wordlist_ids: string[], word_id: string) => {
    const batch = writeBatch(firestore)
    if (wordlist_ids.length > 0) {
        wordlist_ids.map((wlid: string) => {
            const wlRef = doc(firestore, 'wordlists', wlid)
            console.log('added wordlist: ', wlid)
            batch.update(wlRef, {words: arrayUnion(word_id)})
        })
    }
    const res = await batch.commit()
    return res
}
