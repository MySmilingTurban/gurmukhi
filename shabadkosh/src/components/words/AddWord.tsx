import React, { useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { NewSentenceType } from '../../types/sentence';
import { useNavigate } from 'react-router-dom';
import { addQuestion, addSentence, addWord, addWordIdToWordlists, isWordNew, wordlistsCollection, wordsCollection } from '../util/controller';
import { DocumentData, DocumentReference, QuerySnapshot, Timestamp, onSnapshot } from 'firebase/firestore';
import { QuestionType, WordlistType, MiniWord, Option } from '../../types';
import { useUserAuth } from '../UserAuthContext';
import Multiselect from 'multiselect-react-dropdown';
import { astatus, cstatus, qtypes, rstatus } from '../constants';
import { SupportWord } from '../SupportWord';
import { createSupportWords, seperateIdsAndNewWords, setOptionsDataForSubmit } from '../util/utils';
import { Options } from '../Options';

const AddWord = () => {
  const [formValues, setFormValues] = useState({} as any);
  const [sentences, setSentences] = useState<NewSentenceType[]>([]);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [words, setWords] = useState<MiniWord[]>([]);
  const [wordlists, setWordlists] = useState<WordlistType[]>([]);
  const [selectedWordlists, setSelectedWordlists] = useState<DocumentReference[]>([]);
  const [synonyms, setSynonyms] = useState<MiniWord[]>([]);
  const [antonyms, setAntonyms] = useState<MiniWord[]>([]);
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
    setIsLoading(true)
    onSnapshot(wordsCollection, (snapshot: QuerySnapshot<DocumentData>) => {
      setWords(snapshot.docs.map((doc) => {
        return {
            id: doc.id,
            word: doc.data().word,
            translation: doc.data().translation,
            value: doc.id,
            label: doc.data().word + ` (${doc.data().translation.toLowerCase()})`
        }
      }))
    })

    setIsLoading(false);
  }, [])

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

  const onChangeWlist = (selectedList: [], item: any) => {
    console.log('changed item: ', item);
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
        translation: '',
        type: 'context',
        options: [],
        answer: 0,
        word_id: '',
      },
    ]);
  };

  const removeQuestion = (idx: number, e: any) => {
    e.preventDefault();

    const newSFormValues = {} as any;
    
    // update questions based on id of deleted question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const newQuestion = {
        ...question,
        question: formValues[`question${i}`],
        translation: formValues[`qtranslation${i}`],
        type: formValues[`type${i}`],
        options: formValues[`options${i}`],
        answer: formValues[`answer${i}`],
      };
      if (i > idx) {
        newSFormValues[`question${i - 1}`] = newQuestion.question;
        newSFormValues[`qtranslation${i - 1}`] = newQuestion.translation;
        newSFormValues[`type${i - 1}`] = newQuestion.type;
        newSFormValues[`options${i - 1}`] = newQuestion.options;
        newSFormValues[`answer${i - 1}`] = newQuestion.answer;
      } else if (i < idx) {
        newSFormValues[`question${i}`] = newQuestion.question;
        newSFormValues[`qtranslation${i}`] = newQuestion.translation;
        newSFormValues[`type${i}`] = newQuestion.type;
        newSFormValues[`options${i}`] = newQuestion.options;
        newSFormValues[`answer${i}`] = newQuestion.answer;
      }
    }

    // add other fields which are not part of questions
    for (const key in formValues) {
      if (!key.match(/question\d+/) && !key.match(/qtranslation\d+/) && !key.match(/type\d+/) && !key.match(/options\d+/) && !key.match(/answer\d+/)) {
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
      } else if (event.target.id.includes('qtranslation')) {
        if (parseInt(event.target.id.split('qtranslation')[1]) !== qidx) return question;
        return { ...question, translation: event.target.value };
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

  const changeQOptions = (id: string, optionData: any) => {
    // event.preventDefault()
    const updatedQuestions = questions.map((question, qidx) => {
      if (parseInt(id.split('options')[1]) !== qidx) return question;
      return { ...question, options: optionData };
    })
    console.log('upd Q:', updatedQuestions)
    setQuestions(updatedQuestions)
  }

  const resetState = () => {
    setSentences([]);
    setQuestions([]);
    setValidated(false);
  }

  const handleChange = (e: any) => {
    setFormValues({ ...formValues, [e.target.id]: e.target.value });
  }

  const handleSupport = (e: any) => {
    setFormValues({ ...formValues, [e.target.id]: e.target.checked })
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

    formData['sentences'] = sentences
    formData['questions'] = setOptionsDataForSubmit(questions)

    const [uniqueSyn, synIds] = seperateIdsAndNewWords(synonyms)
    const [uniqueAnt, antIds] = seperateIdsAndNewWords(antonyms)

    createSupportWords(uniqueSyn, user).then((synIdlist) => {
      createSupportWords(uniqueAnt, user).then((antIdList) => {
        const synArr = synIds.concat(synIdlist)
        const antArr = antIds.concat(antIdList)
        // console.log('Syn Ids: ', synArr)
        // console.log('Ant Ids: ', antArr)

        formData['synonyms'] = synArr;
        formData['antonyms'] = antArr;
        formData['part_of_speech'] = formData.part_of_speech ?? 'noun'
        formData['status'] = 'review-english'
        
        // make list of docRefs from selectedWordlists
        formData['wordlists'] = selectedWordlists.map((docu) => docu.id);
        console.log('Form data: ', formData);
        addNewWord(formData);
      })
    })
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

    formData['sentences'] = sentences
    formData['questions'] = setOptionsDataForSubmit(questions)

    const [uniqueSyn, synIds] = seperateIdsAndNewWords(synonyms)
    const [uniqueAnt, antIds] = seperateIdsAndNewWords(antonyms)

    createSupportWords(uniqueSyn, user).then((synIdlist) => {
      createSupportWords(uniqueAnt, user).then((antIdList) => {
          const synArr = synIds.concat(synIdlist)
          const antArr = antIds.concat(antIdList)
          // console.log('Syn Ids: ', synArr)
          // console.log('Ant Ids: ', antArr)

          formData['synonyms'] = synArr
          formData['antonyms'] = antArr

          formData['part_of_speech'] = formData.part_of_speech ?? 'noun'
          formData['status'] = formData.status ?? 'creating-english'
          
          // make list of docRefs from selectedWordlists
          formData['wordlists'] = selectedWordlists.map((docu) => docu.id)
          console.log('Form data: ', formData)
          addNewWord(formData)
      })
    })

  }

  const splitAndClear = (some: any) => {
    if (!some) return [];
    const splitList = some.split(',').map((ele: string) => ele.trim());
    // remove empty strings
    const arr = splitList.filter((str: string) => str != '');
    return arr;
  }

  // connect the below function and call in handleSubmit
  const addNewWord = async (formData: any) => {
    const {sentences, questions, wordlists, ...form} = formData;
    
    const wordIsNew = await isWordNew(form.word)
    if (wordIsNew) {
      setIsLoading(true);
      addWord({
        word: form.word,
        translation: form.translation,
        meaning_punjabi: form.meaning_punjabi ?? '',
        meaning_english: form.meaning_english ?? '',
        part_of_speech: form.part_of_speech ?? '',
        synonyms: form.synonyms,
        antonyms: form.antonyms,
        images: splitAndClear(form.images) ?? [],
        status: form.status ?? 'creating-english',
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        created_by: user.email,
        updated_by: user.email,
        is_for_support: form.is_for_support ?? false
      })
      .then((word_id) => {
        // use return value of addWord to add sentences
        sentences.forEach((sentence: any) => {
          addSentence({
            ...sentence,
            word_id
          });
        })
  
        questions.forEach((question: any) => {
          addQuestion({
            ...question,
            translation: question.translation ?? '',
            options: question.options ?? [],
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
    } else {
      alert('Word already exists!')
      setIsLoading(false)
    }

  }

  const unsetSubmitted = () => {
    setSubmitted(false);
    // refresh page
    window.location.reload();
  }

  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>
  return (
    <div className='d-flex flex-column justify-content-center align-items-center background'>
      <h2>Add New Word</h2>
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
          <SupportWord id='synonyms' name='Synonyms' myVar={synonyms} setMyVar={setSynonyms} words={words} type={'synonyms'} placeholder='ਸਮਾਨਾਰਥਕ ਸ਼ਬਦ' />
        </Form.Group>

        <Form.Group className='mb-3' controlId='antonyms' onChange={handleChange}>
          <SupportWord id='antonyms' name='Antonyms' myVar={antonyms} setMyVar={setAntonyms} words={words} type={'antonyms'} placeholder='ਵਿਰੋਧੀ ਸ਼ਬਦ' />
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
            onSelect={onChangeWlist}
            onRemove={onChangeWlist}
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
                Sentence: <Form.Control id={`sentence${idx}`} className='m-1' type='text' value={sentence.sentence} placeholder='ਇੱਥੇ ਵਾਕ ਦਰਜ ਕਰੋ' onChange={(e) => changeSentence(e)} pattern='.+[\u0A00-\u0A76,.। ]' required/>
                <Form.Control.Feedback type='invalid' itemID={`sentence${idx}`}>
                  Please enter sentence in Gurmukhi.
                </Form.Control.Feedback>

                Translation: <Form.Control id={`translation${idx}`} className='m-1' type='text' value={sentence.translation} placeholder='Enter translation' onChange={(e) => changeSentence(e)} pattern="[\u0A00-\u0A76a-zA-Z0-9,.' ]+" required/>
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
              <div key={idx} className='d-flex flex-column justify-content-between' style={{margin: '0 5%'}}>
                <div className='d-flex justify-content-between align-items-center'>
                  <b>Question {idx+1}</b>
                  <button className='btn btn-sm' onClick={(e) => removeQuestion(idx, e)}>🗑️</button>
                </div>
                <div>
                  <Form.Label>Question:</Form.Label><Form.Control id={`question${idx}`} className='m-1' type='text' value={question.question} placeholder='ਇੱਥੇ ਸਵਾਲ ਦਰਜ ਕਰੋ' onChange={(e) => changeQuestion(e)} pattern='[\u0A00-\u0A76।,.?_ ]+' required/>
                  <Form.Control.Feedback type='invalid' itemID={`question${idx}`}>
                    Please enter question in Gurmukhi.
                  </Form.Control.Feedback>
                  <br />

                  <Form.Label>Translation: </Form.Label><Form.Control id={`qtranslation${idx}`} className='m-1' type='text' value={question.translation} placeholder='Enter english translation of question' onChange={(e) => changeQuestion(e)} pattern="[a-zA-Z0-9,.'?_ ]+" required/>
                  <Form.Control.Feedback type='invalid' itemID={`qtranslation${idx}`}>
                    Please enter translation in Gurmukhi.
                  </Form.Control.Feedback>
                  <br />

                  <Form.Label>Type: </Form.Label><Form.Select aria-label='Default select example' id={`type${idx}`} value={question.type ?? 'context'} onChange={(e) => changeQuestion(e)}>
                    {qtypes.map((ele) => {
                      return (
                        <option key={ele} value={ele}>{ele}</option>
                        );
                      })}
                  </Form.Select>

                  <Options id={`options${idx}`} name={'Options'} myVar={question.options as Option[]} setMyVar={changeQOptions} words={words} placeholder='ਜਵਾਬ'/>
                  <Form.Control.Feedback type='invalid' itemID={`options${idx}`}>
                    Please choose options in Gurmukhi.
                  </Form.Control.Feedback>

                  <Form.Label>Answer: </Form.Label>
                  <Form.Select id={`answer${idx}`} value={question.answer} onChange={(e) => changeQuestion(e)} required>
                    {(question.options as Option[]).map((ele, i) => {
                      return (
                        <option key={i} value={i}>{ele.option}</option>
                        );
                    })}
                  </Form.Select>
                  <Form.Control.Feedback type='invalid' itemID={`answer${idx}`}>
                    Please choose answer
                  </Form.Control.Feedback>
                </div>
                <hr />
              </div>
            );
          }): null}
        </Form.Group>

        <Form.Group className='mb-3' controlId='notes' onChange={handleChange}>
          <Form.Label>Notes</Form.Label>
          <Form.Control as='textarea' rows={3} placeholder='Enter notes' />
        </Form.Group>

        <div className='d-flex justify-content-between align-items-center'>
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
        <Form.Check
          reverse
          id="is_for_support"
          type="switch"
          onChange={handleSupport}
          label="Is this word a synonym/antonym for another word and doesn't have its own data?"/>
        </div>

      <div className='d-flex justify-content-around'>
        <Button variant='primary' type='submit'>
          Submit
        </Button>
        <Button variant='primary' type='button' onClick={(e) => sendForReview(e)}>
          Send for review
        </Button>
      </div>
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

