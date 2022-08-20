import './Form.css';

import React from 'react';

const Form = ({
  userName,
  repoName,
  onChange = () => { }
}) => {
  return <div className='form'>

    <label>Username</label>
    <input type="text" onChange={(event) => onChange("userName", event.target.value)} value={userName} />

    <label>Name repository</label>
    <input type="text" onChange={(event) => onChange("repoName", event.target.value)} value={repoName} />

  </div>
}

export default Form;