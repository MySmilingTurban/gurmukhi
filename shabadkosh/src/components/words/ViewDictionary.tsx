import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Badge, ListGroup, ButtonGroup, Form } from 'react-bootstrap';
import { deleteWord, wordsCollection } from '../util/controller';
import { DocumentData, QuerySnapshot, doc, onSnapshot, query } from 'firebase/firestore';
import { NewWordType } from '../../types/word';
import { firestore } from '../../firebase';
import { useUserAuth } from '../UserAuthContext';

function ViewDictionary() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [query, setQuery] = useState('');
  const [listView, setListView] = useState<boolean>(false);
  const [words, setWords] = useState<NewWordType[]>([]);
  const [filteredWords, setFilteredWords] = useState<NewWordType[]>([]);
  const {user} = useUserAuth();

  const handleSearch = async (event: any) => {
    event.preventDefault();
    console.log('query', query);
  };

  useEffect(() => {
    console.log('query', query);
    if (query === '') {
      setFilteredWords(sortWords(words));
    } else if (query.match('[\u0A00-\u0A76,.]+')) {
      // console.log('Gurmukhi' , query);

      const localWords = words.filter((word) => word.word?.includes(query));
      setFilteredWords(sortWords(localWords));
    } else if (query.match('[a-zA-Z ]+')) {
      // console.log('English', query);
      
      const localWords = words.filter((word) => word.translation?.toLowerCase().includes(query));
      setFilteredWords(sortWords(localWords));
    } else {
      // console.log(query);
    }

  }, [query]);

  useEffect(() => {
    setIsLoading(true);
    onSnapshot(wordsCollection, (snapshot:
      QuerySnapshot<DocumentData>) => {
      console.log('snapshot', snapshot);
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

  // onError function which changes image source to nothing.jpeg
  const onError = (e: any) => {
    e.target.style.display = 'none';
  };

  // console.log('Words', words);
  const sortWords = (unwords: NewWordType[]) => {
    let sortedWords = unwords.sort(
      (p1, p2) => (p1.updated_at < p2.updated_at) ? 1 : (p1.updated_at > p2.updated_at) ? -1 : 0);

    // filter words by user role
    if (user?.role === 'creator') {
      sortedWords = sortedWords.filter((word) => ['creating', 'created'].includes(word.status ?? ''));
    } else if (user?.role === 'reviewer') {
      sortedWords = sortedWords.filter((word) => ['reviewing', 'created'].includes(word.status ?? ''));
    } else if (user?.role === 'admin') {
      // no change, admin can view all
    } else {
      sortedWords = sortedWords.filter((word) => ['...'].includes(word.status ?? ''));
    }
    return sortedWords;
  }
  // console.log('Sorted words: ', sortedWords);

  const delWord = (word: any) => {
    const response = confirm(`Are you sure you want to delete this word: ${word.word}? \n This action is not reversible.`);
    if (response) {
      const getWord = doc(firestore, `words/${word.id}`);
      deleteWord(getWord).then(() => {
        alert('Word deleted!');
        console.log(`Deleted word with id: ${word.id}!`);
      });
    } else {
      console.log('Operation abort!');
    }
  }

  const wordsData = sortWords(filteredWords) && sortWords(filteredWords).length ? 
    sortWords(filteredWords)?.map((word) => {
      const detailUrl = `/words/${word.id}`;
      const editUrl = `/edit/${word.id}`;
      const punjabiMeaning = word.meaning_punjabi && word.meaning_punjabi.length > 0 ? (word.meaning_punjabi[-1] !== '।' ? word.meaning_punjabi + '।' : word.meaning_punjabi) : '';
      const englishMeaning = word.meaning_english && word.meaning_english.length > 0 ? (word.meaning_english[-1] !== '।' ? word.meaning_english + '.' : word.meaning_english) : '';
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
                <Button href={editUrl} style={{backgroundColor: 'transparent', border: 'transparent'}}>🖊️</Button>
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
            <Card.Img variant='top' src={word.images && word.images.length ? word.images[0] : require('../../assets/nothing.jpeg')} onError={onError} />
            <Card.Body>
              <Card.Title>{word.word} ({word.translation})</Card.Title>
              <Card.Text >
                  <b>Meaning: </b><br/>
                  &quot;{punjabiMeaning}&quot;<br/>
                  <i>{englishMeaning}</i>
              </Card.Text>
              <ButtonGroup>
                <Button href={detailUrl} variant='success'>View</Button>
                <Button href={editUrl}>Edit</Button>
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
      <h2>Words</h2>
      <Button onClick={() => setListView(!listView)} className='button' variant='primary'>{listView ? 'Card View' : 'List View'}</Button>
      <Form style={{width: '100%'}} onSubmit={handleSearch}>
        <Form.Group controlId='formBasicSearch'>
          <Form.Label>Search</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter search term'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form.Group>
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
