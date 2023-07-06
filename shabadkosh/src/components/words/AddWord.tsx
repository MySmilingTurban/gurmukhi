// import React, { Component, FormEvent, useState } from "react";
// import { Button, Form } from "react-bootstrap";
// import { NewSentenceType } from "../../types/sentence";
// import { Navigate, useNavigate } from "react-router-dom";
// import { addWord } from "../util/controller";
// import { Timestamp } from "firebase/firestore";
// import { auth } from "../../firebase";

// interface MyState {}
// interface AddWordState {
//   sentences: NewSentenceType[];
//   validated: boolean;
//   submitted: boolean;
// }

// const status : Object = {
//   "creating": "Creation in progress",
//   "created": "Created",
//   // "reviewing": "Review in progress",
//   // "reviewed": "Reviewed",
//   // "active": "Active",
//   // "inactive": "Inactive"
// };

// class AddWord extends Component<MyState, AddWordState> {
//   constructor(props: any) {
//     super(props);
//     const stateJSON = window.localStorage.getItem('state');
//     this.state = stateJSON != null ? JSON.parse(stateJSON) : {
//       sentences: [],
//       validated: false,
//       submitted: false
//     };

//     this.addNewSentence = this.addNewSentence.bind(this);
//     this.removeAllSentences = this.removeAllSentences.bind(this);
//     this.removeSentence = this.removeSentence.bind(this);
//     this.changeSentence = this.changeSentence.bind(this);
//     this.addNewWord = this.addNewWord.bind(this);
//     this.resetState = this.resetState.bind(this);
//   }

//   setState<K extends keyof AddWordState>(state: AddWordState | ((prevState: Readonly<AddWordState>, props: Readonly<MyState>) => AddWordState | Pick<AddWordState, K> | null) | Pick<AddWordState, K> | null, callback?: (() => void) | undefined): void {
//     window.localStorage.setItem("state", JSON.stringify(state));
//     super.setState(state);
//   }

//   addNewSentence = () => {
//     // add new sentence to state
//     const { sentences } = this.state;
//     this.setState({
//       sentences: [
//         ...sentences,
//         {
//           word_id: "",
//           sentence: "",
//           translation: "",
//         },
//       ],
//     });
//     console.log(this.state.sentences.length, this.state.sentences);
//   };

//   removeSentence = (idx: number) => {
//     const { sentences } = this.state;
//     this.setState({
//       sentences: [
//         ...sentences.slice(0, idx),
//         ...sentences.slice(idx + 1),
//       ],
//     });
//   };

//   removeAllSentences = () => {
//     this.setState({
//       sentences: [],
//     });
//   };

//   changeSentence = (event: any) => {
//     event.preventDefault();
//     const updatedSentences = this.state.sentences.map((sentence, sidx) => {
//       if (event.target.id.includes("translation")) {
//         console.log("translation", parseInt(event.target.id.split('translation')[1]));
//         if (parseInt(event.target.id.split('translation')[1]) !== sidx) return sentence;
//         return { ...sentence, translation: event.target.value };
//       } else if (event.target.id.includes("sentence")) {
//         console.log("sentence", parseInt(event.target.id.split('sentence')[1]));
//         if (parseInt(event.target.id.split('sentence')[1]) !== sidx) return sentence;
//         return { ...sentence, sentence: event.target.value };
//       } else {
//         return sentence;
//       }
//     });
//     this.setState({ sentences: updatedSentences });
//   };

//   resetState = () => {
//     this.setState({
//       sentences: [],
//       validated: false
//     });
//   }

//   addNewWord = (e: FormEvent<HTMLFormElement>) => {
//     console.log('successfully added a new word!');
    
//     const form = e.currentTarget;
//     if (form.checkValidity() === false) {
//       e.preventDefault();
//       e.stopPropagation();
//     }
//     this.setState({ validated: true });

//     const formData = form.getElementsByTagName("input");

//     addWord({
//       word: formData[0].value,
//       translation: formData[1].value,
//       meaning_punjabi: formData[2].value,
//       meaning_english: formData[3].value,
//       synonyms: formData[4].value?.split(','),
//       antonyms: formData[5].value?.split(','),
//       status: formData[6].value ?? "creating",
//       created_at: Timestamp.now(),
//       updated_at: Timestamp.now(),
//       created_by: auth.currentUser?.email,
//     })


//     this.resetState();
//     this.setState({
//       submitted: true
//     });
//   }

//   unsetSubmitted = () => {
//     this.setState({
//       submitted: false
//     });
//     // refresh page
//     window.location.reload();
//   }

//   render() {
//     return (
//       <div className="d-flex justify-content-center align-items-center background">
//         <Form className="rounded p-4 p-sm-3" hidden={this.state.submitted} noValidate validated={this.state.validated} onSubmit={(e) => this.addNewWord(e)}>
//           <Form.Group className="mb-3" controlId="addFormWord">
//             <Form.Label>Word</Form.Label>
//             <Form.Control type="text" placeholder="ਸ਼ਬਦ" required />
//             <Form.Control.Feedback type="invalid">
//               Please enter a word.
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="addFormTranslation">
//             <Form.Label>Translation</Form.Label>
//             <Form.Control type="text" placeholder="Enter translation" required />
//             <Form.Control.Feedback type="invalid">
//               Please enter a translation.
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="addFormMeaningPunjabi">
//             <Form.Label>Meaning (Punjabi)</Form.Label>
//             <Form.Control type="text" placeholder="ਇੱਥੇ ਅਰਥ ਦਰਜ ਕਰੋ" />
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="addFormMeaningEnglish">
//             <Form.Label>Meaning (English)</Form.Label>
//             <Form.Control type="text" placeholder="Enter meaning" />
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="addFormSynonyms">
//             <Form.Label>Synonyms</Form.Label>
//             <Form.Control type="text" placeholder="ਸਮਾਨਾਰਥੀ ਸ਼ਬਦ 1, ਸਮਾਨਾਰਥੀ ਸ਼ਬਦ 2, ..." />
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="addFormAntonyms">
//             <Form.Label>Antonyms</Form.Label>
//             <Form.Control type="text" placeholder="ਵਿਰੋਧੀ ਸ਼ਬਦ 1, ਵਿਰੋਧੀ ਸ਼ਬਦ 2, ..." />
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="addFormStatus">
//             <Form.Label>Status</Form.Label>
//             <Form.Select aria-label="Default select example">
//               <option>Select a status</option>
//               {Object.entries(status).map((ele, idx) => {
//                 const [key, value] = ele;
//                 return (
//                   <option key={key+value.toString()} value={key}>{value}</option>
//                 );
//               })}
//             </Form.Select>
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="addFormImages">
//             <Form.Label>Images</Form.Label>
//             <Form.Control type="text" placeholder="imgUrl1, imgUrl2, ..." />
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="addFormSentences">
//             <Form.Label style={{display: 'flex', width: '100%', justifyContent: 'space-between'}}>
//               <p>Sentences</p>
//               <button className="btn btn-sm" onClick={this.addNewSentence}>➕</button>
//               <button className="btn btn-sm" onClick={this.removeAllSentences}>❌</button>
//             </Form.Label>
//             {this.state.sentences && this.state.sentences.length ? this.state.sentences.map((sentence, idx) => {
//               return (
//                 <div key={idx} className="d-flex flex-column justify-content-between mb-3">
//                   <div className="d-flex justify-content-between">
//                     <p>Sentence {idx+1}</p>
//                     <button className="btn btn-sm" onClick={() => this.removeSentence(idx)}>🗑️</button>
//                   </div>
//                   <Form.Control id={`sentence${idx}`} className="m-1" type="text" placeholder="ਇੱਥੇ ਸ਼ਬਦ ਦਰਜ ਕਰੋ" onChange={(e) => this.changeSentence(e)} />
//                   <Form.Control id={`translation${idx}`} className="m-1" type="text" placeholder="Enter translation" onChange={(e) => this.changeSentence(e)} />
//                 </div>
//               );
//             }): null}
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="addFormNotes">
//             <Form.Label>Notes</Form.Label>
//             <Form.Control as="textarea" rows={3} placeholder="Enter notes" />
//           </Form.Group>

//             <Button variant="primary" type="submit">
//               Submit
//             </Button>
//         </Form>
//         {this.state.submitted ? <div className="d-flex justify-content-center align-items-center background">
//           <div className="rounded p-4 p-sm-3">
//             <h3>Successfully added a new word!</h3>
//             <Button variant="primary" onClick={this.unsetSubmitted}>Add another word</Button>
//           </div>
//         </div> : null}
//       </div>
//     );
//   }
// }

import React, { useState } from "react";
import { Button, Card, Form, FormControlProps } from "react-bootstrap";
import { NewSentenceType } from "../../types/sentence";
import { Navigate, useNavigate } from "react-router-dom";
import { addQuestion, addSentence, addWord } from "../util/controller";
import { Timestamp } from "firebase/firestore";
import { auth } from "../../firebase";
import { NewQuestionType } from "../../types/question";
import { useUserAuth } from "../UserAuthContext";

const types = ['context', 'image', 'meaning', 'definition'];

interface SentenceType {
  sentence: string,
  translation: string,
  word_id: string
}

interface QuestionType {
  question: string,
  type: string,
  options: string,
  answer: string,
  word_id: string
}

const AddWord = () => {
  const [formValues, setFormValues] = useState({} as any);
  const [sentences, setSentences] = useState<NewSentenceType[]>([]);
  const [questions, setQuestions] = useState<NewQuestionType[]>([]);
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useUserAuth();

  let status = {
    "creating": "Creation in progress",
    "created": "Created"
  } as Object;
  if (user.role == "admin") {
    status = {
      ...status,
      "reviewing": "Review in progress",
      "reviewed": "Reviewed",
      "active": "Active",
      "inactive": "Inactive"
    }
  } else if (user.role == "reviewer") {
    status = {
      "reviewing": "Review in progress",
      "reviewed": "Reviewed"
    }
  }

  const addNewSentence = (e: any) => {
    e.preventDefault();
    setSentences((prevSentences) => [
      ...prevSentences,
      {
        word_id: "",
        sentence: "",
        translation: "",
      },
    ]);
  };

  const removeSentence = (idx: number, e: any) => {
    e.preventDefault();
    console.log("Sentence ID: ", idx);
    console.log("Sentences: ", sentences);
    console.log("Sentence: ",sentences[idx]);

    let newSFormValues = {} as any;
    
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

    console.log("Sentences: ", sentences);
  };

  const removeAllSentences = (e:any) => {
    e.preventDefault();
    setSentences([]);
    let newSFormValues = {} as any;
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
      if (event.target.id.includes("translation")) {
        if (parseInt(event.target.id.split('translation')[1]) !== sidx) return sentence;
        return { ...sentence, translation: event.target.value };
      } else if (event.target.id.includes("sentence")) {
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
        question: "",
        type: "",
        options: [],
        answer: "",
        word_id: "",
      },
    ]);
  };

  const removeQuestion = (idx: number, e: any) => {
    e.preventDefault();
    console.log("Question ID: ", idx);
    console.log("Questions: ", questions);
    console.log("Question: ",questions[idx]);

    let newSFormValues = {} as any;
    
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

    console.log("Questions: ", questions);
  };

  const removeAllQuestions = (e:any) => {
    e.preventDefault();
    setQuestions([]);
    let newSFormValues = {} as any;
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
      if (event.target.id.includes("question")) {
        if (parseInt(event.target.id.split('question')[1]) !== qidx) return question;
        return { ...question, question: event.target.value };
      } else if (event.target.id.includes("type")) {
        if (parseInt(event.target.id.split('type')[1]) !== qidx) return question;
        return { ...question, type: event.target.value };
      } else if (event.target.id.includes("options")) {
        if (parseInt(event.target.id.split('options')[1]) !== qidx) return question;
        return { ...question, options: event.target.value };
      } else if (event.target.id.includes("answer")) {
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
    
    console.log("Form Values: ", formValues);
    console.log("Sentences: ", sentences);
    console.log("Questions: ", questions);

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    console.log("Validated!");

    const formData = {} as any;
    Object.keys(formValues).map((ele) => {
      if (!ele.match(/sentence\d+/) && !ele.match(/translation\d+/) && !ele.match(/question\d+/) && !ele.match(/type\d+/) && !ele.match(/options\d+/) && !ele.match(/answer\d+/)) {
        formData[ele] = formValues[ele];
      }
    });

    console.log("Form data: ", formData);

    formData['sentences'] = sentences;
    formData['questions'] = questions;
    addNewWord(formData);
  }

  const splitAndClear = (some: any) => {
    if (!some) return [];
    let splitList = some.replaceAll(" ", "").split(',');
    // remove empty strings
    const arr = splitList.filter((str: string) => str != '');
    return arr;
  }

  // connect the below function and call in handleSubmit
  const addNewWord = (formData: any) => {
    setIsLoading(true);
    const {sentences, questions, ...form} = formData;

    addWord({
      word: form.word,
      translation: form.translation,
      meaning_punjabi: form.meaning_punjabi ?? '',
      meaning_english: form.meaning_english ?? '',
      synonyms: splitAndClear(form.synonyms) ?? [],
      antonyms: splitAndClear(form.antonyms) ?? [],
      images: splitAndClear(form.images) ?? [],
      status: form.status ?? "creating",
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      created_by: auth.currentUser?.email,
    })
    .then((word_id) => {
      // use return value of addWord to add sentences
      sentences.forEach((sentence: any) => {
        const lSentence = {...sentence, word_id};
        const checkSentence = (sentence: SentenceType) => {
          console.log(sentence);
        };
        checkSentence(lSentence);
        addSentence({
          ...sentence,
          word_id
        });
      })

      questions.forEach((question: any) => {
        const lQuestion = {...question, word_id};
        const checkQuestion = (question: QuestionType) => {
          console.log(question);
        };
        checkQuestion(lQuestion);
        addQuestion({
          ...question,
          options: splitAndClear(question.options) ?? [],
          type: question.type ?? 'context',
          word_id
        })
      });

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
    <div className="d-flex justify-content-center align-items-center background">
      <Form className="rounded p-4 p-sm-3" hidden={submitted} noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="word" onChange={handleChange}>
          <Form.Label>Word</Form.Label>
          <Form.Control type="text" placeholder="ਸ਼ਬਦ" pattern=".+[\u0A00-\u0A76,. ]" required />
          <Form.Control.Feedback type="invalid">
            Please enter a word in Gurmukhi.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="translation" onChange={handleChange}>
          <Form.Label>Translation</Form.Label>
          <Form.Control type="text" placeholder="Enter translation" pattern="[\u0A00-\u0A76a-zA-Z0-9,. ]+" required />
          <Form.Control.Feedback type="invalid">
            Please enter a translation in English.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="meaning_punjabi" onChange={handleChange}>
          <Form.Label>Meaning (Punjabi)</Form.Label>
          <Form.Control type="text" placeholder="ਇੱਥੇ ਅਰਥ ਦਰਜ ਕਰੋ" pattern=".+[\u0A00-\u0A76,. ]" />
          <Form.Control.Feedback type="invalid">
            Please enter meaning in Gurmukhi.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="meaning_english" onChange={handleChange}>
          <Form.Label>Meaning (English)</Form.Label>
          <Form.Control type="text" placeholder="Enter meaning" pattern="[\u0A00-\u0A76a-zA-Z0-9,. ]+" />
          <Form.Control.Feedback type="invalid">
            Please enter meaning in English.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="synonyms" onChange={handleChange}>
          <Form.Label>Synonyms</Form.Label>
          <Form.Control type="text" placeholder="ਸਮਾਨਾਰਥੀ ਸ਼ਬਦ 1, ਸਮਾਨਾਰਥੀ ਸ਼ਬਦ 2, ..." pattern=".+[\u0A00-\u0A76,. ]" />
          <Form.Control.Feedback type="invalid">
            Please enter comma-separated synonyms in Gurmukhi.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="antonyms" onChange={handleChange}>
          <Form.Label>Antonyms</Form.Label>
          <Form.Control type="text" placeholder="ਵਿਰੋਧੀ ਸ਼ਬਦ 1, ਵਿਰੋਧੀ ਸ਼ਬਦ 2, ..." pattern=".+[\u0A00-\u0A76,. ]" />
          <Form.Control.Feedback type="invalid">
            Please enter comma-separated antonyms in Gurmukhi.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="status" onChange={handleChange}>
          <Form.Label>Status</Form.Label>
          <Form.Select aria-label="Default select example">
            {Object.entries(status).map((ele, idx) => {
              const [key, value] = ele;
              return (
                <option key={key+value.toString()} value={key}>{value}</option>
              );
            })}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="images" onChange={handleChange}>
          <Form.Label>Images</Form.Label>
          <Form.Control type="text" placeholder="imgUrl1, imgUrl2, ..." />
        </Form.Group>

        <Form.Group className="mb-3" onChange={handleChange}>
          <Form.Label style={{display: 'flex', flexDirection: 'row', width: '100%', height: 40, justifyContent: 'space-between'}}>
            <p>Sentences</p>
            <div className="d-flex" style={{height: 40, alignItems: 'center'}}>
              <button className="btn btn-sm" onClick={addNewSentence}>➕</button>
              <button className="btn btn-sm" onClick={removeAllSentences}>❌</button>
            </div>
          </Form.Label>
          {sentences && sentences.length ? sentences.map((sentence, idx) => {
            return (
              <div key={idx} className="d-flex flex-column justify-content-between mb-3">
                <div className="d-flex justify-content-between">
                  <p>Sentence {idx+1}</p>
                  <button className="btn btn-sm" onClick={(e) => removeSentence(idx, e)}>🗑️</button>
                </div>
                Sentence: <Form.Control id={`sentence${idx}`} className="m-1" type="text" value={sentence.sentence} placeholder="ਇੱਥੇ ਵਾਕ ਦਰਜ ਕਰੋ" onChange={(e) => changeSentence(e)} pattern=".+[\u0A00-\u0A76,. ]" />
                <Form.Control.Feedback type="invalid" itemID={`sentence${idx}`}>
                  Please enter sentence in Gurmukhi.
                </Form.Control.Feedback>

                Translation: <Form.Control id={`translation${idx}`} className="m-1" type="text" value={sentence.translation} placeholder="Enter translation" onChange={(e) => changeSentence(e)} pattern="[\u0A00-\u0A76a-zA-Z0-9,.' ]+" />
                <Form.Control.Feedback type="invalid" itemID={`translation${idx}`}>
                  Please enter translation in English.
                </Form.Control.Feedback>
              </div>
            );
          }): null}
        </Form.Group>

        <Form.Group className="mb-3" onChange={handleChange}>
          <Form.Label style={{display: 'flex', flexDirection: 'row', width: '100%', height: 40, justifyContent: 'space-between'}}>
            <p>Questions</p>
            <div className="d-flex" style={{height: 40, alignItems: 'center'}}>
              <button className="btn btn-sm" onClick={addNewQuestion}>➕</button>
              <button className="btn btn-sm" onClick={removeAllQuestions}>❌</button>
            </div>
          </Form.Label>
          {questions && questions.length ? questions.map((question, idx) => {
            return (
              <div key={idx} className="d-flex flex-column justify-content-between mb-3">
                <div className="d-flex justify-content-between">
                  <p>Question {idx+1}</p>
                  <button className="btn btn-sm" onClick={(e) => removeQuestion(idx, e)}>🗑️</button>
                </div>
                Question: <Form.Control id={`question${idx}`} className="m-1" type="text" value={question.question} placeholder="ਇੱਥੇ ਸਵਾਲ ਦਰਜ ਕਰੋ" onChange={(e) => changeQuestion(e)} pattern=".+[\u0A00-\u0A76,.].*[\s,?]*" />
                <Form.Control.Feedback type="invalid" itemID={`question${idx}`}>
                  Please enter question in Gurmukhi.
                </Form.Control.Feedback>

                Type: <Form.Select aria-label="Default select example" id={`type${idx}`} value={question.type} onChange={(e) => changeQuestion(e)}>
                  {types.map((ele, idx) => {
                    return (
                      <option key={ele} value={ele}>{ele}</option>
                      );
                    })}
                </Form.Select>

                Options: <Form.Control id={`options${idx}`} className="m-1" type="text" placeholder="ਜਵਾਬ1, ਜਵਾਬ2, ..." value={question.options} onChange={(e) => changeQuestion(e)} pattern=".+[\u0A00-\u0A76,.].[\s,?]*" />
                <Form.Control.Feedback type="invalid" itemID={`options${idx}`}>
                  Please enter comma-separated options in Gurmukhi.
                </Form.Control.Feedback>

                Answer: <Form.Control id={`answer${idx}`} className="m-1" type="text" placeholder="ਜਵਾਬ" value={question.answer} onChange={(e) => changeQuestion(e)} pattern=".+[\u0A00-\u0A76,.].[\s,?]*" />
                <Form.Control.Feedback type="invalid" itemID={`answer${idx}`}>
                  Please enter answer in Gurmukhi.
                </Form.Control.Feedback>
              </div>
            );
          }): null}
        </Form.Group>

        <Form.Group className="mb-3" controlId="notes" onChange={handleChange}>
          <Form.Label>Notes</Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="Enter notes" />
        </Form.Group>

          <Button variant="primary" type="submit">
            Submit
          </Button>
      </Form>
      {submitted ? <Card className="d-flex justify-content-center align-items-center background">
        <Card.Body className="rounded p-4 p-sm-3">
          <h3>Successfully added a new word!</h3>
          <Button variant="primary" onClick={unsetSubmitted}>Add another word</Button>
          <Button variant="primary" onClick={() => navigate('/words')}>Back to Words</Button>
        </Card.Body>
      </Card> : null}
    </div>
  );

};

export default AddWord;
