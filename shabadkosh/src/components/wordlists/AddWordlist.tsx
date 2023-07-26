/* eslint-disable @typescript-eslint/no-unused-vars */
import { DocumentData, QuerySnapshot, Timestamp, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addNewWordlist, wordsCollection} from '../util/controller';
import { auth } from '../../firebase';
import { MiniWord, NewWordType } from '../../types/word';
import { useUserAuth } from '../UserAuthContext';
import Multiselect from 'multiselect-react-dropdown';

const AddWordlist = () => {
    const [formValues, setFormValues] = useState({} as any);
    const [validated, setValidated] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [words, setWords] = useState<MiniWord[]>([])
    const [selectedWords, setSelectedWords] = useState<MiniWord[]>([])

    useEffect(() => {
      setIsLoading(true)
      onSnapshot(wordsCollection, (snapshot: QuerySnapshot<DocumentData>) => {
        setWords(snapshot.docs.map((doc) => {
          return {
              id: doc.id,
              word: doc.data().word,
          }
        }))
      })

      setIsLoading(false);
    }, []);

    const onMultiselectChange = (selectedList: [], item: any) => {
      setSelectedWords(selectedList);
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

        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            setValidated(true);
            return;
        }

        const formData = {
          ...formValues,
          words: selectedWords.map((ele) => ele.id)
        }

        addWordlist(formData);
    }

    // connect the below function and call in handleSubmit
    const addWordlist = (formData: any) => {
        setIsLoading(true);
        addNewWordlist({
          name: formData.name,
          status: formData.status ?? 'active',
          metadata: {
            curriculum: formData.curriculum ?? '',
            level: formData.level ?? '',
            subgroup: formData.subgroup ?? ''
          },
          words: formData.words ?? [],
          created_at: Timestamp.now(),
          created_by: auth.currentUser?.email,
          updated_at: Timestamp.now(),
          updated_by: auth.currentUser?.email,
          notes: formData.notes ?? ''
        })
        .then((wordlist_id) => {
          // console.log('Wordlist created with ID: ', wordlist_id)
        }).finally(() => {
          setIsLoading(false);
        }).catch((err) => {
          console.log('Error: ', err)
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

            <Form.Group className="mb-3" controlId="words" >
              <Form.Label>Words</Form.Label>
              <Multiselect 
                options={words}
                displayValue="word"
                showCheckbox={true}
                onSelect={onMultiselectChange}
                onRemove={onMultiselectChange}
              />
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
              <Form.Select aria-label="Default select example" defaultValue={'active'}>
                {['active', 'inactive'].map((ele) => {
                  return (
                    <option key={ele} value={ele}>{ele}</option>
                  );
                })}
              </Form.Select>
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
              <h3>Successfully added a new wordlist!</h3>
              <div className='d-flex justify-content-between align-items-center'>
                <Button variant="primary" onClick={unsetSubmitted}>Add another wordlist</Button>
                <Button variant="primary" onClick={() => navigate('/wordlists')}>View Wordlists</Button>
              </div>
            </Card.Body>
          </Card> : null}
        </div>
      );
}

export default AddWordlist;