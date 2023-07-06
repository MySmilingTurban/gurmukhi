import React, { useEffect, useState } from 'react'
import { Card, Breadcrumb } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { NewWordType } from '../../types/word';
import { onSnapshot, QuerySnapshot, DocumentData, getDoc, doc } from 'firebase/firestore';
import { wordsCollection } from '../util/controller';
import { firestore } from '../../firebase';

interface Word {
    id: string;
    word: string;
}

function ViewWordlist() {
    const {wlid} = useParams();
    const getWordlist = doc(firestore, `wordlists/${wlid}`);

    const [wordlist, setWordlist] = useState<any>({});
    const [words, setWords] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchWords = async () => {
          setIsLoading(true);
          onSnapshot(wordsCollection, (snapshot:
          QuerySnapshot<DocumentData>) => {
          console.log("snapshot", snapshot);
          setWords(
              snapshot.docs.map((doc) => {
              return {
                  id: doc.id,
                  word: doc.data().word,
              };
              })
          );
          });
  
          setIsLoading(false);
        }
        const fetchWordlist = async () => {
            setIsLoading(true);
            const docSnap = await getDoc(getWordlist);
            if (docSnap.exists()) {
            const newWordObj = {
                id: docSnap.id,
                created_at: docSnap.data().created_at,
                updated_at: docSnap.data().updated_at,
                created_by: docSnap.data().created_by,
                ...docSnap.data(),
            };
            setWordlist(newWordObj);
            setIsLoading(false);
            } else {
                console.log("No such document!");
                setIsLoading(false);
            }
        };
        fetchWords();
        fetchWordlist();
      }, []);

    if (isLoading) return <h2>Loading...</h2>
    return (
        <Card className="details p-5">
        <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/wordlists">Wordlists</Breadcrumb.Item>
            <Breadcrumb.Item active>{wordlist.name}</Breadcrumb.Item>
        </Breadcrumb>
        <h2>Wordlist Detail for {wordlist.name}</h2>

        
        
        </Card>
    )
}

export default ViewWordlist;