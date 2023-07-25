import React, { useState } from 'react'
import { MiniWord, Option } from '../types';
import { Form } from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';

interface IProps {
  id: string;
  name: string;
  myVar: Option[];
  setMyVar: (id: string, option: any) => void;
  words: MiniWord[];
  placeholder: string;
}

export const Options = ({id, name, myVar, setMyVar, words, placeholder} : IProps) => {
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
            option: gurmukhi,
            translation: english,
            label: gurmukhi + ` (${english.toLowerCase()})`
          } as any

          const duplicate = (myVar as Option[]).find(
            (obj) => obj.option === d.option
          )

          const alreadyInWords = (words as MiniWord[]).find(
            (obj) => obj.word === d.option
          )

          if (!duplicate) {
            if (!alreadyInWords) {
              setMyVar(id, [...myVar, d])
            } else {
              alert(`${d.option} already exists, choose it from the dropdown`)
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

    const onChange = (selectedList: [], item: any) => {
      const newOpt = {
        id: item.id,
        option: item.word ?? item.option,
        translation: item.translation,
        label: `${item.word ?? item.option} (${item.translation.toLowerCase()})`
      }
      const updatedOptions = selectedList.map((val: Option) => {
        if (val.id === item.id) {
          return newOpt
        } else {
          return val
        }
      })
      console.log('selected: ', updatedOptions, '\t newOpt: ', newOpt)
      setMyVar(id, updatedOptions)
    }

    return (
        <div>
          <Form.Label>{name}</Form.Label>
          <button className='btn btn-sm' onClick={(e) => setSyn(e)}>{'✍🏼'}</button>
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
            <div>Option: <Form.Control type='text' placeholder={placeholder} pattern='[\u0A00-\u0A76,.। ]+' value={val} onChange={(e) => setVal(e.target.value)}/></div>
            <div>Translation: <Form.Control type='text' placeholder='Enter translation' pattern='[a-zA-Z0-9,. ]+' value={translation}  onChange={(e) => setTranslation(e.target.value)} /></div>
            <div>
              <button className='btn btn-sm fs-5 me-2' style={{ padding: 0 }} onClick={(e) => addNew(e, `${val}:${translation}`)}>✅</button>
              <button className='btn btn-sm fs-5 ms-2' style={{ padding: 0 }} onClick={(e) => remWord(e)}>❌</button>
            </div>
          </div>
        </div>
    )
}
