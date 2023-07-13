
import { onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useUserAuth } from '../UserAuthContext';
import { wordlistsCollection } from '../util/controller';
import { Badge, Button, ButtonGroup, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Wordlists() {
    const [ isLoading, setIsLoading ] = useState<boolean>(true);
    const [ wordlists, setWordlists ] = useState<any>([]);
    const { user } = useUserAuth();
    const navigate = useNavigate();
    if (!user) navigate('/');
  
    useEffect(() => {
      setIsLoading(true);
      onSnapshot(wordlistsCollection, (snapshot:
      QuerySnapshot<DocumentData>) => {
        setWordlists(
          snapshot.docs.map((doc) => {
            return {
                id: doc.id,
                ...doc.data(),
            };
          })
        );
      });

      setIsLoading(false);
    }, []);

    const sortWordlists = (unwordlists: any[]) => {
        const sortedWordlists = unwordlists.sort(
          (p1, p2) => (p1.updated_at < p2.updated_at) ? 1 : (p1.updated_at > p2.updated_at) ? -1 : 0);

        return sortedWordlists;
    };

    const wordlistsData = sortWordlists(wordlists)?.map((wordlist) => {
        const viewUrl = `/wordlists/${wordlist.id}`;
        const editUrl = `/wordlists/edit/${wordlist.id}`;
        return (
            <ListGroup.Item
              key={wordlist.id}
              className="d-flex justify-content-between align-items-start"
              style={{width: '80%'}}
              >
              <div className="ms-2 me-auto">
                <h3 className="fw-bold">{wordlist.name}</h3>
                <ul>
                    <li>Curriculum: {wordlist.metadata.curriculum}</li>
                    <li>Level: {wordlist.metadata.level}</li>
                    <li>{wordlist.metadata.subgroup ? `Subgroup: ${wordlist.metadata.subgroup}` : ''}</li>
                </ul>
              </div>
              <div className="d-flex flex-column align-items-end">
                <ButtonGroup>
                  <Button href={viewUrl} style={{backgroundColor: 'transparent', border: 'transparent'}}>👁️</Button>
                  <Button href={editUrl} style={{backgroundColor: 'transparent', border: 'transparent'}}>🖊️</Button>
                </ButtonGroup>
                <Badge pill bg="primary" text="white" hidden={!wordlist.status}>
                  {wordlist.status}
                </Badge>
              </div>
            </ListGroup.Item>
          )
    });

    if (wordlists.length === 0 || isLoading) return <h2>Loading...</h2>;
    return (
        <div className='container mt-2'>
            <h2>Wordlists</h2>
            <Button href='/wordlists/new'>Add new Wordlist</Button>
            {wordlists && wordlists.length ? (
                <ListGroup>
                    {wordlistsData}
                </ListGroup>
            ) : <h2>No wordlists found. Please create one.</h2>
            }
        </div>
    )
}

export default Wordlists;