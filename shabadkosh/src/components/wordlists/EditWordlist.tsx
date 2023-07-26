/* eslint-disable react-hooks/exhaustive-deps */
import { DocumentData, QuerySnapshot, Timestamp, doc, getDoc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, firestore } from '../../firebase';
import { wordsCollection, updateWordlist } from '../util/controller';
import { Multiselect } from 'multiselect-react-dropdown';
import { MiniWord } from '../../types/word';

const EditWordlist = () => {
    const { wlid } = useParams();
    const getWordlist = doc(firestore, `wordlists/${wlid}`);
    
    const [formValues, setFormValues] = useState({} as any);
    const [validated, setValidated] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [found, setFound] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [wordlist, setWordlist] = useState<any>({});
    const [words, setWords] = useState<MiniWord[]>([]);
    const [selectedWords, setSelectedWords] = useState<MiniWord[]>([]);

    useEffect(() => {
      let localWlist = [] as MiniWord[]
      const fetchWords = async () => {
        setIsLoading(true);
        onSnapshot(wordsCollection, (snapshot:
        QuerySnapshot<DocumentData>) => {
          const allWords = snapshot.docs.map((doc) => {
            return {
                id: doc.id,
                word: doc.data().word,
            } as MiniWord;
          })
          localWlist = allWords;
          setWords(allWords);
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
                created_by: docSnap.data().created_by,
                updated_at: docSnap.data().updated_at,
                updated_by: docSnap.data().updated_by,
                words: docSnap.data().words ?? [],
                ...docSnap.data(),
            } as any;
            const wlist = newWordObj.words.map((ele: string) => 
              localWlist.filter((val: MiniWord) => val.id === ele)[0])
              .filter((ele: any) => ele != undefined)

            newWordObj['words'] = wlist;
            setFound(true);
            setWordlist(newWordObj);
            setSelectedWords(wlist);
            fillFormValues(newWordObj);
            setIsLoading(false);
          } else {
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

    const onMultiselectChange = (selectedList: []) => {
      setSelectedWords(selectedList);
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
          id: formValues.id,
          name: formValues.name,
          status: formValues.status,
          words: selectedWords.map((ele) => ele.id),
          metadata: {
            curriculum: formValues.curriculum ?? formValues.metadata.curriculum,
            level: formValues.level ?? formValues.metadata.level,
            subgroup: formValues.subgroup ?? formValues.metadata.subgroup,
          },
          created_by: formValues.created_by,
          created_at: formValues.created_at,
          updated_by: auth.currentUser?.email,
          updated_at: Timestamp.now(),
          notes: formValues.notes,
        }

        // console.log('Selected words: ', selectedWords);

        editWordlist(formData)
    }

    // connect the below function and call in handleSubmit
    const editWordlist = (formData: any) => {
        setIsLoading(true);

        updateWordlist(getWordlist, {...formData})
        .finally(() => {
          setIsLoading(false);
        });

        resetState();
        setSubmitted(true);
    }

    const navigate = useNavigate();
    
    if (isLoading) return <div>Loading...</div>
    if (!found) return <h2>Wordlist not found!</h2>;
    return (
        <div className='d-flex flex-column justify-content-center align-items-center background container'>
          <h2>Edit Wordlist</h2>
          <Form className='rounded p-4 p-sm-3' hidden={submitted} noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className='mb-3' controlId='name' onChange={handleChange}>
              <Form.Label>Name</Form.Label>
              <Form.Control type='text' placeholder='Wordlist name' defaultValue={wordlist.name} required />
              <Form.Control.Feedback type='invalid'>
                Please enter a name for this wordlist.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className='mb-3' controlId='curriculum' onChange={handleChange}>
              <Form.Label>Curriculum</Form.Label>
              <Form.Control type='text' placeholder='Curriculum' defaultValue={wordlist.metadata?.curriculum} />
              <Form.Control.Feedback type='invalid'>
                Please enter a name for the curriculum.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className='mb-3' controlId='level' onChange={handleChange}>
              <Form.Label>Level</Form.Label>
              <Form.Control type='text' placeholder='Level' defaultValue={wordlist.metadata?.level} />
              <Form.Control.Feedback type='invalid'>
                Please enter level.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className='mb-3' controlId='subgroup' onChange={handleChange}>
              <Form.Label>Subgroup</Form.Label>
              <Form.Control type='text' placeholder='Subgroup' defaultValue={wordlist.metadata?.subgroup} />
              <Form.Control.Feedback type='invalid'>
                Please enter a subgroup to which this belongs to.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className='mb-3' controlId='status' onChange={handleChange}>
              <Form.Label>Status</Form.Label>
              <Form.Select aria-label='Default select example' defaultValue={wordlist.status}>
                {['active', 'inactive'].map((ele) => {
                  return (
                    <option key={ele} value={ele}>{ele}</option>
                  );
                })}
              </Form.Select>
            </Form.Group>

            <Form.Group className='mb-3' controlId='words' onChange={handleChange}>
              <Form.Label>Words</Form.Label>
              <Multiselect 
                options={words}
                displayValue='word'
                showCheckbox={true}
                onSelect={onMultiselectChange}
                onRemove={onMultiselectChange}
                selectedValues={selectedWords??[]}
              />
            </Form.Group>

            <Form.Group className='mb-3' controlId='notes' onChange={handleChange}>
              <Form.Label>Notes</Form.Label>
              <Form.Control as='textarea' rows={3} defaultValue={wordlist.notes} placeholder='Enter notes' />
            </Form.Group>
    
            <Button variant='primary' type='submit'>
                Submit
            </Button>
          </Form>
          {submitted ? <Card className='d-flex justify-content-center align-items-center background'>
            <Card.Body className='rounded p-4 p-sm-3'>
              <h3>Successfully updated wordlist!</h3>
              <Button variant='primary' onClick={() => navigate('/wordlists')}>Back to Wordlists</Button>
            </Card.Body>
          </Card> : null}
        </div>
      );
}

export default EditWordlist;