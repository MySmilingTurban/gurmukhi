/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DocumentData, QuerySnapshot, Timestamp, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { addQuestion, addSentence, deleteQuestion, deleteSentence, getWordlistsByWordId, isWordNew, questionsCollection, sentencesCollection, setWordInWordlists, updateQuestion, updateSentence, updateWord, wordlistsCollection, wordsCollection } from '../util/controller';
import { firestore } from '../../firebase';
import { NewSentenceType, MiniWord, NewWordType, Option, MiniWordlist, WordlistType, QuestionType } from '../../types';
import { useUserAuth } from '../UserAuthContext';
import Multiselect from 'multiselect-react-dropdown';
import { astatus, rstatus, cstatus, qtypes } from '../constants';
import { SupportWord } from '../SupportWord';
import { createSupportWords, seperateIdsAndNewWords, setOptionsDataForSubmit } from '../util/utils';
import { Options } from '../Options';

const EditWord = () => {
  const { wordid } = useParams();
  const getWord = doc(firestore, `words/${wordid}`);
  // const getSentences = doc(firestore, `sentences`, );

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
  const [formValues, setFormValues] = useState({} as any);
  const [sentences, setSentences] = useState<NewSentenceType[]>([]);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [wordlists, setWordlists] = useState<WordlistType[]>([]);
  const [words, setWords] = useState<MiniWord[]>([]);
  const [synonyms, setSynonyms] = useState<MiniWord[]>([]);
  const [antonyms, setAntonyms] = useState<MiniWord[]>([]);
  const [support, setSupport] = useState<boolean>(false);
  const [selectedWordlists, setSelectedWordlists] = useState<MiniWordlist[]>([]);
  const [removedWordlists, setRemovedWordlists] = useState<MiniWordlist[]>([])
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
    let localWlist = [] as any;
    let localWords = [] as any;
    let localWordlists = [] as any;
    const fetchWords = async () => {
      setIsLoading(true)
      onSnapshot(wordsCollection, (snapshot: QuerySnapshot<DocumentData>) => {
        localWords = snapshot.docs.map((doc) => {
          return {
              id: doc.id,
              word: doc.data().word,
              translation: doc.data().translation,
              value: doc.id,
              label: doc.data().word + ` (${doc.data().translation.toLowerCase()})`
          } as MiniWord
        })
        setWords(localWords)
      })

      onSnapshot(wordlistsCollection, (snapshot:
      QuerySnapshot<DocumentData>) => {
        localWordlists = snapshot.docs.map((doc) => {
          return {
              id: doc.id,
              ...doc.data()
          }
        })
        setWordlists(localWordlists)
      })

      setIsLoading(false)
    }
    const fetchWord = async () => {
      setIsLoading(true)
      const docSnap = await getDoc(getWord);
      if (docSnap.exists()) {
        const newWordObj = {
          id: docSnap.id,
          created_at: docSnap.data().created_at,
          updated_at: docSnap.data().updated_at,
          created_by: docSnap.data().created_by,
          updated_by: docSnap.data().updated_by,
          synonyms: docSnap.data().synonyms ?? [],
          antonyms: docSnap.data().antonyms ?? [],
          is_for_support: docSnap.data().is_for_support ?? false,
          ...docSnap.data(),
        };
        await getWordlistsByWordId(wordid ?? '').then((data) => {
          data.map((ele) => {
            localWlist = [...localWlist, {
              id: ele.id,
              name: ele.data().name
            }]
          })
        })
        setWord(newWordObj)
        const synList = localWords.filter((obj: MiniWord) => newWordObj.synonyms.includes(obj.id))
        const antList = localWords.filter((obj: MiniWord) => newWordObj.antonyms.includes(obj.id))
        setSynonyms(synList)
        setAntonyms(antList)
        setSupport(newWordObj.is_for_support)
        setSelectedWordlists(localWlist)
        fillFormValues(newWordObj)
      } else {
        setFound(false)
      }
      setIsLoading(false)
    };

    const fetchSentence = async () => {
      setIsLoading(true);
      const q = query(sentencesCollection, where('word_id', '==', wordid));
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const newSentences = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setSentences(newSentences)
      } else {
        console.log('No sentences!')
      }
      setIsLoading(false)
    };

    const fetchQuestions = async () => {
      setIsLoading(true)
      const q = query(questionsCollection, where('word_id', '==', wordid));
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const newQuestions = querySnapshot.docs.map((doc) => {
          const opt = doc.data().options.map((ele: any) => {
            if (typeof ele === 'string') {
              const d = localWords.find((obj: MiniWord) => obj.word === ele || obj.id === ele)
              if (d) {
                return {
                  id: d.id,
                  option: d.word,
                  translation: d.translation,
                  label: `${d.word} (${d.translation.toLowerCase()})`
                }
              }
            } else {
              return ele
            }
          }).filter((ele: any) => ele !== undefined)
          return {
            ...doc.data(),
            id: doc.id,
            question: doc.data().question,
            translation: doc.data().translation ?? '',
            type: doc.data().type,
            options: opt,
            answer: doc.data().answer,
          }
        });
        console.log('options: ', newQuestions)
        setQuestions(newQuestions)
      } else {
        console.log('No Questions')
      }
      setIsLoading(false);
    }
    fetchWords()
    fetchWord().then(() => {
      fetchSentence()
      fetchQuestions()
    })
  }, []);

  const fillFormValues = (word: any) => {
    const formVal = {} as any;
    Object.keys(word).map((key) => {
      formVal[key] = word[key];
      (document.getElementById(key) as HTMLInputElement)?.setAttribute('value',word[key]);
    });
    setFormValues(formVal);
  }

  const onSelect = (selectedList: [], selectedItem: any) => {
    console.log('selected item: ', selectedItem);
    if (removedWordlists.includes(selectedItem)) {
      const updatedRem = removedWordlists.filter((ele) => ele != selectedItem)
      console.log('Removed list: ', updatedRem)
      setRemovedWordlists(updatedRem)
    }
    setSelectedWordlists(selectedList);
  }

  const onRemove = (selectedList: [], removedItem: any) => {
    console.log('removed item: ', removedItem);
    setSelectedWordlists(selectedList);
    const newRem = [...removedWordlists, removedItem]
    console.log('new rem: ', newRem)
    setRemovedWordlists(newRem)
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
    console.log('Sentences: ', sentences)
  };

  const removeSentence = (idx: number, e: any) => {
    e.preventDefault();

    if (sentences[idx].word_id || sentences[idx].id) {
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

    // console.log('Sentences: ', sentences);
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
    // console.log('Question ID: ', idx);
    // console.log('Questions: ', questions);
    // console.log('Question: ',questions[idx]);

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

    // console.log('Questions: ', questions);
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
    e.persist();
    setSupport(e.target.checked);
 }

  const sendForReview = (e: any, type = 'review') => {
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

    formData['fSentences'] = sentences;
    formData['fQuestions'] = questions.map((ele) => {
      return {
        ...ele,
        options: (ele.options as MiniWord[]).map((opt) => opt.id)
      }
    });
    formData['is_for_support'] = support;
    
    const [uniqueSyn, synIds] = seperateIdsAndNewWords(synonyms)
    const [uniqueAnt, antIds] = seperateIdsAndNewWords(antonyms)

    createSupportWords(uniqueSyn, user).then((synIdlist) => {
      createSupportWords(uniqueAnt, user).then((antIdList)=> {
        const synArr = synIds.concat(synIdlist)
        const antArr = antIds.concat(antIdList)

        formData['synonyms'] = synArr
        formData['antonyms'] = antArr
        formData['part_of_speech'] = formData.part_of_speech ?? 'noun'
        if (word.status) {
          if (type === 'review') {
            if (['creating-english', 'feedback-english'].includes(word.status)) {
              formData['status'] = 'review-english'
            } else if (['creating-punjabi', 'feedback-punjabi'].includes(word.status)) {
              formData['status'] = 'review-final'
            }
          } else if (type === 'approve') {
            if (word.status === 'review-english') {
              formData['status'] = 'creating-punjabi'
            } else if (word.status === 'review-final') {
              formData['status'] = 'active'
            }
          }
        } else {
          formData['status'] = 'review-english'
        }
        
        // make list of docRefs from selectedWordlists
        formData['wordlists'] = selectedWordlists.map((docu) => docu.id);
        console.log('Form data: ', formData);
        editWord(formData);
      })
    })
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
      if (!ele.match(/sentence\d+/) && !ele.match(/translation\d+/) && !ele.match(/question\d+/) && !ele.match(/qtranslation\d+/) && !ele.match(/type\d+/) && !ele.match(/options\d+/) && !ele.match(/answer\d+/)) {
        formData[ele] = formValues[ele];
      }
    });

    formData['fSentences'] = sentences;
    formData['fQuestions'] = setOptionsDataForSubmit(questions)
    formData['is_for_support'] = support;

    const [uniqueSyn, synIds] = seperateIdsAndNewWords(synonyms)
    const [uniqueAnt, antIds] = seperateIdsAndNewWords(antonyms)

    createSupportWords(uniqueSyn, user).then((synIdlist) => {
      createSupportWords(uniqueAnt, user).then((antIdList)=> {
          const synArr = synIds.concat(synIdlist)
          const antArr = antIds.concat(antIdList)
  
          formData['synonyms'] = synArr
          formData['antonyms'] = antArr
          formData['part_of_speech'] = formData.part_of_speech ?? 'noun'
          formData['status'] = formData.status ?? 'creating-english'
          
          // make list of docRefs from selectedWordlists
          formData['wordlists'] = selectedWordlists.map((docu) => docu.id);
          console.log('Form data: ', formData);
          setWordInWordlists(selectedWordlists, removedWordlists, wordid as string)
          editWord(formData)
      })
    })

  }

  const splitAndClear = (some: any) => {
    if (!some) return [];
    let splitList = some;
    if (typeof some === 'string') {
      splitList = some.split(',').map((ele: string) => ele.trim());

    }
    // remove empty strings
    const arr = splitList.filter((str: string) => str != '');
    return arr;
  }

  // connect the below function and call in handleSubmit
  const editWord = async (formData: any) => {
    setIsLoading(true);
    const {fSentences, fQuestions, ...form} = formData;

    const wordIsNew = await isWordNew(form.word, wordid)
    if (wordIsNew) {
      updateWord(
        getWord,
        {
          word: form.word,
          translation: form.translation,
          meaning_punjabi: form.meaning_punjabi ?? '',
          meaning_english: form.meaning_english ?? '',
          part_of_speech: form.part_of_speech ?? '',
          synonyms: form.synonyms,
          antonyms: form.antonyms,
          images: splitAndClear(form.images) ?? [],
          status: form.status ?? Object.keys(status)[0],
          created_at: word.created_at ?? Timestamp.now(),
          updated_at: Timestamp.now(),
          created_by: form.created_by ?? user.email,
          updated_by: user.email ?? '',
          notes: form.notes ?? '',
          is_for_support: form.is_for_support ?? false
      })
      .then(() => {
        // use return value of addWord to add sentences
        fSentences.forEach((sentence: any) => {
          const lSentence = {...sentence, word_id: wordid};
          if (sentence.id === undefined) {
            addSentence(lSentence)
          } else {
            const getSentence = doc(firestore, `sentences/${sentence.id}`);
            updateSentence(getSentence, {...lSentence});
          }
        })

        fQuestions.forEach((question: any) => {
          const lQuestion = {...question,
            translation: question.translation ?? '',
            options: question.options ?? [],
            type: question.type ?? 'context',
            word_id: wordid
          };
          if (question.id === undefined) {
            addQuestion(lQuestion)
          } else {
            const getQuestion = doc(firestore, `questions/${question.id}`);
            updateQuestion(getQuestion, lQuestion);
          }
        });

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

  const navigate = useNavigate();

  if (isLoading) return <h2>Loading...</h2>
  if (!found) return <h2>Word not found!</h2>
  if (!Object.keys(status).includes(word.status ?? 'creating-english')) {navigate(-1)}
  return (
    <div className='d-flex flex-column justify-content-center align-items-center background'>
      <h2>Edit Word</h2>
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
          <Form.Control type='text' placeholder='Enter meaning' pattern='[\u0A00-\u0A76।a-zA-Z0-9,." ]+' defaultValue={word.meaning_english} />
          <Form.Control.Feedback type='invalid'>
            Please enter meaning in English.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3' controlId='part_of_speech' onChange={handleChange}>
          <Form.Label>Part of Speech</Form.Label>
          <Form.Select aria-label='Choose part of speech' defaultValue={word.part_of_speech ?? 'noun'}>
            {part_of_speech.map((ele) => {
              return (
                <option key={ele} value={ele}>{ele.charAt(0).toUpperCase() + ele.slice(1)}</option>
              );
            })}
          </Form.Select>
        </Form.Group>

        <Form.Group className='mb-3' controlId='synonyms' onChange={handleChange}>
          <SupportWord id='synonyms' name='Synonyms' myVar={synonyms} setMyVar={setSynonyms} words={words.filter((val) => val.id !== wordid)} type={'synonyms'} placeholder='ਸਮਾਨਾਰਥਕ ਸ਼ਬਦ' />
        </Form.Group>

        <Form.Group className='mb-3' controlId='antonyms' onChange={handleChange}>
          <SupportWord id='antonyms' name='Antonyms' myVar={antonyms} setMyVar={setAntonyms} words={words.filter((val) => val.id !== wordid)} type={'antonyms'} placeholder='ਵਿਰੋਧੀ ਸ਼ਬਦ' />
        </Form.Group>

        <Form.Group className='mb-3' controlId='images' onChange={handleChange}>
          <Form.Label>Images</Form.Label>
          <Form.Control type='text' placeholder='imgUrl1, imgUrl2, ...' defaultValue={word.images} />
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="words" >
          <Form.Label>Choose Wordlist</Form.Label>
          <Multiselect 
            options={wordlists}
            displayValue="name"
            showCheckbox={true}
            onSelect={onSelect}
            onRemove={onRemove}
            selectedValues={selectedWordlists}
          />
        </Form.Group>

        <Form.Group className='mb-3' onChange={handleChange}>
          <Form.Label style={{display: 'flex', flexDirection: 'row', width: '100%', height: 40, justifyContent: 'space-between'}}>
            <h5>Sentences</h5>
            <div className='d-flex' style={{height: 40, alignItems: 'center'}}>
              <button className='btn btn-sm' onClick={addNewSentence}>➕</button>
            </div>
          </Form.Label>
          {sentences && sentences.length ? sentences.map((sentence, idx) => {
            return (
              <div key={idx} className='d-flex flex-column justify-content-between' style={{margin: '0 5%'}}>
                <div className='d-flex justify-content-between align-items-center'>
                  <b>Sentence {idx+1}</b>
                  <button className='btn btn-sm' onClick={(e) => removeSentence(idx, e)}>🗑️</button>
                </div>
                <div>
                  Sentence: <Form.Control id={`sentence${idx}`} className='m-1' type='text' value={sentence.sentence} placeholder='ਇੱਥੇ ਵਾਕ ਦਰਜ ਕਰੋ' onChange={(e) => changeSentence(e)} pattern='.+[\u0A00-\u0A76।,. ]' required/>
                  <Form.Control.Feedback type='invalid' itemID={`sentence${idx}`}>
                    Please enter sentence in Gurmukhi.
                  </Form.Control.Feedback>
                  <br/>

                  Translation: <Form.Control id={`translation${idx}`} className='m-1' type='text' value={sentence.translation} placeholder='Enter translation' onChange={(e) => changeSentence(e)} pattern="[\u0A00-\u0A76।a-zA-Z0-9,.' ]+" required/>
                  <Form.Control.Feedback type='invalid' itemID={`translation${idx}`}>
                    Please enter translation in English.
                  </Form.Control.Feedback>
                </div>
                <hr />
              </div>
            );
          }): null}
        </Form.Group>


        <Form.Group className='mb-3' onChange={handleChange}>
          <Form.Label style={{display: 'flex', flexDirection: 'row', width: '100%', height: 40, justifyContent: 'space-between'}}>
            <h5>Questions</h5>
            <div className='d-flex' style={{height: 40, alignItems: 'center'}}>
              <button className='btn btn-sm' onClick={addNewQuestion}>➕</button>
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
                      console.log('answer: ', question.answer, ' val: ', i)
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
          <Button className='btn btn-sm' onClick={addNewQuestion}>Add New Question</Button>
        </Form.Group>

        <Form.Group className='mb-3' controlId='notes' onChange={handleChange}>
          <Form.Label>Notes</Form.Label>
          <Form.Control as='textarea' rows={3} placeholder='Enter notes' defaultValue={word.notes} />
        </Form.Group>

        <div className='d-flex justify-content-between align-items-center'>
          <Form.Group className='mb-3' controlId='status' onChange={handleChange}>
            <Form.Label>Status</Form.Label>
            <Form.Select aria-label='Default select example'>
              {Object.entries(status).map((ele) => {
                const [key, value] = ele;
                return (
                  <option key={key+value.toString()} value={key} selected={key === word.status} >{value}</option>
                );
              })}
            </Form.Select>
          </Form.Group>
          <Form.Check
            reverse
            id="is_for_support"
            type="switch"
            checked={support}
            onChange={handleSupport}
            label="Is this word a synonym/antonym for another word and doesn't have its own data?"/>
        </div>

        <div className='d-flex justify-content-around'>
          <Button variant='primary' type='submit'>
            Submit
          </Button>
          {word.status && ['creating-english', 'creating-punjabi', 'feedback-english', 'feedback-english'].includes(word.status) ?
            <Button variant='primary' type='button' onClick={(e) => sendForReview(e)}>
              Send for review
            </Button>
          : null}
          {word.status && ['reviewer', 'admin'].includes(user.role) && ['review-english', 'review-final'].includes(word.status) ?
            <Button variant='primary' type='button' onClick={(e) => sendForReview(e, 'approve')}>
              Approve
            </Button>
          : null }
        </div>
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

export default EditWord

