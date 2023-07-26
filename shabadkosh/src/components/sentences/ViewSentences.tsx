// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useEffect, useState } from 'react';
// import { Card, Button, Container, Row, Badge, ListGroup, ButtonGroup, Form } from 'react-bootstrap';
// import { deleteQuestionByWordId, deleteSentenceByWordId, deleteWord, removeWordFromSupport, removeWordFromWordlists, sentencesCollection, wordsCollection } from '../util/controller';
// import { DocumentData, QuerySnapshot, doc, onSnapshot } from 'firebase/firestore';
// import { NewWordType, Status } from '../../types/word';
// import { firestore } from '../../firebase';
// import { useUserAuth } from '../UserAuthContext';
// import { astatus, cstatus, rstatus } from '../constants';
// import { useNavigate } from 'react-router-dom';
// import { convertTimestampToDateString, convertTimestampToDate } from '../util/utils';
// import { NewSentenceType } from '../../types';

// function ViewSentences() {
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [query, setQuery] = useState('');
//   const [filter, setFilter] = useState('');
//   const [status, setStatus] = useState('all');
//   const [listView, setListView] = useState<boolean>(false);
//   const [sentences, setSentences] = useState<NewSentenceType[]>([]);
//   const [filteredSentences, setFilteredSentences] = useState<NewSentenceType[]>([]);
//   const {user} = useUserAuth();
//   const navigate = useNavigate();

//   let statusList = {} as Status;
//   if (user.role === 'admin') {
//     statusList = astatus
//   } else if (user.role === 'reviewer') {
//     statusList = rstatus
//   } else if (user.role === 'creator') {
//     statusList = cstatus
//   }

//   const handleSearch = async (event: any) => {
//     event.preventDefault();
//     console.log('query', query);
//   };

//   useEffect(() => {
//     let localSentences = sentences;
//     if (query.match('[\u0A00-\u0A76,.]+')) {
//       localSentences = sentences.filter((sentence) => sentence.sentence?.includes(query));
//     } else if (query.match('[a-zA-Z ]+')) {
//       localSentences = sentences.filter((sentence) => sentence.translation?.toLowerCase().includes(query));
//     } else {
//       console.log(query);
//     }
//     handleFilter(filter, status, localSentences);

//   }, [query, filter, status]);

//   useEffect(() => {
//     setIsLoading(true);
//     onSnapshot(sentencesCollection, (snapshot:
//       QuerySnapshot<DocumentData>) => {
//       const data = snapshot.docs.map((doc) => {
//           return {
//             id: doc.id,
//             created_at: doc.data().created_at,
//             updated_at: doc.data().updated_at,
//             created_by: doc.data().created_by,
//             updated_by: doc.data().updated_by,
//             ...doc.data(),
//           };
//         });
//       setSentences(data);
//       setFilteredSentences(data);
//     });

//     setIsLoading(false);
//   }, []);

// //   const sortSentences = (unwords: NewSentenceType[]) => {
// //     const sortedWords = unwords.sort(
// //       (p1, p2) => (p1.updated_at < p2.updated_at) ? 1 : (p1.updated_at > p2.updated_at) ? -1 : 0);

// //     // filter words by user role
// //     // if (user?.role === 'creator') {
// //     //   sortedWords = sortedWords.filter((word) => ['creating-english', 'creating-punjabi', 'creating', 'feedback-english', 'feedback-punjabi'].includes(word.status ?? ''));
// //     // } else if (user?.role === 'reviewer') {
// //     //   sortedWords = sortedWords.filter((word) => ['reviewing', 'created'].includes(word.status ?? ''));
// //     // } else if (user?.role === 'admin') {
// //     //   // no change, admin can view all
// //     // } else {
// //     //   sortedWords = sortedWords.filter((word) => ['...'].includes(word.status ?? ''));
// //     // }
// //     // console.log('Sorted words: ', sortedWords);
// //     return sortedWords;
// //   }

//   const delSentence = (word: any) => {
//     // add code to remove word_id from its respective wordlist
//     const response = confirm(`Are you sure you want to delete this word: ${word.word}? \n This action is not reversible.`);
//     if (response) {
//       const getWord = doc(firestore, `words/${word.id}`);
//       removeWordFromSupport(word.id).then(() => {
//         removeWordFromWordlists(word.id).then(() => {
//           deleteWord(getWord).then(() => {
//             deleteSentenceByWordId(word.id).then(() => {
//               deleteQuestionByWordId(word.id).then(() => {
//                 alert('Word deleted!');
//                 setIsLoading(false)
//                 navigate('/words');
//               })
//             })
//           })
//         })
//       })
//     } else {
//       console.log('Operation abort!');
//     }
//   }

// //   const handleFilter = (filterVal = filter, statusVal = status, filterList = sentences) => {
// //     if (filterVal === 'created_by_me') {
// //       filterList = filterList.filter((val) => val.created_by === user.email)
// //     } else if (filterVal === 'am_working_on') {
// //       filterList = filterList.filter((val) => (val.created_by === user.email || val.updated_by === user.email))
// //     } else if (filterVal === 'updated_by_me') {
// //       filterList = filterList.filter((val) => val.updated_by === user.email)
// //     }

// //     setFilteredSentences(sortSentences(filterList));
// //   }

//   const sentencesData = sortSentences(filteredSentences) && sortSentences(filteredSentences).length ? 
//     sortSentences(filteredSentences)?.map((sentence) => {
//       const detailUrl = `/sentences/${sentence.id}`;
//       const editUrl = `/sentences/edit/${sentence.id}`;
//         return (
//             <ListGroup.Item
//             key={sentence.id}
//             className='d-flex justify-content-between align-items-center'
//             style={{width: '80%'}}
//             >
//             <div className='ms-2 me-auto'>
//                 <h3 className='fw-bold'>{sentence.sentence}</h3>
//                 <p>{sentence.translation}</p>
//             </div>
//             <div className='d-flex flex-column align-items-end'>
//                 <ButtonGroup>
//                 <Button href={detailUrl} style={{backgroundColor: 'transparent', border: 'transparent'}}>👁️</Button>
//                 {['admin', 'reviewer', 'creator'].includes(user.role) ? <Button href={editUrl} style={{backgroundColor: 'transparent', border: 'transparent'}}>🖊️</Button> : null }
//                 {user?.role === 'admin' ? <Button onClick={() => delSentence(sentence)} style={{backgroundColor: 'transparent', border: 'transparent'}}>🗑️</Button> : null}
//                 </ButtonGroup>
//             </div>
//             </ListGroup.Item>
//         )
//     })
//     : 
//     <Card><Card.Body><h3>No sentences {user?.role == 'reviewer' ? 'to review!' : 'found!'}</h3></Card.Body></Card>;

//   if (sentences.length === 0 || isLoading) return <h2>Loading...</h2>;
//   return (
//     <div className='container mt-2'>
//       <div className='d-flex justify-content-between align-items-center'>
//         <h2>Words</h2>
//         <Button href='/words/new'>Add new</Button>
//       </div>
//       <Button onClick={() => setListView(!listView)} className='button' variant='primary'>{listView ? 'Card View' : 'List View'}</Button>
//       <Form className='d-flex align-items-center' style={{width: '100%'}} onSubmit={handleSearch}>
//         <Form.Group controlId='formBasicSearch' style={{width: '70%'}}>
//           <Form.Label>Search</Form.Label>
//           <Form.Control
//             type='text'
//             placeholder='Enter search term'
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//           />
//         </Form.Group>

//         <div className='d-flex align-items-center'>
//           <Form.Group controlId='filter' onChange={(e: any) => setFilter(e.target.value ?? '')} defaultValue={filter}>
//             <Form.Label>Filter</Form.Label>
//             <Form.Select>
//               <option key={'all'} value={'all'}>Show All</option>
//               <option key={'cbyme'} value={'created_by_me'}>Created by me</option>
//               <option key={'amwon'} value={'am_working_on'}>I&apos;m working on</option>
//               <option key={'lupme'} value={'updated_by_me'}>Last updated by me</option>
//               <option key={'synant'} value={'syn_or_ant'}>Synonyms/Antonyms</option>
//             </Form.Select>
//           </Form.Group>

//           <Form.Group controlId='status' onChange={(e: any) => setStatus(e.target.value ?? '')}>
//             <Form.Label>Status</Form.Label>
//             <Form.Select defaultValue={status}>
//               <option key={'all'} value={'all'}>Show All</option>
//               {Object.keys(statusList).length > 0 && Object.keys(statusList).map((ele) => {
//                 const val = statusList[ele]
//                 return (
//                   <option key={ele} value={ele}>{val.charAt(0).toUpperCase() + val.slice(1)}</option>
//                   );
//               })}
//             </Form.Select>
//           </Form.Group>
//         </div>

//       </Form>
//         {filteredSentences && filteredSentences.length ? (
//           <div className='d-flex ms-2 justify-content-evenly'>
//           <Container className='p-4'>
//             <ListGroup className='d-flex align-items-center'>{sentencesData}</ListGroup>
//           </Container>
//         </div>
//         ) : (
//           <h2 className='no-words'>There are no sentences. Please add one.</h2>
//         )}
//   </div>
// );
// }


// export default ViewSentences;
