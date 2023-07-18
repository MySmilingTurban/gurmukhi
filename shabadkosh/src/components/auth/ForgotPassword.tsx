import React, { FormEvent, useState } from 'react';
import { passwordReset } from '../../firebase';
import { Button, Form, FormGroup } from 'react-bootstrap';

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [emailMessage, setEmailMessage] = useState(false)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {
            await passwordReset(email)
            setEmailMessage(true)
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                alert('User not found, try again!')
                setEmail('')
            }
        }
    }

    return (
        <div className="container">
        {
            emailMessage ?
            <h3>Password reset email has been sent to your inbox!</h3>
            :
            <Form onSubmit={handleSubmit}>
                <FormGroup controlId='email'>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='Enter email'
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </FormGroup>
                <div className="d-grid gap-2">
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </div>
            </Form>
        }
        </div>
    )
}

export default ForgotPassword
