import React, { useEffect, useState } from 'react'
import { Card, Breadcrumb, Badge, ListGroup, ButtonGroup, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { NewWordType } from '../../types/word';
import { onSnapshot, QuerySnapshot, DocumentData, getDoc, doc } from 'firebase/firestore';
import { deleteWordlist, getWordsByIdList, wordsCollection } from '../util/controller';
import { firestore } from '../../firebase';
import { TimestampType } from '../../types/timestamp';
import { useUserAuth } from '../UserAuthContext';

interface Word {
    id: string;
    word: string;
}

function ViewWordlist() {
    const {wlid} = useParams();
    const {user} = useUserAuth();
    const getWordlist = doc(firestore, `wordlists/${wlid}`);

    const [wordlist, setWordlist] = useState<any>({});
    const [found, setFound] = useState<boolean>(true);
    const [words, setWords] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchWordlist = async () => {
            setIsLoading(true);
            const docSnap = await getDoc(getWordlist);
            if (docSnap.exists()) {
                const newWordObj = {
                    id: docSnap.id,
                    created_at: docSnap.data().created_at,
                    updated_at: docSnap.data().updated_at,
                    created_by: docSnap.data().created_by,
                    words: docSnap.data().words,
                    ...docSnap.data(),
                };
                setWordlist(newWordObj);
                const data = await getWordsByIdList(newWordObj.words);
                const listOfWords = data?.map((ele) => {
                    return {
                        id: ele.id,
                        word: ele.data().word
                    } as Word;
                })
                setWords(listOfWords ?? []);
                setIsLoading(false);
            } else {
                console.log("No such document!");
                setFound(false);
                setIsLoading(false);
            }
        };
        fetchWordlist();
      }, []);

    function convertTimestampToDate(timestamp: TimestampType) {
        let timestampDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        return timestampDate.toLocaleString('en-us', { year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
    }
    
    const wordsData = words?.map((ele) => {
        return (<li style={{width: '150px'}}>{ele.word}</li>)
    });
    
    const editUrl = `/wordlists/edit/${wordlist.id}`;
    const delWordlist = (wordlist: any) => {
        const response = confirm(`Are you sure you want to delete this word: ${wordlist.name}? \n This action is not reversible.`);
        if (response) {
          const getWordlist = doc(firestore, `wordlists/${wordlist.id}`);
          deleteWordlist(getWordlist).then(() => {
            alert("Word deleted!");
            console.log(`Deleted word with id: ${wordlist.id}!`);
          }).catch((error) => {
            console.log(error);
          });
        } else {
          console.log("Operation abort!");
        }
      }

    if (isLoading) return <h2>Loading...</h2>
    if (!found) return <h2>Word not found!</h2>;
    return (
        <Card className="details p-5">
        <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/wordlists">Wordlists</Breadcrumb.Item>
            <Breadcrumb.Item active>{wordlist.name}</Breadcrumb.Item>
        </Breadcrumb>
        {Object.keys(wordlist) && Object.keys(wordlist).length && (
            <div className="d-flex flex-column justify-content-evenly">
                <h2>{wordlist.name}</h2>
                <ButtonGroup style={{ display: 'flex' ,width: '150px', alignSelf: 'end'}}>
                    <Button href={editUrl}>Edit</Button>
                    <Button onClick={() => delWordlist(wordlist)} variant="danger" hidden={user?.role != "admin"}>Delete</Button>
                </ButtonGroup>
                <span className="badge bg-primary" style={{width: '6rem'}}>{wordlist.status}</span>
                <br /><br />
                <h5><b>Words:</b></h5>
                <ul>
                    {wordsData}
                </ul>
                <div className="d-flex flex-column justify-content-evenly">
                    <p>
                        <h5><b>Metadata</b></h5>
                        <h6>&nbsp;Curriculum: {wordlist.metadata?.curriculum}</h6>
                        <h6>&nbsp;Level: {wordlist.metadata?.level}</h6>
                        <h6>&nbsp;Subgroup: {wordlist.metadata?.subgroup}</h6>
                    </p>

                    <p  className="mt-3" hidden={!wordlist.notes}>
                        <b>Notes:</b> {wordlist.notes}
                    </p>

                    <br />
                    <h5><b>Info</b></h5>
                    <div className="d-flex justify-content-between flex-column">
                        <h6>Created by: {wordlist.created_by ? wordlist.created_by : 'Unknown' }</h6>
                        <h6>Created at: {convertTimestampToDate(wordlist.created_at)}</h6>
                        <h6>Last updated by: {wordlist.updated_by ? wordlist.updated_by : 'Unknown'}</h6>
                        <h6>Last updated: {convertTimestampToDate(wordlist.updated_at)}</h6>
                    </div>
              </div>
            </div>
        )}
        </Card>
    )
}

export default ViewWordlist;