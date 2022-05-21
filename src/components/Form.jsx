import './Form.css';

import React from 'react';

const Form = ({
  onChange = () => { }
}) => {
  return <div className='form'>

    <label>Username</label>
    <input type="text" onChange={(event) => onChange("userName", event.target.value)} />

    <label>Name repository</label>
    <input type="text" onChange={(event) => onChange("repoName", event.target.value)} />

  </div>
}

export default Form;