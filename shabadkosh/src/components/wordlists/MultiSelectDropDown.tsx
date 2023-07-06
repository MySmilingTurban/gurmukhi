import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

const MultiSelectDropdown = (options : any[]) => {
  const [selectedOptions, setSelectedOptions] = useState([] as any[]);
  const [isOpen, setIsOpen] = useState(false);

//   const options = [
//     { id: 1, label: 'Option 1' },
//     { id: 2, label: 'Option 2' },
//     { id: 3, label: 'Option 3' },
//     { id: 4, label: 'Option 4' },
//     { id: 5, label: 'Option 5' }
//   ] as any[];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionChange = (event: any) => {
    const optionId = parseInt(event.target.value);
    const isChecked = event.target.checked;

    if (isChecked) {
      setSelectedOptions([...selectedOptions, optionId]);
    } else {
      setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
    }
  };

  return (
    <div className={`dropdown ${isOpen ? 'show' : ''}`}>
      <button
        style={{width:"20%"}}
        className="btn btn-secondary dropdown-toggle"
        type="button"
        id="multiSelectDropdown"
        onClick={toggleDropdown}
      >
        Select Options
      </button>
      <div style={{width:"20%"}} className={`dropdown-menu ${isOpen ? 'show' : ''}`} aria-labelledby="multiSelectDropdown">
        {options.map((option) => (
          <Form.Check
          style={{marginLeft:"10%"}}
            key={option.id}
            type="checkbox"
            id={`option_${option.id}`}
            label={option.label}
            checked={selectedOptions.includes(option.id)}
            onChange={handleOptionChange}
            value={option.id}
          />
        ))}
      </div>
      {JSON.stringify(selectedOptions)}
    </div>
  );
};

export default MultiSelectDropdown;