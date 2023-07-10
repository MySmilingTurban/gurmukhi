import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Alert, Card } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { useUserAuth } from '../UserAuthContext';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase';
import { updateUser } from '../util/users';

const EditUser = () => {
  const { uid } = useParams();
  const getUser = doc(firestore, `users/${uid}`);

  const [localUser, setLocalUser] = useState({} as any);
  const [formValues, setFormValues] = useState({} as any);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [found, setFound] = useState<boolean>(true);
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { signUp, user } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const docSnap = await getDoc(getUser);
      if (docSnap.exists()) {
        const newUserObj = {
          id: docSnap.id,
          created_at: docSnap.data().created_at ?? Timestamp.now(),
          created_by: docSnap.data().created_by ?? 'self',
          updated_at: docSnap.data().updated_at ?? Timestamp.now(),
          updated_by: docSnap.data().updated_by ?? '',
          ...docSnap.data(),
        };
        setLocalUser(newUserObj);
        fillFormValues(newUserObj);
        setIsLoading(false);
      } else {
        console.log('No such document!');
        setFound(false);
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const roles = {
    'creator': 'Creator',
    'reviewer': 'Reviewer',
    'admin': 'Admin'
  }

  const handleChange = (e: any) => {
    setFormValues({ ...formValues, [e.target.id]: e.target.value });
  }

  const fillFormValues = (word: any) => {
    const formVal = {} as any;
    Object.keys(word).map((key) => {
      formVal[key] = word[key];
      (document.getElementById(key) as HTMLInputElement)?.setAttribute('value',word[key]);
    });
    setFormValues(formVal);
  }

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }
    console.log('Validated!');
    console.log('Form data: ', formValues);
    editUser(formValues);
  };

  const editUser = (formData: any) => {
    setIsLoading(true);

    updateUser(
      getUser,
      {
        name: formData.name,
        email: formData.email,
        pwd: formData.pwd ?? localUser.pwd,
        role: formData.role,
        created_at: formValues.created_at ?? localUser.created_at,
        created_by: formValues.created_by ?? localUser.created_by,
        updated_at: Timestamp.now(),
        updated_by: auth.currentUser?.email
      }
    ).then((id) => {
      console.log('Updated user with id: ', id);
    }).finally(() => {
      setIsLoading(false);
    })

    resetState();
    setSubmitted(true);
  }

  const resetState = () => {
    setValidated(false);
  }

  if (isLoading) return <h2>Loading...</h2>
  if (!found) return <h2>User not found!</h2>
  if (user?.role != 'admin') return <h2>Sorry, you are not authorized to view this page.</h2>;
  return (
    <>
      <div className="p-4 box">
        <h2 className="mb-3">Update User</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form className="rounded p-4 p-sm-3" hidden={submitted} noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="name"
              placeholder="Name"
              onChange={handleChange}
              defaultValue={localUser.name}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="role" onChange={handleChange}>
            <Form.Label>Role</Form.Label>
            <Form.Select aria-label="Default select example" defaultValue={localUser.role}>
              {Object.entries(roles).map((ele, idx) => {
                const [key, value] = ele;
                return (
                  <option key={key} value={key}>{value}</option>
                );
              })}
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Email address"
              onChange={handleChange}
              defaultValue={localUser.email}
              disabled={true}
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </div>
        </Form>
        {submitted ? <Card className='d-flex justify-content-center align-items-center background mt-4'>
        <Card.Body className='rounded p-4 p-sm-3'>
          <h3>Successfully updated the user!</h3>
          <Button variant='primary' onClick={() => navigate('/home')}>Back to Home</Button>
        </Card.Body>
      </Card> : null}
      </div>
    </>
  );
};

export default EditUser;
