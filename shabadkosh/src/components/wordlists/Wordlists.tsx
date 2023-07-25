
import { onSnapshot, QuerySnapshot, DocumentData, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useUserAuth } from '../UserAuthContext';
import { deleteWordlist, wordlistsCollection } from '../util/controller';
import { Badge, Button, ButtonGroup, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../../firebase';

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

    const delWordlist = (wordlist: any) => {
      const response = confirm(`Are you sure you want to delete this wordlist: ${wordlist.name}? \n This action is not reversible.`);
      if (response) {
        const getWordlist = doc(firestore, `wordlists/${wordlist.id}`);
        deleteWordlist(getWordlist).then(() => {
          alert('Word deleted!');
        }).catch((error) => {
          console.log(error);
        });
      } else {
        console.log('Operation abort!');
      }
    }

    const wordlistsData = sortWordlists(wordlists)?.map((wordlist) => {
        const viewUrl = `/wordlists/${wordlist.id}`;
        const editUrl = `/wordlists/edit/${wordlist.id}`;
        return (
            <ListGroup.Item
              key={wordlist.id}
              className="d-flex justify-content-between align-items-start"
              >
              <div className="ms-2 me-auto">
                <h3 className="fw-bold">{wordlist.name}</h3>
                <ul>
                    {wordlist.metadata.curriculum ? <li>Curriculum: {wordlist.metadata.curriculum}</li> : null}
                    {wordlist.metadata.level ? <li>Level: {wordlist.metadata.level}</li> : null}
                    {wordlist.metadata.subgroup ? <li>`Subgroup: ${wordlist.metadata.subgroup}` </li>: null}
                </ul>
              </div>
              <div className="d-flex flex-column align-items-end">
                <ButtonGroup>
                  <Button href={viewUrl} variant='success'>View</Button>
                  <Button href={editUrl} variant='primary'>Edit</Button>
                  {user?.role === 'admin' ? <Button onClick={() => delWordlist(wordlist)} variant='danger' >Delete</Button> : null }
                </ButtonGroup>
                <Badge pill bg="primary" text="white" hidden={!wordlist.status} className='mt-2'>
                  {wordlist.status}
                </Badge>
              </div>
            </ListGroup.Item>
          )
    });

    if (wordlists.length === 0 || isLoading) return <h2>Loading...</h2>;
    return (
        <div className='container mt-2'>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <h2>Wordlists</h2>
            <Button href='/wordlists/new'>Add new Wordlist</Button>
          </div>
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