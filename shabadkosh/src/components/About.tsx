import React, { Component } from 'react';
import { Card } from 'react-bootstrap';

export class About extends Component {
  render() {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center m-4">
        <Card style={{width: '70%'}}>
          <Card.Body>
            <Card.Title>About Shabadavali</Card.Title>
            <Card.Text>
              Shabadavali is a comprehensive vocabulary-building platform to enhance language skills in Punjabi (Gurmukhi script). This dashboard serves as an internal tool specifically created for generating words and constructing word lists for the project. These word lists are then utilized to create custom curriculums, which are incorporated into an actual game.<br /><br />

            {/* Shabadavali offers an engaging and consistent learning experience, enabling users to expand their vocabulary while simultaneously honing their language skills. With its interactive features, users can actively practice and reinforce their abilities in speaking, reading, listening, and comprehension. The platform's word generation capabilities, coupled with the creation of custom curriculums, contribute to a tailored learning experience that aligns with the unique requirements of Sikh language learners. */}

            As part of its mission, <b>Khalis Foundation</b>, a non-profit organization, focuses on developing technology specifically catered to the global Sikh community. By creating innovative apps like Shabadavali, the foundation aims to provide educational resources and linguistic support to individuals seeking to improve their understanding and usage of their mother tongue Punjabi. And to empower individuals within the Sikh community and beyond with the necessary linguistic tools to connect, communicate, and engage effectively within their cultural and religious contexts.
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    );
  }
}

export default About;
