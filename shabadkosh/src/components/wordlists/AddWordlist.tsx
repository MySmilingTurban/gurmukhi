import { DocumentData, QuerySnapshot, Timestamp, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { useUserAuth } from "../UserAuthContext";
import { addWord, addSentence, addQuestion, wordsCollection, addNewWordlist } from "../util/controller";
import {Multiselect} from 'multiselect-react-dropdown';

interface Word {
    id: string;
    word: string;
}

const AddWordlist = () => {
    const [formValues, setFormValues] = useState({} as any);
    const [validated, setValidated] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [words, setWords] = useState<Word[]>([]);
    const {user} = useUserAuth();

    useEffect(() => {
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
        });

        setIsLoading(false);
    }, []);

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
        console.log("target : ", form);
        if (form.checkValidity() === false) {
            setValidated(true);
            return;
        }

        console.log("Validated!");

        // const formData = {} as any;
        // Object.keys(formValues).map((ele) => {
        // if (!ele.match(/sentence\d+/) && !ele.match(/translation\d+/) && !ele.match(/question\d+/) && !ele.match(/type\d+/) && !ele.match(/options\d+/) && !ele.match(/answer\d+/)) {
        //     formData[ele] = formValues[ele];
        // }
        // });

        // console.log("Form data: ", formData);
        // addWordlist(formData);
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
    const addWordList = (formData: any) => {
        setIsLoading(true);
        const {sentences, questions, ...form} = formData;

        addNewWordlist({
          name: form.name,
          status: form.status,
          metadata: {
            curriculum: form.curriculum,
            level: form.level,
            subgroup: form.subgroup
          },
          words: form.words,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
          created_by: user.name,
          notes: form.notes
        })
        .then((wordlist_id) => {
          console.log("Wordlist created with ID: ", wordlist_id)
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
        <div className="d-flex flex-column justify-content-center align-items-center background">
          <h2>Add New Wordlist</h2>
          <Form className="rounded p-4 p-sm-3" hidden={submitted} noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name" onChange={handleChange}>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Wordlist name" required />
              <Form.Control.Feedback type="invalid">
                Please enter a name for this wordlist.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="curriculum" onChange={handleChange}>
              <Form.Label>Curriculum</Form.Label>
              <Form.Control type="text" placeholder="Curriculum" />
              <Form.Control.Feedback type="invalid">
                Please enter a name for the curriculum.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="level" onChange={handleChange}>
              <Form.Label>Level</Form.Label>
              <Form.Control type="text" placeholder="Level" />
              <Form.Control.Feedback type="invalid">
                Please enter level.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="subgroup" onChange={handleChange}>
              <Form.Label>Subgroup</Form.Label>
              <Form.Control type="text" placeholder="Subgroup" />
              <Form.Control.Feedback type="invalid">
                Please enter a subgroup to which this belongs to.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="status" onChange={handleChange}>
              <Form.Label>Status</Form.Label>
              <Form.Select aria-label="Default select example">
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
                showCheckbox={true}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="notes" onChange={handleChange}>
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Enter notes" />
            </Form.Group>
    
            <Button variant="primary" type="submit">
                Submit
            </Button>
          </Form>
          {submitted ? <div className="d-flex justify-content-center align-items-center background">
            <div className="rounded p-4 p-sm-3">
              <h3>Successfully added a new wordlist!</h3>
              <Button variant="primary" onClick={unsetSubmitted}>Add another word</Button>
              <Button variant="primary" onClick={() => navigate('/home')}>Back to Home</Button>
            </div>
          </div> : null}
        </div>
      );
}

export default AddWordlist;