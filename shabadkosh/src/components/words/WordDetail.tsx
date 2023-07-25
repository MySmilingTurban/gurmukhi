/* eslint-disable react-hooks/exhaustive-deps */
import { DocumentData, QuerySnapshot, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, ButtonGroup, Card, ListGroup, NavLink } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { firestore } from '../../firebase';
import { deleteQuestionByWordId, deleteSentenceByWordId, deleteWord, getWordlistsByWordId, getWordsByIdList, questionsCollection, removeWordFromSupport, removeWordFromWordlists, reviewWord, sentencesCollection, wordsCollection } from '../util/controller';
import { NewWordType, NewSentenceType, WordlistType, MiniWord, Option, QuestionType } from '../../types';
import { useUserAuth } from '../UserAuthContext';
import { astatus, rstatus, cstatus } from '../constants';
import { convertTimestampToDateString } from '../util/utils';

function WordDetail() {
  const { wordid } = useParams();
  const { user } = useUserAuth();
  const navigate = useNavigate();
  // fetch a single word from the database
  const getWord = doc(firestore, `words/${wordid}`);

  const [found, setFound] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [word, setWord] = useState<NewWordType>({
    id: '',
    created_at: {
      seconds: 0,
      nanoseconds: 0,
    },
    updated_at: {
      seconds: 0,
      nanoseconds: 0,
    },
    created_by: '',
    updated_by: ''
  });
  const [sentences, setSentences] = useState<NewSentenceType[]>([]);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [wordlists, setWordlists] = useState<WordlistType[]>([]);

  let statusList = {} as object;
  if (user.role === 'admin') {
    statusList = astatus
  } else if (user.role === 'reviewer') {
    statusList = rstatus
  } else if (user.role === 'creator') {
    statusList = cstatus
  }

  useEffect(() => {
    let synList = [] as any[]
    let antList = [] as any[]
    let localWords = [] as NewWordType[]

    const fetchWords = async () => {
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
        localWords = data;
      });

      setIsLoading(false);
    }

    const fetchWord = async () => {
      setIsLoading(true);
      const docSnap = await getDoc(getWord);
      if (docSnap.exists()) {
        const newWordObj = {
          id: docSnap.id,
          synonyms: docSnap.data().synonyms,
          antonyms: docSnap.data().antonyms,
          sentences: docSnap.data().sentences,
          created_at: docSnap.data().created_at,
          updated_at: docSnap.data().updated_at,
          created_by: docSnap.data().created_by,
          updated_by: docSnap.data().updated_by,
          ...docSnap.data(),
        };
        synList = newWordObj.synonyms
        antList = newWordObj.antonyms
        setWord(newWordObj)
        let listOfWordlists = [] as WordlistType[];
        await getWordlistsByWordId(wordid ?? '').then((data) => {
          if (data && data !== undefined) {
            listOfWordlists = data.map((ele) => {
              return {
                  id: ele.id,
                  ...ele.data()
              } as WordlistType;
            })
          }
        }).finally(() => {
          setIsLoading(false)
        })
        setWordlists(listOfWordlists);
      } else {
        console.log('No such document!')
        setFound(false)
        setIsLoading(false)
      }
    };

    const fetchSynonyms = async () => {
      setIsLoading(true)
      await getWordsByIdList(synList).then((docs) => {
        if (docs && docs !== undefined) {
          synList = docs.map((d) => {
            return { id: d.id, ...d.data() } as MiniWord
          }) as MiniWord[]
        }
      }).finally(() => {
        setIsLoading(false)
      })
    }

    const fetchAntonyms = async () => {
      setIsLoading(true)
      await getWordsByIdList(antList).then((docs) => {
        if (docs && docs !== undefined) {
          antList = docs.map((d) => {
            return { id: d.id, ...d.data() } as MiniWord
          }) as MiniWord[]
        }
      }).finally(() => {
        setIsLoading(false)
      })
    }

    const fetchSentence = async () => {
      setIsLoading(true);
      const q = query(sentencesCollection, where('word_id', '==', wordid));
      const querySnapshot = await getDocs(q).finally(() => {
        setIsLoading(false)
      });
      if (!querySnapshot.empty) {
        const newSentences = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setSentences(newSentences);
      } else {
        console.log('No sentences!');
      }
    };

    const fetchQuestions = async () => {
      setIsLoading(true);
      const q = query(questionsCollection, where('word_id', '==', wordid));
      const querySnapshot = await getDocs(q).finally(() => {
        setIsLoading(false)
      });
      if (!querySnapshot.empty) {
        const newQuestions = querySnapshot.docs.map((doc) => {
          const lOptions = doc.data().options.map((ele: string | Option) => {
            if (typeof ele === 'string') {
              const d = localWords.find((e) => e.id === ele || e.word === ele)
              return { id: d?.id, option: d?.word, translation: d?.translation } as Option
            }
            return ele
          }).filter((ele: any) => ele !== undefined) as Option[];
          return {
            ...doc.data(),
            id: doc.id,
            question: doc.data().question,
            translation: doc.data().translation ?? '',
            type: doc.data().type,
            options: lOptions,
            answer: doc.data().answer,
          }
        });
        setQuestions(newQuestions);
      }
    };

    fetchWords().then(() => {
      fetchWord().then(() => {
        fetchSynonyms().then(() => {
          fetchAntonyms().then(() => {
            setWord((prev) => {
              return { ...prev, synonyms: synList, antonyms: antList }
            })
            fetchSentence()
            fetchQuestions()
          })
        })
      })
    })
  }, []);

  const editUrl = `/words/edit/${wordid}`;
  const delWord = (word: any) => {
    const response = confirm(`Are you sure you want to delete this word: ${word.word}? \nThis action will delete all sentences and questions for this word as well. \n This action is not reversible!`);
    if (response) {
      const getWord = doc(firestore, `words/${word.id}`);
      setIsLoading(true)
      removeWordFromSupport(word.id).then(() => {
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
      })
    } else {
      console.log('Operation abort!');
    }
  }
  const revWord = (word: NewWordType, type: string) => {
    const response = confirm(`Are you sure you want to ${type === 'review' ? 'send this word for review' : type === 'approve' ? 'approve this word' : ''} : ${word.word}?`);
    if (response) {
      const getWord = doc(firestore, `words/${word.id}`);
      let status = 'review-english';
      if (word.status) {
        if (type === 'review') {
          if (['creating-english', 'feedback-english'].includes(word.status)) {
            status = 'review-english'
          } else if (['creating-punjabi', 'feedback-punjabi'].includes(word.status)) {
            status = 'review-final'
          }
        } else if (type === 'approve') {
          if (word.status === 'review-english') {
            status = 'creating-punjabi'
          } else if (word.status === 'review-final') {
            status = 'active'
          }
        }
      } else {
        status = 'review-english'
      }
      reviewWord(getWord, word, status, user.email).then(() => {
        alert(`Word ${type === 'review' ? 'reviewed' : type === 'approve' ? 'approved' : ''}!`);
        navigate('/words');
      });
    } else {
      console.log('Operation abort!');
    }
  }

  const onError = (e: any) => {
    // make the parent element of the image to be invisible
    e.target.parentElement.style.display = 'none';
  };

  const wordlistData = wordlists?.map((ele: any) => {
    return (<NavLink style={{width: '150px', border: '1px solid #000', borderRadius: 20, textAlign: 'center', margin: 5}} href={`/wordlists/${ele.id}`} key={ele.id} >{ele.name}</NavLink>)
  })

  if (isLoading) return <h2>Loading...</h2>;
  if (!found) return <h2>Word not found!</h2>;
  return (
    <Card className='details p-5'>
      <Breadcrumb>
        <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
        <Breadcrumb.Item href='/words'>Words</Breadcrumb.Item>
        <Breadcrumb.Item active>{word.word}</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Word Detail</h2>

      <ButtonGroup style={{ display: 'flex' , alignSelf: 'end'}}>
        {((word.status && Object.keys(statusList).includes(word.status ?? 'creating-english')) || word.is_for_support) ? <Button href={editUrl}>Edit</Button> : null}
        {(word.status && ['creating-english', 'feedback-english', 'creating-punjabi', 'feedback-punjabi'].includes(word.status)) ? <Button onClick={() => revWord(word, 'review')} variant='success'>Send to Review</Button> : null}
        {(word.status && ['reviewer', 'admin'].includes(user.role) && ['review-english', 'review-final'].includes(word.status)) ? <Button onClick={() => revWord(word, 'approve')} variant='success'>Approve</Button> : null}
        {user.role == 'admin' ? <Button onClick={() => delWord(word)} variant='danger'>Delete</Button> : null}
      </ButtonGroup>

      {/* check if word != {} */}
      {Object.keys(word) && Object.keys(word).length ? (
        <div className='d-flex flex-column justify-content-evenly'>
          <br />
          {word.images && word.images.length ? (
            word.images.map((img) => {
              return (<Card className='p-2 wordCard' key={img} style={{ width: '20rem' }}>
                <Card.Img variant='top' src={img} onError={onError}/>
              </Card>)
            })
          ): null}
          <h3>{word.word} ({word.translation})</h3>
          <span className='badge bg-primary' style={{width: '8rem'}}>{word.status}</span>
          <span className='badge bg-primary mt-2' style={{width: '8rem'}}>{word.is_for_support ? 'Synonym/Antonym' : null}</span>
          <br />
          {word.is_for_support ? <h6>This word is a synonym/antonym of another word and might not have full details.</h6> : null}
          <h4><b>ਅਰਥ:</b> {word.meaning_punjabi ? word.meaning_punjabi : '~'}</h4>
          <h4><b>Meaning:</b> {word.meaning_english ? word.meaning_english : '~'}</h4>
          {word.part_of_speech && (<h4><b>Part of Speech:</b> {word.part_of_speech}</h4>)}

          <br />
          <h5><b>Synonyms</b></h5>
          <div className='d-flex'>
            {word.synonyms && word.synonyms.length ? (
              (word.synonyms as MiniWord[]).map((synonym) => {
                return (
                  <NavLink style={{width: '150px', border: '1px solid #000', borderRadius: 20, textAlign: 'center', margin: 5}} href={`/words/${synonym.id}`} key={synonym.id}>{synonym.word}</NavLink>
                );
              })
            ) : ('No synonyms!')}
          </div>

          <br />
          <h5><b>Antonyms</b></h5>
          <div className='d-flex'>
            {word.antonyms && word.antonyms.length ? (
              (word.antonyms as MiniWord[]).map((antonym) => {
                return (
                  <NavLink style={{width: '150px', border: '1px solid #000', borderRadius: 20, textAlign: 'center', margin: 5}} href={`/words/${antonym.id}`} key={antonym.id}>{antonym.word}</NavLink>
                );
              })
            ) : ('No antonyms!')}
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
            ) : ('No sentences!')}
          </ListGroup>

          <br />
          <h5><b>Questions</b></h5>
          <ListGroup>
            {questions && questions.length ? (
              questions.map((question, qid) => {
                return (
                  <ListGroup.Item key={question.id} >
                    <h5>Question: {question.question}</h5>
                    <h5>Translation: {question.translation}</h5>
                    <h6>Options: 
                      <ul>
                        {question.options?.map((ele, idx) => 
                          <li key={`qoption${qid}${idx}`}>{ele.option}</li>
                        )}
                      </ul>
                    </h6>
                    <h6>Answer: {question.options[question.answer]?.option ?? JSON.stringify(question.answer)}</h6>
                    <h6>Type: {question.type}</h6>
                  </ListGroup.Item>
                );
              })
            ) : ('No questions!')}
          </ListGroup>

          <br />
          {wordlistData && wordlistData.length !== 0 &&
            (
              <div>
                <h5>Wordlist{wordlistData.length > 1 ? 's' : '' }</h5>
                {wordlistData}
                {/* <h3>{JSON.stringify(wordlists)}</h3> */}
              </div>
            )
          }

          <p  className='mt-3' hidden={!word.notes}>
            <b>Notes:</b> {word.notes}
          </p>

          <br />
          <h5><b>Info</b></h5>
          <div className='d-flex justify-content-between flex-column'>
            <h6>Created by: {word.created_by ? word.created_by : 'Unknown' }</h6>
            <h6>Created at: {convertTimestampToDateString(word.created_at)}</h6>
            <h6>Last updated by: {word.updated_by}</h6>
            <h6>Last updated: {convertTimestampToDateString(word.updated_at)}</h6>
          </div>
        </div>
      ) :
      ('Loading...')}
      <br />
    </Card>
  );
}

export default WordDetail;
