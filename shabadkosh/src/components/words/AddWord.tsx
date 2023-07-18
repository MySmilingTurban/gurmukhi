import React, { useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { NewSentenceType } from '../../types/sentence';
import { useNavigate } from 'react-router-dom';
import { addQuestion, addSentence, addWord, addWordIdToWordlists, wordlistsCollection } from '../util/controller';
import { DocumentData, DocumentReference, QuerySnapshot, Timestamp, onSnapshot } from 'firebase/firestore';
import { auth } from '../../firebase';
import { NewQuestionType } from '../../types/question';
import { useUserAuth } from '../UserAuthContext';
import { WordlistType } from '../../types/wordlist';
import Multiselect from 'multiselect-react-dropdown';
import { astatus, cstatus, rstatus } from '../constants';

const types = ['context', 'image', 'meaning', 'definition'];

const AddWord = () => {
  const [formValues, setFormValues] = useState({} as any);
  const [sentences, setSentences] = useState<NewSentenceType[]>([]);
  const [questions, setQuestions] = useState<NewQuestionType[]>([]);
  const [wordlists, setWordlists] = useState<WordlistType[]>([]);
  const [selectedWordlists, setSelectedWordlists] = useState<DocumentReference[]>([]);
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useUserAuth();

  let status = {} as object;
  if (user.role === 'admin') {
    status = astatus
  } else if (user.role === 'reviewer') {
    status = rstatus
  } else if (user.role === 'creator') {
    status = cstatus
  }

  const part_of_speech = [
    'noun',
    'pronoun',
    'adjective',
    'determiner',
    'verb',
    'adverb',
    'preposition',
    'conjunction',
    'interjection'
  ]

  useEffect(() => {
    setIsLoading(true);
    onSnapshot(wordlistsCollection, (snapshot:
    QuerySnapshot<DocumentData>) => {
      setWordlists(
        snapshot.docs.map((doc) => {
          return {
              id: doc.id,
              ...doc.data()
          };
        })
      );
    });

    setIsLoading(false);
  }, []);

  const onSelect = (selectedList: [], selectedItem: any) => {
    console.log('selected item: ', selectedItem);
    setSelectedWordlists(selectedList);
  }

  const onRemove = (selectedList: [], removedItem: any) => {
    console.log('removed item: ', removedItem);
    setSelectedWordlists(selectedList);
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

  const removeAllSentences = (e:any) => {
    e.preventDefault();
    setSentences([]);
    const newSFormValues = {} as any;
    for (const key in formValues) {
      if (!key.match(/sentence\d+/) && !key.match(/translation\d+/)) {
        newSFormValues[key] = formValues[key];
      }
    }
    setFormValues(newSFormValues);
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

  const removeAllQuestions = (e:any) => {
    e.preventDefault();
    setQuestions([]);
    const newSFormValues = {} as any;
    for (const key in formValues) {
      if (!key.match(/question\d+/) && !key.match(/type\d+/) && !key.match(/options\d+/) && !key.match(/answer\d+/)) {
        newSFormValues[key] = formValues[key];
      }
    }
    setFormValues(newSFormValues);
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

  const sendForReview = (e: any) => {
    e.preventDefault()
    e.stopPropagation()

    const form = e.target.form;
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

    formData['sentences'] = sentences;
    formData['questions'] = questions;
    formData['part_of_speech'] = formData.part_of_speech ?? 'noun'
    formData['status'] = formData.status ?? 'review-english'
    
    // make list of docRefs from selectedWordlists
    formData['wordlists'] = selectedWordlists.map((docu) => docu.id);
    // console.log('Form data: ', formData);
    addNewWord(formData);

    
    if (e.target.form.status.value === 'creating-english') {
      e.target.form.status.value = 'review-english'
    }
    console.log('Form data: ', formValues)
  }


  const handleSubmit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    // console.log('Form Values: ', formValues);
    // console.log('Sentences: ', sentences);
    // console.log('Questions: ', questions);

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

    formData['sentences'] = sentences;
    formData['questions'] = questions;
    formData['part_of_speech'] = formData.part_of_speech ?? 'noun'
    formData['status'] = formData.status ?? 'creating-english'
    
    // make list of docRefs from selectedWordlists
    formData['wordlists'] = selectedWordlists.map((docu) => docu.id);
    // console.log('Form data: ', formData);
    addNewWord(formData);
  }

  const splitAndClear = (some: any) => {
    if (!some) return [];
    const splitList = some.split(',').map((ele: string) => ele.trim());
    // remove empty strings
    const arr = splitList.filter((str: string) => str != '');
    return arr;
  }

  // connect the below function and call in handleSubmit
  const addNewWord = (formData: any) => {
    setIsLoading(true);
    const {sentences, questions, wordlists, ...form} = formData;

    addWord({
      word: form.word,
      translation: form.translation,
      meaning_punjabi: form.meaning_punjabi ?? '',
      meaning_english: form.meaning_english ?? '',
      part_of_speech: form.part_of_speech ?? '',
      synonyms: splitAndClear(form.synonyms) ?? [],
      antonyms: splitAndClear(form.antonyms) ?? [],
      images: splitAndClear(form.images) ?? [],
      status: form.status ?? 'creating-english',
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      created_by: auth.currentUser?.email,
      updated_by: auth.currentUser?.email,
    })
    .then((word_id) => {
      // use return value of addWord to add sentences
      sentences.forEach((sentence: any) => {
        const lSentence = {...sentence, word_id};
        const checkSentence = (sentence: NewSentenceType) => {
          console.log(sentence);
        };
        checkSentence(lSentence);
        addSentence({
          ...sentence,
          word_id
        });
      })

      questions.forEach((question: any) => {
        addQuestion({
          ...question,
          options: splitAndClear(question.options) ?? [],
          type: question.type ?? 'context',
          word_id
        })
      });

      addWordIdToWordlists(wordlists, word_id)

    }).finally(() => {
      setIsLoading(false);
    });

    resetState();
    setSubmitted(true);
  }

  const unsetSubmitted = () => {
    setSubmitted(false);
    // refresh page
    window.location.reload();
  }

  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>
  return (
    <div className='d-flex justify-content-center align-items-center background'>
      <Form className='rounded p-4 p-sm-3' hidden={submitted} noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className='mb-3' controlId='word' onChange={handleChange}>
          <Form.Label>Word</Form.Label>
          <Form.Control type='text' placeholder='ਸ਼ਬਦ' pattern='.+[\u0A00-\u0A76,. ]' required />
          <Form.Control.Feedback type='invalid'>
            Please enter a word in Gurmukhi.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='translation' onChange={handleChange}>
          <Form.Label>Translation</Form.Label>
          <Form.Control type='text' placeholder='Enter translation' pattern='[\u0A00-\u0A76a-zA-Z0-9,. ]+' required />
          <Form.Control.Feedback type='invalid'>
            Please enter a translation in English.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='meaning_punjabi' onChange={handleChange}>
          <Form.Label>Meaning (Punjabi)</Form.Label>
          <Form.Control type='text' placeholder='ਇੱਥੇ ਅਰਥ ਦਰਜ ਕਰੋ' pattern='.+[\u0A00-\u0A76,. ]' />
          <Form.Control.Feedback type='invalid'>
            Please enter meaning in Gurmukhi.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='meaning_english' onChange={handleChange}>
          <Form.Label>Meaning (English)</Form.Label>
          <Form.Control type='text' placeholder='Enter meaning' pattern='[\u0A00-\u0A76a-zA-Z0-9,". ]+' />
          <Form.Control.Feedback type='invalid'>
            Please enter meaning in English.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='part_of_speech' onChange={handleChange}>
          <Form.Label>Part of Speech</Form.Label>
          <Form.Select aria-label='Choose part of speech' defaultValue={'noun'}>
            {part_of_speech.map((ele) => {
              return (
                <option key={ele} value={ele}>{ele.charAt(0).toUpperCase() + ele.slice(1)}</option>
              );
            })}
          </Form.Select>
        </Form.Group>

        <Form.Group className='mb-3' controlId='synonyms' onChange={handleChange}>
          <Form.Label>Synonyms</Form.Label>
          <Form.Control type='text' placeholder='ਸਮਾਨਾਰਥੀ ਸ਼ਬਦ 1, ਸਮਾਨਾਰਥੀ ਸ਼ਬਦ 2, ...' pattern='.+[\u0A00-\u0A76,. ]' />
          <Form.Control.Feedback type='invalid'>
            Please enter comma-separated synonyms in Gurmukhi.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='antonyms' onChange={handleChange}>
          <Form.Label>Antonyms</Form.Label>
          <Form.Control type='text' placeholder='ਵਿਰੋਧੀ ਸ਼ਬਦ 1, ਵਿਰੋਧੀ ਸ਼ਬਦ 2, ...' pattern='.+[\u0A00-\u0A76,. ]' />
          <Form.Control.Feedback type='invalid'>
            Please enter comma-separated antonyms in Gurmukhi.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='status' onChange={handleChange}>
          <Form.Label>Status</Form.Label>
          <Form.Select aria-label='Default select example' defaultValue={'creating-english'}>
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
          <Form.Control type='text' placeholder='imgUrl1, imgUrl2, ...' />
        </Form.Group>

        <Form.Group className="mb-3" controlId="words" >
          <Form.Label>Choose Wordlist</Form.Label>
          <Multiselect 
            options={wordlists}
            displayValue="name"
            showCheckbox={true}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        </Form.Group>

        <Form.Group className='mb-3' onChange={handleChange}>
          <Form.Label style={{display: 'flex', flexDirection: 'row', width: '100%', height: 40, justifyContent: 'space-between'}}>
            <p>Sentences</p>
            <div className='d-flex' style={{height: 40, alignItems: 'center'}}>
              <button className='btn btn-sm' onClick={addNewSentence}>➕</button>
              <button className='btn btn-sm' onClick={removeAllSentences}>❌</button>
            </div>
          </Form.Label>
          {sentences && sentences.length ? sentences.map((sentence, idx) => {
            return (
              <div key={idx} className='d-flex flex-column justify-content-between mb-3'>
                <div className='d-flex justify-content-between'>
                  <p>Sentence {idx+1}</p>
                  <button className='btn btn-sm' onClick={(e) => removeSentence(idx, e)}>🗑️</button>
                </div>
                Sentence: <Form.Control id={`sentence${idx}`} className='m-1' type='text' value={sentence.sentence} placeholder='ਇੱਥੇ ਵਾਕ ਦਰਜ ਕਰੋ' onChange={(e) => changeSentence(e)} pattern='.+[\u0A00-\u0A76,. ]' />
                <Form.Control.Feedback type='invalid' itemID={`sentence${idx}`}>
                  Please enter sentence in Gurmukhi.
                </Form.Control.Feedback>

                Translation: <Form.Control id={`translation${idx}`} className='m-1' type='text' value={sentence.translation} placeholder='Enter translation' onChange={(e) => changeSentence(e)} pattern="[\u0A00-\u0A76a-zA-Z0-9,.' ]+" />
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
              <button className='btn btn-sm' onClick={removeAllQuestions}>❌</button>
            </div>
          </Form.Label>
          {questions && questions.length ? questions.map((question, idx) => {
            return (
              <div key={idx} className='d-flex flex-column justify-content-between mb-3'>
                <div className='d-flex justify-content-between'>
                  <p>Question {idx+1}</p>
                  <button className='btn btn-sm' onClick={(e) => removeQuestion(idx, e)}>🗑️</button>
                </div>
                Question: <Form.Control id={`question${idx}`} className='m-1' type='text' value={question.question} placeholder='ਇੱਥੇ ਸਵਾਲ ਦਰਜ ਕਰੋ' onChange={(e) => changeQuestion(e)} pattern='.+[\u0A00-\u0A76,.].*[\s,?]*' />
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

                Options: <Form.Control id={`options${idx}`} className='m-1' type='text' placeholder='ਜਵਾਬ1, ਜਵਾਬ2, ...' value={question.options} onChange={(e) => changeQuestion(e)} pattern='.+[\u0A00-\u0A76,.].[\s,?]*' />
                <Form.Control.Feedback type='invalid' itemID={`options${idx}`}>
                  Please enter comma-separated options in Gurmukhi.
                </Form.Control.Feedback>

                Answer: <Form.Control id={`answer${idx}`} className='m-1' type='text' placeholder='ਜਵਾਬ' value={question.answer} onChange={(e) => changeQuestion(e)} pattern='.+[\u0A00-\u0A76,.].[\s,?]*' />
                <Form.Control.Feedback type='invalid' itemID={`answer${idx}`}>
                  Please enter answer in Gurmukhi.
                </Form.Control.Feedback>
              </div>
            );
          }): null}
        </Form.Group>

        <Form.Group className='mb-3' controlId='notes' onChange={handleChange}>
          <Form.Label>Notes</Form.Label>
          <Form.Control as='textarea' rows={3} placeholder='Enter notes' />
        </Form.Group>

        <Button variant='primary' type='submit'>
          Submit
        </Button>
        <Button variant='primary' type='button' onClick={(e) => sendForReview(e)}>
          Send for review
        </Button>
      </Form>
      {submitted ? <Card className='d-flex justify-content-center align-items-center background'>
        <Card.Body className='rounded p-4 p-sm-3'>
          <h3>Successfully added a new word!</h3>
          <Button variant='primary' onClick={unsetSubmitted}>Add another word</Button>
          <Button variant='primary' onClick={() => navigate('/words')}>Back to Words</Button>
        </Card.Body>
      </Card> : null}
    </div>
  );

};

export default AddWord;
