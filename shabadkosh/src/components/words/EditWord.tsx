/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Timestamp, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { NewSentenceType } from '../../types/sentence';
import { deleteQuestion, deleteSentence, questionsCollection, sentencesCollection, updateQuestion, updateSentence, updateWord } from '../util/controller';
import { auth, firestore } from '../../firebase';
import { NewQuestionType } from '../../types/question';
import { NewWordType } from '../../types/word';
import { useUserAuth } from '../UserAuthContext';

const types = ['context', 'image', 'meaning', 'definition'];

const EditWord = () => {
  const { wordid } = useParams();
  const getWord = doc(firestore, `words/${wordid}`);
  // const getSentences = doc(firestore, `sentences`, );

  const [ found, setFound ] = useState<boolean>(true);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ word, setWord ] = useState<NewWordType>({
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
  const [ sentences, setSentences ] = useState<NewSentenceType[]>([]);
  const [formValues, setFormValues] = useState({} as any);
  const [questions, setQuestions] = useState<NewQuestionType[]>([]);
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const {user} = useUserAuth();

  let status = {
    'creating': 'Creation in progress',
    'created': 'Created'
  } as object;
  if (user.role == 'admin') {
    status = {
      ...status,
      'reviewing': 'Review in progress',
      'reviewed': 'Reviewed',
      'active': 'Active',
      'inactive': 'Inactive'
    }
  } else if (user.role == 'reviewer') {
    status = {
      'reviewing': 'Review in progress',
      'reviewed': 'Reviewed'
    }
  }

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
        fillFormValues(newWordObj);
        setIsLoading(false);
      } else {
        console.log('No such document!');
        setFound(false);
        setIsLoading(false);
      }
    };

    const fetchSentence = async () => {
      setIsLoading(true);
      const q = query(sentencesCollection, where('word_id', '==', wordid));
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
        console.log('No sentences!');
      }
    };

    const fetchQuestions = async () => {
      setIsLoading(true);
      const q = query(questionsCollection, where('word_id', '==', wordid));
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
    }
    fetchWord();
    fetchSentence();
    fetchQuestions();
  }, []);

  const fillFormValues = (word: any) => {
    const formVal = {} as any;
    Object.keys(word).map((key) => {
      formVal[key] = word[key];
      (document.getElementById(key) as HTMLInputElement)?.setAttribute('value',word[key]);
    });
    setFormValues(formVal);
  }
  
  const addNewSentence = (e: any) => {
    e.preventDefault();
    setSentences((prevSentences) => [
      ...prevSentences,
      {
        word_id: '',
        sentence: '',
        translation: '',
      },
    ]);
  };

  const removeSentence = (idx: number, e: any) => {
    e.preventDefault();
    console.log('Sentence ID: ', idx);
    console.log('Sentences: ', sentences);
    console.log('Sentence: ',sentences[idx]);

    if (sentences[idx].word_id) {
      const response = confirm(`Are you sure you to delete this sentence: ${sentences[idx].sentence} for word: ${word.word}? \n This action is not reversible.`);

      if (response) {
        console.log('Deleted!');
        const getSentence = doc(firestore, `sentences/${sentences[idx].id}`);
        deleteSentence(getSentence).then(() => {
          console.log('Sentence deleted successfully!');
        })
      } else {
        console.log('Operation abort!');
        return;
      }
    }

    const newSFormValues = {} as any;
    
    // update sentences based on id of deleted sentence
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const newSentence = {
        ...sentence,
        sentence: formValues[`sentence${i}`],
        translation: formValues[`translation${i}`],
      };
      if (i > idx) {
        newSFormValues[`sentence${i - 1}`] = newSentence.sentence;
        newSFormValues[`translation${i - 1}`] = newSentence.translation;
      } else if (i < idx) {
        newSFormValues[`sentence${i}`] = newSentence.sentence;
        newSFormValues[`translation${i}`] = newSentence.translation;
      }
    }

    // add other fields which are not part of sentences
    for (const key in formValues) {
      if (!key.match(/sentence\d+/) && !key.match(/translation\d+/)) {
        newSFormValues[key] = formValues[key];
      }
    }

    setFormValues(newSFormValues);
    setSentences((prevSentences) => {
      const newSentences = [...prevSentences];
      newSentences.splice(idx, 1);
      return newSentences;
    });

    console.log('Sentences: ', sentences);
  };

  const changeSentence = (event: any) => {
    event.preventDefault();
    const updatedSentences = sentences.map((sentence, sidx) => {
      if (event.target.id.includes('translation')) {
        if (parseInt(event.target.id.split('translation')[1]) !== sidx) return sentence;
        return { ...sentence, translation: event.target.value };
      } else if (event.target.id.includes('sentence')) {
        if (parseInt(event.target.id.split('sentence')[1]) !== sidx) return sentence;
        return { ...sentence, sentence: event.target.value };
      } else {
        return sentence;
      }
    });
    setSentences(updatedSentences);
  };

  const addNewQuestion = (e: any) => {
    e.preventDefault();
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      {
        question: '',
        type: '',
        options: [],
        answer: '',
        word_id: '',
      },
    ]);
  };

  const removeQuestion = (idx: number, e: any) => {
    e.preventDefault();
    console.log('Question ID: ', idx);
    console.log('Questions: ', questions);
    console.log('Question: ',questions[idx]);

    if (questions[idx].word_id) {
      const response = confirm(`Are you sure you to delete this question: ${questions[idx].question} for word: ${word.word}? \n This action is not reversible.`);

      if (response) {
        console.log('Deleted!');
        const getQuestion = doc(firestore, `questions/${questions[idx].id}`);
        deleteQuestion(getQuestion).then(() => {
          console.log('Question deleted successfully!');
        })
      } else {
        console.log('Operation abort!');
        return;
      }
    }

    const newSFormValues = {} as any;
    
    // update questions based on id of deleted question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const newQuestion = {
        ...question,
        question: formValues[`question${i}`],
        type: formValues[`type${i}`],
        options: formValues[`options${i}`],
        answer: formValues[`answer${i}`],
      };
      if (i > idx) {
        newSFormValues[`question${i - 1}`] = newQuestion.question;
        newSFormValues[`type${i - 1}`] = newQuestion.type;
        newSFormValues[`options${i - 1}`] = newQuestion.options;
        newSFormValues[`answer${i - 1}`] = newQuestion.answer;
      } else if (i < idx) {
        newSFormValues[`question${i}`] = newQuestion.question;
        newSFormValues[`type${i}`] = newQuestion.type;
        newSFormValues[`options${i}`] = newQuestion.options;
        newSFormValues[`answer${i}`] = newQuestion.answer;
      }
    }

    // add other fields which are not part of questions
    for (const key in formValues) {
      if (!key.match(/question\d+/) && !key.match(/type\d+/) && !key.match(/options\d+/) && !key.match(/answer\d+/)) {
        newSFormValues[key] = formValues[key];
      }
    }

    setFormValues(newSFormValues);
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions.splice(idx, 1);
      return newQuestions;
    });

    console.log('Questions: ', questions);
  };

  const changeQuestion = (event: any) => {
    event.preventDefault();
    const updatedQuestions = questions.map((question, qidx) => {
      if (event.target.id.includes('question')) {
        if (parseInt(event.target.id.split('question')[1]) !== qidx) return question;
        return { ...question, question: event.target.value };
      } else if (event.target.id.includes('type')) {
        if (parseInt(event.target.id.split('type')[1]) !== qidx) return question;
        return { ...question, type: event.target.value };
      } else if (event.target.id.includes('options')) {
        if (parseInt(event.target.id.split('options')[1]) !== qidx) return question;
        return { ...question, options: event.target.value };
      } else if (event.target.id.includes('answer')) {
        if (parseInt(event.target.id.split('answer')[1]) !== qidx) return question;
        return { ...question, answer: event.target.value };
      } else {
        return question;
      }
    });
    setQuestions(updatedQuestions);
  };

  const resetState = () => {
    setSentences([]);
    setQuestions([]);
    setValidated(false);
  }


  const handleChange = (e: any) => {
    setFormValues({ ...formValues, [e.target.id]: e.target.value });
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    console.log('Validated!');

    const formData = {} as any;
    Object.keys(formValues).map((ele) => {
      if (!ele.match(/sentence\d+/) && !ele.match(/translation\d+/) && !ele.match(/question\d+/) && !ele.match(/type\d+/) && !ele.match(/options\d+/) && !ele.match(/answer\d+/)) {
        formData[ele] = formValues[ele];
      }
    });

    console.log('Form data: ', formData);

    formData['sentences'] = sentences;
    formData['questions'] = questions;

    editWord(formData);
  }

  const splitAndClear = (some: any) => {
    if (some == '') return [];
    let arr = some;
    if (!Array.isArray(some)){
      arr = arr.split(',');
    }
    arr = arr.map((ele: string) => {
      if (ele != '') {
        return ele.trim();
      }
    })
    return arr;
  }

  // connect the below function and call in handleSubmit
  const editWord = (formData: any) => {
    setIsLoading(true);
    const {sentences, questions, ...form} = formData;

    updateWord(
      getWord,
      {
        word: form.word,
        translation: form.translation,
        meaning_punjabi: form.meaning_punjabi ?? '',
        meaning_english: form.meaning_english ?? '',
        synonyms: splitAndClear(form.synonyms) ?? [],
        antonyms: splitAndClear(form.antonyms) ?? [],
        images: splitAndClear(form.images) ?? [],
        status: form.status,
        created_at: word.created_at,
        updated_at: Timestamp.now(),
        created_by: form.created_by,
        updated_by: auth.currentUser?.email ?? '',
        notes: form.notes ?? ''
    })
    .then(() => {
      // use return value of addWord to add sentences
      sentences.forEach((sentence: any) => {
        const getSentence = doc(firestore, `sentences/${sentence.id}`);
        const lSentence = {...sentence, word_id: wordid};
        updateSentence(getSentence, {...lSentence});
      })

      questions.forEach((question: any) => {
        const getQuestion = doc(firestore, `questions/${question.id}`);
        const lQuestion = {...question,
          options: splitAndClear(question.options) ?? [],
          type: question.type ?? 'context',
          word_id: wordid
        };
        updateQuestion(getQuestion, lQuestion);
      });

    }).finally(() => {
      setIsLoading(false);
    });

    resetState();
    setSubmitted(true);
  }

  const navigate = useNavigate();

  if (isLoading) return <h2>Loading...</h2>
  if (!found) return <h2>Word not found!</h2>
  return (
    <div className='d-flex justify-content-center align-items-center background'>
      <Form className='rounded p-4 p-sm-3' hidden={submitted} noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className='mb-3' controlId='word' onChange={handleChange}>
          <Form.Label>Word</Form.Label>
          <Form.Control type='text' placeholder='ਸ਼ਬਦ' pattern='.+[\u0A00-\u0A76,. ]' defaultValue={word.word} required />
          <Form.Control.Feedback type='invalid'>
            Please enter a word in Gurmukhi.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='translation' onChange={handleChange}>
          <Form.Label>Translation</Form.Label>
          <Form.Control type='text' placeholder='Enter translation' pattern='[\u0A00-\u0A76।a-zA-Z0-9,. ]+' defaultValue={word.translation} required />
          <Form.Control.Feedback type='invalid'>
            Please enter a translation in English.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='meaning_punjabi' onChange={handleChange}>
          <Form.Label>Meaning (Punjabi)</Form.Label>
          <Form.Control type='text' placeholder='ਇੱਥੇ ਅਰਥ ਦਰਜ ਕਰੋ' pattern='.+[\u0A00-\u0A76।,. ]' defaultValue={word.meaning_punjabi} />
          <Form.Control.Feedback type='invalid'>
            Please enter meaning in Gurmukhi.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='meaning_english' onChange={handleChange}>
          <Form.Label>Meaning (English)</Form.Label>
          <Form.Control type='text' placeholder='Enter meaning' pattern='[\u0A00-\u0A76।a-zA-Z0-9,. ]+' defaultValue={word.meaning_english} />
          <Form.Control.Feedback type='invalid'>
            Please enter meaning in English.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='synonyms' onChange={handleChange}>
          <Form.Label>Synonyms</Form.Label>
          <Form.Control type='text' placeholder='ਸਮਾਨਾਰਥੀ ਸ਼ਬਦ 1, ਸਮਾਨਾਰਥੀ ਸ਼ਬਦ 2, ...' pattern='.+[\u0A00-\u0A76।,. ]' defaultValue={word.synonyms} />
          <Form.Control.Feedback type='invalid'>
            Please enter comma-separated synonyms in Gurmukhi.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='antonyms' onChange={handleChange}>
          <Form.Label>Antonyms</Form.Label>
          <Form.Control type='text' placeholder='ਵਿਰੋਧੀ ਸ਼ਬਦ 1, ਵਿਰੋਧੀ ਸ਼ਬਦ 2, ...' pattern='.+[\u0A00-\u0A76।,. ]' defaultValue={word.antonyms} />
          <Form.Control.Feedback type='invalid'>
            Please enter comma-separated antonyms in Gurmukhi.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='status' onChange={handleChange}>
          <Form.Label>Status</Form.Label>
          <Form.Select aria-label='Default select example' defaultValue={Object.keys(status).includes(word.status ?? '') ? word.status : (user.role === 'reviewer' ? 'reviewing' : 'creating')}>
            {Object.entries(status).map((ele) => {
              const [key, value] = ele;
              return (
                <option key={key+value.toString()} value={key}>{value}</option>
              );
            })}
          </Form.Select>
        </Form.Group>

        <Form.Group className='mb-3' controlId='images' onChange={handleChange}>
          <Form.Label>Images</Form.Label>
          <Form.Control type='text' placeholder='imgUrl1, imgUrl2, ...' defaultValue={word.images} />
        </Form.Group>

        <Form.Group className='mb-3' onChange={handleChange}>
          <Form.Label style={{display: 'flex', flexDirection: 'row', width: '100%', height: 40, justifyContent: 'space-between'}}>
            <p>Sentences</p>
            <div className='d-flex' style={{height: 40, alignItems: 'center'}}>
              <button className='btn btn-sm' onClick={addNewSentence}>➕</button>
            </div>
          </Form.Label>
          {sentences && sentences.length ? sentences.map((sentence, idx) => {
            return (
              <div key={idx} className='d-flex flex-column justify-content-between mb-3'>
                <div className='d-flex justify-content-between'>
                  <p>Sentence {idx+1}</p>
                  <button className='btn btn-sm' onClick={(e) => removeSentence(idx, e)}>🗑️</button>
                </div>
                Sentence: <Form.Control id={`sentence${idx}`} className='m-1' type='text' value={sentence.sentence} placeholder='ਇੱਥੇ ਵਾਕ ਦਰਜ ਕਰੋ' onChange={(e) => changeSentence(e)} pattern='.+[\u0A00-\u0A76।,. ]' />
                <Form.Control.Feedback type='invalid' itemID={`sentence${idx}`}>
                  Please enter sentence in Gurmukhi.
                </Form.Control.Feedback>

                Translation: <Form.Control id={`translation${idx}`} className='m-1' type='text' value={sentence.translation} placeholder='Enter translation' onChange={(e) => changeSentence(e)} pattern="[\u0A00-\u0A76।a-zA-Z0-9,.' ]+" />
                <Form.Control.Feedback type='invalid' itemID={`translation${idx}`}>
                  Please enter translation in English.
                </Form.Control.Feedback>
              </div>
            );
          }): null}
        </Form.Group>

        <Form.Group className='mb-3' onChange={handleChange}>
          <Form.Label style={{display: 'flex', flexDirection: 'row', width: '100%', height: 40, justifyContent: 'space-between'}}>
            <p>Questions</p>
            <div className='d-flex' style={{height: 40, alignItems: 'center'}}>
              <button className='btn btn-sm' onClick={addNewQuestion}>➕</button>
            </div>
          </Form.Label>
          {questions && questions.length ? questions.map((question, idx) => {
            return (
              <div key={idx} className='d-flex flex-column justify-content-between mb-3'>
                <div className='d-flex justify-content-between'>
                  <p>Question {idx+1}</p>
                  <button className='btn btn-sm' onClick={(e) => removeQuestion(idx, e)}>🗑️</button>
                </div>
                Question: <Form.Control id={`question${idx}`} className='m-1' type='text' value={question.question} placeholder='ਇੱਥੇ ਸਵਾਲ ਦਰਜ ਕਰੋ' onChange={(e) => changeQuestion(e)} pattern='.+[\u0A00-\u0A76।,.].*[\s,?]*' />
                <Form.Control.Feedback type='invalid' itemID={`question${idx}`}>
                  Please enter question in Gurmukhi.
                </Form.Control.Feedback>

                Type: <Form.Select aria-label='Default select example' id={`type${idx}`} value={question.type} onChange={(e) => changeQuestion(e)}>
                  {types.map((ele) => {
                    return (
                      <option key={ele} value={ele}>{ele}</option>
                      );
                    })}
                </Form.Select>

                Options: <Form.Control id={`options${idx}`} className='m-1' type='text' placeholder='ਜਵਾਬ1, ਜਵਾਬ2, ...' value={question.options} onChange={(e) => changeQuestion(e)} pattern='.+[\u0A00-\u0A76।,.].[\s,?]*' />
                <Form.Control.Feedback type='invalid' itemID={`options${idx}`}>
                  Please enter comma-separated options in Gurmukhi.
                </Form.Control.Feedback>

                Answer: <Form.Control id={`answer${idx}`} className='m-1' type='text' placeholder='ਜਵਾਬ' value={question.answer} onChange={(e) => changeQuestion(e)} pattern='.+[\u0A00-\u0A76।,.].[\s,?]*' />
                <Form.Control.Feedback type='invalid' itemID={`answer${idx}`}>
                  Please enter answer in Gurmukhi.
                </Form.Control.Feedback>
              </div>
            );
          }): null}
        </Form.Group>

        <Form.Group className='mb-3' controlId='notes' onChange={handleChange}>
          <Form.Label>Notes</Form.Label>
          <Form.Control as='textarea' rows={3} placeholder='Enter notes' defaultValue={word.notes} />
        </Form.Group>

          <Button variant='primary' type='submit'>
            Submit
          </Button>
      </Form>
      {submitted ? <Card className='d-flex justify-content-center align-items-center background mt-4'>
        <Card.Body className='rounded p-4 p-sm-3'>
          <h3>Successfully updated the word!</h3>
          <Button variant='primary' onClick={() => navigate('/words')}>Back to Words</Button>
        </Card.Body>
      </Card> : null}
    </div>
  );

};

export default EditWord;
