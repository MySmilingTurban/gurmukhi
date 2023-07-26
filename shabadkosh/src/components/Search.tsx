import React, { useEffect, useState } from 'react';
import { Form, Table } from 'react-bootstrap';
import { NewWordType } from '../types/word';
import { onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { wordsCollection } from './util/controller';
import { useNavigate } from 'react-router-dom';
import { convertTimestampToDateString } from './util/utils';

const Search = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [words, setWords] = useState<NewWordType[]>([]);
  const [filteredWords, setFilteredWords] = useState<NewWordType[]>([]);
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSearch = async (event: any) => {
    event.preventDefault();
    // console.log("query", query);
  };

  useEffect(() => {
    if (words) {
      if (query === '') {
        setFilteredWords(words);
      } else if (query.match('[\u0A00-\u0A76,. ]+')) {
        // console.log("Gurmukhi" , query);
        // console.log("words", words);

        const filteredWords = words.filter((word: NewWordType) => word.word?.includes(query));
        // console.log("filteredWords", filteredWords);
        setFilteredWords(filteredWords);
      } else if (query.match('[a-zA-Z ]+')) {
        // console.log("English", query);
        
        const filteredWords = words.filter((word: NewWordType) => word.translation?.includes(query));
        // console.log("filteredWords", filteredWords);
        setFilteredWords(filteredWords);
      } else {
        console.log(query);
      }
    }
  }, [query, words]);

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

  if (isLoading) return <div>Loading...</div>;
  return (
    <div className="container m-4">
    <Form onSubmit={handleSearch}>
      <Form.Group controlId="formBasicSearch">
        <Form.Label>Search</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter search term"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Form.Group>
      {/* <Button variant="primary" type="submit">
        Search
      </Button> */}
    </Form>

    <p></p>

    <Table striped bordered hover responsive variant="light">
      <thead>
        <tr>
          <th>#</th>
          <th>Word</th>
          <th>Translation</th>
          <th>Synonyms</th>
          <th>Antonyms</th>
          <th>Status</th>
          <th>Meaning (Punjabi)</th>
          <th>Meaning (English)</th>
          <th>Created By</th>
          <th>Created At</th>
          <th>Updated At</th>
        </tr>
      </thead>
      <tbody>
        {filteredWords.map((word, index) => (
          <tr key={word.id} onClick={() => navigate(`/words/${word.id}`)}>
            <td>{index + 1}</td>
            <td>{word.word}</td>
            <td>{word.translation}</td>
            <td>{word.synonyms?.join(', ')}</td>
            <td>{word.antonyms?.join(', ')}</td>
            <td>{word.status}</td>
            <td>{word.meaning_punjabi}</td>
            <td>{word.meaning_english}</td>
            <td>{word.created_by}</td>
            <td>{convertTimestampToDateString(word.created_at)}</td>
            <td>{convertTimestampToDateString(word.updated_at)}</td>
          </tr>
        ))}
      </tbody>
    </Table>

    </div>
  );
};

export default Search;
