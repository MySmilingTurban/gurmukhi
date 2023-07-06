// import React, { Component } from 'react'
// import { Button, Form } from 'react-bootstrap'
// import { MapDispatchToProps, connect } from 'react-redux';
// import { createWord } from '../../store/actions/wordActions';
// import { NewWordType } from '../../types/word';
// import { NewSentenceType } from '../../types/sentence';

// interface MyState {}
// interface AddWordState {
//     word: string;
//     translation: string;
//     meaning_punjabi: string;
//     meaning_english: string;
//     synonyms: string[];
//     antonyms: string[];
//     images: string[];
//     notes: string;
//     sentences: NewSentenceType[];
//     created_by: string;
//     created_at: string;
//     updated_at: string;
//     status: string;
//   validated: boolean;
//   submitted: boolean;
// }
// const status : Object = {
//     "creating": "Creation in progress",
//     "created": "Created",
//     // "reviewing": "Review in progress",
//     // "reviewed": "Reviewed",
//     // "active": "Active",
//     // "inactive": "Inactive"
// };

// class CreateWord extends Component<MyState, AddWordState> {
//     state = {
//         word: '',
//         translation: '',
//         meaning_punjabi: '',
//         meaning_english: '',
//         synonyms: [],
//         antonyms: [],
//         images: [],
//         notes: '',
//         sentences: [],
//         created_by: '',
//         created_at: '',
//         updated_at: '',
//     }

//     addNewSentence = () => {
//         // add new sentence to state
//         const { sentences } = this.state;
//         this.setState({
//           sentences: [
//             ...sentences,
//             {
//               word_id: "",
//               sentence: "",
//               translation: "",
//             },
//           ],
//         });
//         console.log(this.state.sentences.length, this.state.sentences);
//     };

//     removeSentence = (idx: number) => {
//         const { sentences } = this.state;
//         this.setState({
//             sentences: [
//             ...sentences.slice(0, idx),
//             ...sentences.slice(idx + 1),
//             ],
//         });
//     };

//     removeAllSentences = () => {
//         this.setState({
//             sentences: [],
//         });
//     };

//     changeSentence = (event: any) => {
//         event.preventDefault();
//         const updatedSentences = this.state.sentences.map((sentence, sidx) => {
//             if (event.target.id.includes("translation")) {
//                 console.log("translation", parseInt(event.target.id.split('translation')[1]));
//                 if (parseInt(event.target.id.split('translation')[1]) !== sidx) return sentence;
//                 return { ...sentence, translation: event.target.value };
//             } else if (event.target.id.includes("sentence")) {
//                 console.log("sentence", parseInt(event.target.id.split('sentence')[1]));
//                 if (parseInt(event.target.id.split('sentence')[1]) !== sidx) return sentence;
//                 return { ...sentence, sentence: event.target.value };
//             } else {
//                 return sentence;
//             }
//         });
//         this.setState({ sentences: updatedSentences });
//     };

//     handleChange = (e: any) => {
//         this.setState({
//             [e.target.id]: ['synonyms', 'antonyms', 'images'].includes(e.target.id) ? e.target.value.replaceAll(" ", "").split(',') : e.target.value
//         })
//     }

//     handleSubmit = (e: any) => {
//         e.preventDefault();
//         // console.log(this.state);
//         this.props.createWord(this.state);
//     }

//     render() {
//         return (
//             <div className="container">
//                 <Form className="rounded p-4 p-sm-3" onSubmit={this.handleSubmit}> 
//                 {/* hidden={this.state.submitted} noValidate validated={this.state.validated} onSubmit={(e) => this.addNewWord(e)} */}
//                     <Form.Group className="mb-3" controlId="word" onChange={this.handleChange}>
//                         <Form.Label>Word</Form.Label>
//                         <Form.Control type="text" placeholder="ਸ਼ਬਦ" required />
//                         <Form.Control.Feedback type="invalid">
//                         Please enter a word.
//                         </Form.Control.Feedback>
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="translation" onChange={this.handleChange}>
//                         <Form.Label>Translation</Form.Label>
//                         <Form.Control type="text" placeholder="Enter translation" required />
//                         <Form.Control.Feedback type="invalid">
//                         Please enter a translation.
//                         </Form.Control.Feedback>
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="meaning_punjabi" onChange={this.handleChange}>
//                         <Form.Label>Meaning (Punjabi)</Form.Label>
//                         <Form.Control type="text" placeholder="ਇੱਥੇ ਅਰਥ ਦਰਜ ਕਰੋ" />
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="meaning_english" onChange={this.handleChange}>
//                         <Form.Label>Meaning (English)</Form.Label>
//                         <Form.Control type="text" placeholder="Enter meaning" />
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="synonyms" onChange={this.handleChange}>
//                         <Form.Label>Synonyms</Form.Label>
//                         <Form.Control type="text" placeholder="ਸਮਾਨਾਰਥੀ ਸ਼ਬਦ 1, ਸਮਾਨਾਰਥੀ ਸ਼ਬਦ 2, ..." />
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="antonyms" onChange={this.handleChange}>
//                         <Form.Label>Antonyms</Form.Label>
//                         <Form.Control type="text" placeholder="ਵਿਰੋਧੀ ਸ਼ਬਦ 1, ਵਿਰੋਧੀ ਸ਼ਬਦ 2, ..." />
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="status" onChange={this.handleChange}>
//                         <Form.Label>Status</Form.Label>
//                         <Form.Select aria-label="Default select example">
//                         {Object.entries(status).map((ele, idx) => {
//                             const [key, value] = ele;
//                             return (
//                             <option key={key+value.toString()} value={key}>{value}</option>
//                             );
//                         })}
//                         </Form.Select>
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="images" onChange={this.handleChange}>
//                         <Form.Label>Images</Form.Label>
//                         <Form.Control type="text" placeholder="imgUrl1, imgUrl2, ..." />
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="sentences" onChange={this.handleChange}>
//                         <Form.Label style={{display: 'flex', width: '100%', justifyContent: 'space-between'}}>
//                         <p>Sentences</p>
//                         <button className="btn btn-sm" onClick={this.addNewSentence}>➕</button>
//                         <button className="btn btn-sm" onClick={this.removeAllSentences}>❌</button>
//                         </Form.Label>
//                         {this.state.sentences && this.state.sentences.length ? this.state.sentences.map((sentence, idx) => {
//                         return (
//                             <div key={idx} className="d-flex flex-column justify-content-between mb-3">
//                             <div className="d-flex justify-content-between">
//                                 <p>Sentence {idx+1}</p>
//                                 <button className="btn btn-sm" onClick={() => this.removeSentence(idx)}>🗑️</button>
//                             </div>
//                             <Form.Control id={`sentence${idx}`} className="m-1" type="text" placeholder="ਇੱਥੇ ਸ਼ਬਦ ਦਰਜ ਕਰੋ" onChange={(e) => this.changeSentence(e)} />
//                             <Form.Control id={`translation${idx}`} className="m-1" type="text" placeholder="Enter translation" onChange={(e) => this.changeSentence(e)} />
//                             </div>
//                         );
//                         }): null}
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="notes" onChange={this.handleChange}>
//                         <Form.Label>Notes</Form.Label>
//                         <Form.Control as="textarea" rows={3} placeholder="Enter notes" />
//                     </Form.Group>
//                     <Button variant="primary" type="submit">Submit</Button>
//                 </Form>
//             </div>
//         )
//     }
// }

// const mapDispatchToProps = (dispatch: any) => {
//     return {
//         createWord: (word: NewWordType) => dispatch(createWord(word))
//     }
// }

// export default connect(null, mapDispatchToProps)(CreateWord)