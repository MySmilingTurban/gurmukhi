/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Badge, ListGroup, ButtonGroup, Form } from 'react-bootstrap';
import { deleteQuestionByWordId, deleteSentenceByWordId, deleteWord, removeWordFromWordlists, wordsCollection } from '../util/controller';
import { DocumentData, QuerySnapshot, doc, onSnapshot } from 'firebase/firestore';
import { NewWordType, Status } from '../../types/word';
import { firestore } from '../../firebase';
import { useUserAuth } from '../UserAuthContext';
import { astatus, cstatus, rstatus } from '../constants';
import { useNavigate } from 'react-router-dom';

function ViewDictionary() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState('');
  const [listView, setListView] = useState<boolean>(false);
  const [words, setWords] = useState<NewWordType[]>([]);
  const [filteredWords, setFilteredWords] = useState<NewWordType[]>([]);
  const {user} = useUserAuth();
  const navigate = useNavigate();

  let statusList = {} as Status;
  if (user.role === 'admin') {
    statusList = astatus
  } else if (user.role === 'reviewer') {
    statusList = rstatus
  } else if (user.role === 'creator') {
    statusList = cstatus
  }

  const handleSearch = async (event: any) => {
    event.preventDefault();
    console.log('query', query);
  };

  useEffect(() => {
    let localWords = words;
    if (query.match('[\u0A00-\u0A76,.]+')) {
      localWords = words.filter((word) => word.word?.includes(query));
    } else if (query.match('[a-zA-Z ]+')) {
      localWords = words.filter((word) => word.translation?.toLowerCase().includes(query));
    } else {
      console.log(query);
    }
    handleFilter(filter, status, localWords);

  }, [query, filter, status]);

  useEffect(() => {
    setIsLoading(true);
    onSnapshot(wordsCollection, (snapshot:
      QuerySnapshot<DocumentData>) => {
      const data = snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            created_at: doc.data().created_at,
            updated_at: doc.data().updated_at,
            created_by: doc.data().created_by,
            updated_by: doc.data().updated_by,
            ...doc.data(),
          };
        });
      setWords(data);
      setFilteredWords(data);
    });

    setIsLoading(false);
  }, []);

  const sortWords = (unwords: NewWordType[]) => {
    const sortedWords = unwords.sort(
      (p1, p2) => (p1.updated_at < p2.updated_at) ? 1 : (p1.updated_at > p2.updated_at) ? -1 : 0);

    // filter words by user role
    // if (user?.role === 'creator') {
    //   sortedWords = sortedWords.filter((word) => ['creating-english', 'creating-punjabi', 'creating', 'feedback-english', 'feedback-punjabi'].includes(word.status ?? ''));
    // } else if (user?.role === 'reviewer') {
    //   sortedWords = sortedWords.filter((word) => ['reviewing', 'created'].includes(word.status ?? ''));
    // } else if (user?.role === 'admin') {
    //   // no change, admin can view all
    // } else {
    //   sortedWords = sortedWords.filter((word) => ['...'].includes(word.status ?? ''));
    // }
    return sortedWords;
  }
  // console.log('Sorted words: ', sortedWords);

  const delWord = (word: any) => {
    // add code to remove word_id from its respective wordlist
    const response = confirm(`Are you sure you want to delete this word: ${word.word}? \n This action is not reversible.`);
    if (response) {
      const getWord = doc(firestore, `words/${word.id}`);
      removeWordFromWordlists(word.id).then(() => {
        deleteWord(getWord).then(() => {
          deleteSentenceByWordId(word.id).then(() => {
            deleteQuestionByWordId(word.id).then(() => {
              alert('Word deleted!');
              setIsLoading(false)
              navigate('/words');
            })
          })
        })
      })
    } else {
      console.log('Operation abort!');
    }
  }

  const handleFilter = (filterVal = filter, statusVal = status, filterList = words) => {
    if (filterVal === 'created_by_me') {
      filterList = filterList.filter((val) => val.created_by === user.email)
    } else if (filterVal === 'am_working_on') {
      filterList = filterList.filter((val) => (val.created_by === user.email || val.updated_by === user.email) && val.status?.includes('ing'))
    } else if (filterVal === 'updated_by_me') {
      filterList = filterList.filter((val) => val.updated_by === user.email)
    }

    console.log('filter w/o status: ', filterList)

    filterList = filterList.filter((val) => val.status?.includes(statusVal))
    console.log('filtered: ', filterList, ', status: ', statusVal)

    setFilteredWords(sortWords(filterList));
  }

  const wordsData = sortWords(filteredWords) && sortWords(filteredWords).length ? 
    sortWords(filteredWords)?.map((word) => {
      const detailUrl = `/words/${word.id}`;
      const editUrl = `/words/edit/${word.id}`;
      console.log('status: ', word.status, '\n is: ', Object.keys(statusList).includes(word.status ?? 'creating-english'))
      if (listView) {
        return (
          <ListGroup.Item
            key={word.id}
            className='d-flex justify-content-between align-items-start'
            style={{width: '80%'}}
            >
            <div className='ms-2 me-auto'>
              <h3 className='fw-bold'>{word.word}</h3>
              <p>{word.translation}</p>
            </div>
            <div className='d-flex flex-column align-items-end'>
              <ButtonGroup>
                <Button href={detailUrl} style={{backgroundColor: 'transparent', border: 'transparent'}}>👁️</Button>
                <Button href={editUrl} hidden={Object.keys(statusList).includes(word.status ?? 'creating-english')} style={{backgroundColor: 'transparent', border: 'transparent'}}>🖊️</Button>
                <Button onClick={() => delWord(word)} style={{backgroundColor: 'transparent', border: 'transparent'}} hidden={user?.role != 'admin'}>🗑️</Button>
              </ButtonGroup>
              <Badge pill bg='primary' text='white' hidden={!word.status}>
                {word.status}
              </Badge>
            </div>
          </ListGroup.Item>
        )
      } else {
        return  (
          <Card className='p-2 wordCard' key={word.id} style={{ width: '20rem' }}>
            {/* <Card.Img variant='top' src={word.images && word.images.length ? word.images[0] : require('../../assets/nothing.jpeg')} onError={onError} /> */}
            <Card.Body className='d-flex flex-column justify-content-center'
              style={{width: '100%'}}>
              <div className='d-flex flex-row justify-content-between align-items-center'
                style={{width: '100%'}}>
                <Card.Title>{word.word}<br/>({word.translation})</Card.Title>
                <Badge pill bg='primary' text='white' hidden={!word.status} style={{ alignSelf: 'flex-start' }}>
                  {word.status}
                </Badge>
              </div>
              <ButtonGroup>
                <Button href={detailUrl} variant='success'>View</Button>
                {Object.keys(statusList).includes(word.status ?? 'creating-english') ? <Button href={editUrl}>Edit</Button> : null }
                {user?.role === 'admin' ? <Button onClick={() => delWord(word)} variant='danger' >Delete</Button> : null }
              </ButtonGroup>
            </Card.Body>
          </Card>
        );
      }
    })
    : 
    <Card><Card.Body><h3>No words {user?.role == 'reviewer' ? 'to review!' : 'found!'}</h3></Card.Body></Card>;

  if (words.length === 0 || isLoading) return <h2>Loading...</h2>;
  return (
    <div className='container mt-2'>
      <div className='d-flex justify-content-between align-items-center'>
        <h2>Words</h2>
        <Button href='/words/new'>Add new</Button>
      </div>
      <Button onClick={() => setListView(!listView)} className='button' variant='primary'>{listView ? 'Card View' : 'List View'}</Button>
      <Form className='d-flex align-items-center' style={{width: '100%'}} onSubmit={handleSearch}>
        <Form.Group controlId='formBasicSearch' style={{width: '70%'}}>
          <Form.Label>Search</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter search term'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form.Group>

        <div className='d-flex align-items-center'>
          <Form.Group controlId='filter' onChange={(e: any) => setFilter(e.target.value ?? '')}>
            <Form.Label>Filter</Form.Label>
            <Form.Select defaultValue={filter}>
              <option key={'all'} value={'all'}>Show All</option>
              <option key={'cbyme'} value={'created_by_me'}>Created by me</option>
              <option key={'amwon'} value={'am_working_on'}>I&apos;m working on</option>
              <option key={'lupme'} value={'updated_by_me'}>Last updated by me</option>
            </Form.Select>
          </Form.Group>

          <Form.Group controlId='status' onChange={(e: any) => setStatus(e.target.value ?? '')}>
            <Form.Label>Status</Form.Label>
            <Form.Select defaultValue={status}>
              <option key={'all'} value={''}>Show All</option>
              {Object.keys(statusList).length > 0 && Object.keys(statusList).map((ele) => {
                const val = statusList[ele]
                return (
                  <option key={ele} value={ele}>{val.charAt(0).toUpperCase() + val.slice(1)}</option>
                  );
              })}
            </Form.Select>
          </Form.Group>
        </div>

      </Form>
        {filteredWords && filteredWords.length ? (
          <div className='d-flex ms-2 justify-content-evenly'>
          <Container className='p-4'>
            { listView ? <ListGroup className='d-flex align-items-center'>{wordsData}</ListGroup> : <Row className='d-flex justify-content-center align-items-center'>{wordsData}</Row>}
          </Container>
        </div>
        ) : (
          <h2 className='no-words'>There are no words. Please add one.</h2>
        )}
  </div>
);
}


export default ViewDictionary;
