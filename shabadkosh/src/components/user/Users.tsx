/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Button, Container, ListGroup, ButtonGroup } from 'react-bootstrap';
import { deleteWord } from '../util/controller';
import { DocumentData, QuerySnapshot, doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { useUserAuth } from '../UserAuthContext';
import { NewUserType } from '../../types/user';
import { usersCollection } from '../util/users';

function Users() {
  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  const [users, setUsers] = useState<NewUserType[]>([]);
  const { user } = useUserAuth();

  useEffect(() => {
    setIsLoading(true);
    if (user?.role !== 'admin') {
        onSnapshot(usersCollection, (snapshot:
        QuerySnapshot<DocumentData>) => {
        setUsers(
            snapshot.docs.map((doc) => {
            return {
                id: doc.id,
                created_at: doc.data().created_at,
                updated_at: doc.data().updated_at,
                created_by: doc.data().created_by,
                ...doc.data(),
            };
            })
        );
        });

        setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  // console.log("Words", words);
  const sortedUsers = users.sort(
    (p1, p2) => (p1.updated_at < p2.updated_at) ? 1 : (p1.updated_at > p2.updated_at) ? -1 : 0);
  // console.log("Sorted words: ", sortedWords);

  const delUser = (user: any) => {
    const response = confirm(`Are you sure you to delete this user: ${user.name}? \n This action is not reversible.`);
    if (response) {
      const getWord = doc(firestore, `users/${user.id}`);
      deleteWord(getWord).then(() => {
        alert('User deleted!');
        console.log(`Deleted user with id: ${user.id}!`);
      });
    } else {
      console.log('Operation abort!');
    }
  }

  const usersData = sortedUsers?.map((cuser) => {
    const editUrl = `/users/edit/${cuser.id}`;
    return (
        <ListGroup.Item
          key={cuser.id}
          className="d-flex justify-content-between align-items-start">
          <div className="ms-2 me-auto">
            <h5 className="fw-bold">{cuser.name}</h5>
            <p>Email: {cuser.email}</p>
            <p>Role: {cuser.role}</p>
          </div>
          <div className="d-flex flex-column align-items-end">
            <ButtonGroup>
              <Button href={editUrl} style={{backgroundColor: 'transparent', border: 'transparent'}} hidden={user?.role != 'admin'}>🖊️</Button>
              <Button onClick={() => delUser(cuser)} style={{backgroundColor: 'transparent', border: 'transparent'}} hidden={user?.role != 'admin'}>🗑️</Button>
            </ButtonGroup>
          </div>
        </ListGroup.Item>
      )
  });

  if (users.length === 0 || isLoading) return <h2>Loading...</h2>;
  if (user?.role != 'admin') return <h2>Sorry, you are not authorized to view this page.</h2>;
  return (
    <div className="container">
      <h2>Users</h2>
        {users && users.length ? (
          <div className="d-flex ms-2 justify-content-evenly">
          <Container className='p-4'>
            <ListGroup>{usersData}</ListGroup>
          </Container>
        </div>
        ) : (
          <h2 className="no-words">There are no users. Please add one.</h2>
        )}
  </div>
);
}


export default Users;
