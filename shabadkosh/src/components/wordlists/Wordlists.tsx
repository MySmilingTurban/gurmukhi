
import { onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { NewUserType } from '../../types/user';
import { useUserAuth } from '../UserAuthContext';
import { usersCollection, wordlistsCollection } from '../util/controller';
import { Badge, Button, ButtonGroup, Card, ListGroup } from 'react-bootstrap';

function Wordlists() {
    const [ isLoading, setIsLoading ] = useState<boolean>(true);
    const [ wordlists, setWordlists ] = useState<any>([]);
    const { user } = useUserAuth();
  
    useEffect(() => {
        setIsLoading(true);
        onSnapshot(wordlistsCollection, (snapshot:
        QuerySnapshot<DocumentData>) => {
        console.log("snapshot", snapshot);
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
        let sortedWordlists = unwordlists.sort(
          (p1, p2) => (p1.updated_at < p2.updated_at) ? 1 : (p1.updated_at > p2.updated_at) ? -1 : 0);

        return sortedWordlists;
    }

    const wordlistsData = sortWordlists(wordlists)?.map((wordlist) => {
        const viewUrl = `/wordlist/${wordlist.id}`;
        const editUrl = `/wordlists/edit/${wordlist.id}`;
        return (
            <ListGroup.Item
              key={wordlist.id}
              className="d-flex justify-content-between align-items-start"
              style={{width: "80%"}}
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
                  <Button href={viewUrl} style={{backgroundColor: "transparent", border: "transparent"}}>👁️</Button>
                  <Button href={editUrl} style={{backgroundColor: "transparent", border: "transparent"}}>🖊️</Button>
                  <Button style={{backgroundColor: "transparent", border: "transparent"}} hidden={user?.role != "admin"}>🗑️</Button>
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
                    {wordlistsData
                    // sortWordlists(wordlists)?.map((ele, idx) => {
                    //     return <Card className='p-4'>
                    //         <Card.Body>
                    //         <Card.Title>{ele.name}</Card.Title>
                    //         <Card.Text>
                    //             Status: {ele.status}<br/>
                    //             Metadata:<br/>
                    //             <ul>
                    //                 <li>Curriculum: {ele.metadata.curriculum}</li>
                    //                 <li>Level: {ele.metadata.level}</li>
                    //                 <li>Subgroup: {ele.metadata.subgroup}</li>
                    //             </ul>

                    //             <Badge pill bg="primary" text="white" hidden={!ele.status}>
                    //                 {ele.status}
                    //             </Badge>
                    //         </Card.Text>
                    //         </Card.Body>
                    //     </Card>
                    // })
                    }
                </ListGroup>
            ) : <h2>No wordlists found. Please create one.</h2>
            }
        </div>
    )
}

export default Wordlists;