import { DocumentData, QuerySnapshot, Timestamp, doc, getDoc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { auth, firestore } from "../../firebase";
import { NewQuestionType } from "../../types/question";
import { NewSentenceType } from "../../types/sentence";
import { useUserAuth } from "../UserAuthContext";
import { addWord, addSentence, addQuestion, wordsCollection, updateWordlist } from "../util/controller";
import {Multiselect} from 'multiselect-react-dropdown';

interface Word {
    id: string;
    word: string;
}

const EditWordlist = () => {
    const { wlid } = useParams();
    const getWordlist = doc(firestore, `wordlists/${wlid}`);
    
    const [formValues, setFormValues] = useState({} as any);
    const [validated, setValidated] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [ found, setFound ] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [wordlist, setWordlist] = useState<any>({});
    const [words, setWords] = useState<Word[]>([]);
    const [selectedWords, setSelectedWords] = useState<Word[]>([]);
    const {user} = useUserAuth();


    useEffect(() => {
      const fetchWords = async () => {
        setIsLoading(true);
        onSnapshot(wordsCollection, (snapshot:
        QuerySnapshot<DocumentData>) => {
          console.log("snapshot", snapshot);
          setWords(
              snapshot.docs.map((doc) => {
              return {
                  id: doc.id,
                  word: doc.data().word,
              };
              })
          );
          console.log("Words: ", words)
        });

        setIsLoading(false);
      }
      const fetchWordlist = async () => {
          setIsLoading(true);
          const docSnap = await getDoc(getWordlist);
          if (docSnap.exists()) {
            const newWordObj = {
                id: docSnap.id,
                created_at: docSnap.data().created_at,
                updated_at: docSnap.data().updated_at,
                created_by: docSnap.data().created_by,
                ...docSnap.data(),
            } as any;
            let wlist = docSnap.data().words.map((ele: string) => 
              words.filter((val) => val.id == ele)[0]
            );
            newWordObj['words'] = wlist;
            console.log("Wlist: ", wlist);
            setWordlist(newWordObj);
            fillFormValues(newWordObj);
            setIsLoading(false);
          } else {
              console.log("No such document!");
              setFound(false);
              setIsLoading(false);
          }
      };
      fetchWords();
      fetchWordlist();
    }, []);

    const fillFormValues = (wordlist: any) => {
        const formVal = {} as any;
        Object.keys(wordlist).map((key) => {
          formVal[key] = wordlist[key];
          (document.getElementById(key) as HTMLInputElement)?.setAttribute('value',wordlist[key]);
        });
        setFormValues(formVal);
    }

    const resetState = () => {
        setValidated(false);
    }

    const handleChange = (e: any) => {
        setFormValues({ ...formValues, [e.target.id]: e.target.value });
    }

    const handleSubmit = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("Form Values: ", formValues);

        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            setValidated(true);
            return;
        }

        console.log('Validated!')

        // editWordlist(formValues);
    }

    /*
    Collection: WordLists
        {
        "wordlist_id": <wordlist_id>,
        "name": <name>,
        "words": [<word_id_1>, <word_id_2>, ...],
        "metadata": {
            "level": <level>,
            "curriculum": <curriculum>,
                "subgroup": <subgroup>
        },
        "status": <status>,
        "created_by": <user_id>,
        "created_at": <timestamp>,
        "updated_at": <timestamp>
        }
     */

    const splitAndClear = (some: any) => {
        if (!some) return [];
        let splitList = some.replaceAll(" ", "").split(',');
        // remove empty strings
        const arr = splitList.filter((str: string) => str != '');
        return arr;
    }

    // connect the below function and call in handleSubmit
    const editWordlist = (formData: any) => {
        setIsLoading(true);
        const {sentences, questions, ...form} = formData;

        updateWordlist(getWordlist, {...formData})
        .then((word_id) => {

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
            <Form.Group className="mb-3" controlId="name" onChange={handleChange}>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Wordlist name" defaultValue={wordlist.name} required />
              <Form.Control.Feedback type="invalid">
                Please enter a name for this wordlist.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="curriculum" onChange={handleChange}>
              <Form.Label>Curriculum</Form.Label>
              <Form.Control type="text" placeholder="Curriculum" defaultValue={wordlist.metadata?.curriculum} />
              <Form.Control.Feedback type="invalid">
                Please enter a name for the curriculum.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="level" onChange={handleChange}>
              <Form.Label>Level</Form.Label>
              <Form.Control type="text" placeholder="Level" defaultValue={wordlist.metadata?.level} />
              <Form.Control.Feedback type="invalid">
                Please enter level.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="subgroup" onChange={handleChange}>
              <Form.Label>Subgroup</Form.Label>
              <Form.Control type="text" placeholder="Subgroup" defaultValue={wordlist.metadata?.subgroup} />
              <Form.Control.Feedback type="invalid">
                Please enter a subgroup to which this belongs to.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="status" onChange={handleChange}>
              <Form.Label>Status</Form.Label>
              <Form.Select aria-label="Default select example" defaultValue={wordlist.status}>
                {['active', 'inactive'].map((ele, idx) => {
                  return (
                    <option key={ele} value={ele}>{ele}</option>
                  );
                })}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="words" onChange={handleChange}>
              <Form.Label>Words</Form.Label>
              <Multiselect 
                options={words}
                displayValue="word"
                selectedValues={wordlist.words ?? []}
                showCheckbox={true}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="notes" defaultValue={wordlist.notes} onChange={handleChange}>
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Enter notes" />
            </Form.Group>
    
            <Button variant="primary" type="submit">
                Submit
            </Button>
          </Form>
          {submitted ? <div className="d-flex justify-content-center align-items-center background">
            <div className="rounded p-4 p-sm-3">
              <h3>Successfully added a new word!</h3>
              <Button variant="primary" onClick={unsetSubmitted}>Add another word</Button>
              <Button variant="primary" onClick={() => navigate('/home')}>Back to Home</Button>
            </div>
          </div> : null}
        </div>
      );
}

export default EditWordlist;