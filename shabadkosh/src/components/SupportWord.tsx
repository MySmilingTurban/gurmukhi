import React, { useState } from 'react'
import { Dispatch, SetStateAction } from 'react';
import { MiniWord, NewSentenceType } from '../types';
import { Form } from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';

interface IProps {
  id: string;
  name: string;
  myVar: MiniWord[] | NewSentenceType[];
  setMyVar: Dispatch<SetStateAction<any[]>>;
  words: MiniWord[] | NewSentenceType[];
  type: string;
  placeholder: string;
}

export const SupportWord = ({id, name, myVar, setMyVar, words, type, placeholder} : IProps) => {
    const [view, setView] = useState(false)
    const [val, setVal] = useState<string>('')
    const [translation, setTranslation] = useState<string>('')

    const setSyn = (e: any) => {
      e.preventDefault()
      setView(!view)
    }

    const addNew = (e: any, option: string) => {
      e.preventDefault()
      if (option.includes(':')) {
        const [gurmukhi, english] = option.split(':').map((val) => val.trim())
        if (gurmukhi.match('[\u0A00-\u0A76,. ]+') && english.match('[a-zA-Z0-9,. ]+')) {
          const d = {
            value: gurmukhi,
            translation: english,
            label: gurmukhi + ` - ${english.toLowerCase()}` 
          } as any
          let duplicate;
          let alreadyInWords;

          if (type === 'sentence') {
            d['sentence'] = gurmukhi

            duplicate = (myVar as NewSentenceType[]).find(
              (obj) => obj.sentence === d.sentence
            )
            alreadyInWords = (words as NewSentenceType[]).find(
              (obj) => obj.sentence === d.sentence
            )
          } else {
            d['word'] = gurmukhi

            duplicate = (myVar as MiniWord[]).find(
              (obj) => obj.word === d.word
            )
            alreadyInWords = (words as MiniWord[]).find(
              (obj) => obj.word === d.word
            )
          }

          if (!duplicate) {
            if (!alreadyInWords) {
              setMyVar((prev) => [...prev, d])
            } else {
              alert(`${type} ${d.value} already exists, choose it from the dropdown`)
            }
          }

          setVal('')
          setTranslation('')
        } else {
          console.log('Invalid value: ', option)
        }
      }
    }

    const remWord = (e: any) => {
      e.preventDefault()
      setVal('')
      setTranslation('')
    }

    const onChange = (selectedList: []) => {
      setMyVar(selectedList)
    }

    return (
        <div>
          <Form.Label>{name}</Form.Label>
          <button className='btn btn-sm' onClick={(e) => setSyn(e)}>{view ? '➖' : '➕'}</button>
          <Multiselect 
            id={id}
            options={words}
            displayValue="label"
            showCheckbox={true}
            selectedValues={myVar}
            onSelect={onChange}
            onRemove={onChange}
          />
          <br />
          <div className='justify-content-around' style={{ display: view ? 'flex' : 'none' }}>
            <div>{['synonyms', 'antonyms'].includes(type) ? 'Word' : type.charAt(0).toUpperCase() + type.slice(1)}: <Form.Control type='text' placeholder={placeholder} pattern='[\u0A00-\u0A76 ]+' value={val} onChange={(e) => setVal(e.target.value)}/></div>
            <div>Translation: <Form.Control type='text' placeholder='Enter translation' pattern='[a-zA-Z0-9,. ]+' value={translation}  onChange={(e) => setTranslation(e.target.value)} /></div>
            <div>
              <button className='btn btn-sm fs-5 me-2' style={{ padding: 0 }} onClick={(e) => addNew(e, `${val}:${translation}`)}>✅</button>
              <button className='btn btn-sm fs-5 ms-2' style={{ padding: 0 }} onClick={(e) => remWord(e)}>❌</button>
            </div>
          </div>
        </div>
    )
}
