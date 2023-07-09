import { doc, getDoc, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Breadcrumb, Button, ButtonGroup, Card, ListGroup } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { firestore } from "../../firebase";
import { NewWordType } from "../../types/word";
import { deleteWord, questionsCollection, reviewWord, sentencesCollection } from "../util/controller";
import { NewSentenceType } from "../../types/sentence";
import { TimestampType } from "../../types/timestamp";
import { NewQuestionType } from "../../types/question";
import { useUserAuth } from "../UserAuthContext";

function WordDetail() {
  const { wordid } = useParams();
  const { user } = useUserAuth();
  const navigate = useNavigate();
  // fetch a single word from the database
  const getWord = doc(firestore, `words/${wordid}`);

  const [ found, setFound ] = useState<boolean>(true);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ word, setWord ] = useState<NewWordType>({
    id: "",
    created_at: {
      seconds: 0,
      nanoseconds: 0,
    },
    updated_at: {
      seconds: 0,
      nanoseconds: 0,
    },
    created_by: "",
    updated_by: ""
  });
  const [ sentences, setSentences ] = useState<NewSentenceType[]>([]);
  const [ questions, setQuestions ] = useState<NewQuestionType[]>([]);

  useEffect(() => {
    const fetchWord = async () => {
      setIsLoading(true);
      const docSnap = await getDoc(getWord);
      if (docSnap.exists()) {
        const newWordObj = {
          id: docSnap.id,
          created_at: docSnap.data().created_at,
          updated_at: docSnap.data().updated_at,
          created_by: docSnap.data().created_by,
          updated_by: docSnap.data().updated_by,
          ...docSnap.data(),
        };
        setWord(newWordObj);
        setIsLoading(false);
      } else {
        console.log("No such document!");
        setFound(false);
        setIsLoading(false);
      }
    };

    const fetchSentence = async () => {
      setIsLoading(true);
      const q = query(sentencesCollection, where("word_id", "==", wordid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const newSentences = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setSentences(newSentences);
        setIsLoading(false);
      } else {
        console.log("No sentences!");
      }
    };

    const fetchQuestions = async () => {
      setIsLoading(true);
      const q = query(questionsCollection, where("word_id", "==", wordid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const newQuestions = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data()
          }
        });
        setQuestions(newQuestions);
        setIsLoading(false);
      }
    };
    fetchWord();
    fetchSentence();
    fetchQuestions();
  }, []);
  
  function convertTimestampToDate(timestamp: TimestampType) {
    let timestampDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return timestampDate.toLocaleString('en-us', { year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
  }

  const editUrl = `/edit/${wordid}`;
  const delWord = (word: any) => {
    const response = confirm(`Are you sure you want to delete this word: ${word.word}? \n This action is not reversible.`);
    if (response) {
      const getWord = doc(firestore, `words/${word.id}`);
      deleteWord(getWord).then(() => {
        alert("Word deleted!");
        navigate('/words');
      });
    } else {
      console.log("Operation abort!");
    }
  }
  const revWord = (word: NewWordType) => {
    const response = confirm(`Are you sure you want to approve this word: ${word.word}?`);
    if (response) {
      const getWord = doc(firestore, `words/${word.id}`);
      reviewWord(getWord, word).then(() => {
        alert("Word approved!");
        navigate('/words');
      });
    } else {
      console.log("Operation abort!");
    }
  }

  const onError = (e: any) => {
    // make the parent element of the image to be invisible
    e.target.parentElement.style.display = "none";
  };

  if (isLoading) return <h2>Loading...</h2>;
  if (!found) return <h2>Word not found!</h2>;
  return (
    <Card className="details p-5">
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/words">Words</Breadcrumb.Item>
        <Breadcrumb.Item active>{word.word}</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Word Detail</h2>

      <ButtonGroup style={{ display: 'flex' ,width: '150px', alignSelf: 'end'}}>
        <Button href={editUrl}>Edit</Button>
        {user?.role == "admin" ?<Button onClick={() => delWord(word)} variant="danger" hidden={user?.role != "admin"}>Delete</Button> : null}
        {user?.role == "reviewer" ? <Button onClick={() => revWord(word)} variant="success" hidden={word.status != "created"}>Approve</Button> : null}
        
      </ButtonGroup>

      {/* check if word != {} */}
      {Object.keys(word) && Object.keys(word).length ? (
        <div className="d-flex flex-column justify-content-evenly">
          <br />
          {word.images && word.images.length ? (
            <Card className="p-2 wordCard" style={{ width: "20rem" }}>
              <Card.Img variant="top" src={word.images[0]} onError={onError}/>
            </Card>
          ) : (
            <Card className="p-2 wordCard" style={{ width: "20rem" }}>
              <Card.Img
                variant="top"
                src={require("../../assets/nothing.jpeg")}
                onError={onError}
              />
            </Card>
          )}
          <h3>{word.word} ({word.translation})</h3><span className="badge bg-primary" style={{width: '6rem'}}>{word.status}</span>
          <br />
          <h4><b>ਅਰਥ:</b> {word.meaning_punjabi}</h4>
          <h4><b>Meaning:</b> {word.meaning_english}</h4>

          <br />
          <h5><b>Synonyms</b></h5>
          <div className="d-flex">
            {word.synonyms && word.synonyms.length ? (
              word.synonyms.map((synonym) => {
                return (
                  <Card key={'s' + word.id} style={{ width: 'auto', margin: 5, padding: 0 }}>
                    <Card.Body>
                      <Card.Title>{synonym}</Card.Title>
                    </Card.Body>
                  </Card>
                );
              })
            ) : ("No synonyms!")}
          </div>

          <br />
          <h5><b>Antonyms</b></h5>
          <div className="d-flex">
            {word.antonyms && word.antonyms.length ? (
              word.antonyms.map((antonym) => {
                return (
                  <Card key={'a' + word.id} style={{ width: 'auto', margin: 5, padding: 0 }}>
                    <Card.Body>
                      <Card.Title>{antonym}</Card.Title>
                    </Card.Body>
                  </Card>
                );
              })
            ) : ("No antonyms!")}
          </div>

          <br />
          <h5><b>Sentences</b></h5>
          <ListGroup>
            {sentences && sentences.length ? (
              sentences.map((sentence) => {
                return (
                  <ListGroup.Item key={sentence.id} >
                    <h5>{sentence.sentence}</h5>
                    <h6>{sentence.translation}</h6>
                  </ListGroup.Item>
                );
              })
            ) : ("No sentences!")}
          </ListGroup>

          <br />
          <h5><b>Questions</b></h5>
          <ListGroup>
            {questions && questions.length ? (
              questions.map((question) => {
                return (
                  <ListGroup.Item key={question.id} >
                    <h5>Question: {question.question}</h5>
                    <h6>Answer: {question.answer}</h6>
                    <h6>Options: {question.options?.join(',')}</h6>
                    <h6>Type: {question.type}</h6>
                  </ListGroup.Item>
                );
              })
            ) : ("No questions!")}
          </ListGroup>

          <p  className="mt-3" hidden={!word.notes}>
            <b>Notes:</b> {word.notes}
          </p>

          <br />
          <h5><b>Info</b></h5>
          <div className="d-flex justify-content-between flex-column">
            <h6>Created by: {word.created_by ? word.created_by : 'Unknown' }</h6>
            <h6>Created at: {convertTimestampToDate(word.created_at)}</h6>
            <h6>Last updated by: {word.updated_by}</h6>
            <h6>Last updated: {convertTimestampToDate(word.updated_at)}</h6>
          </div>
        </div>
      ) :
      ("Loading...")}
      <br />
    </Card>
  );
}

export default WordDetail;
