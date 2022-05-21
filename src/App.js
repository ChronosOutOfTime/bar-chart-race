import './App.css';

import axios from "axios";
import { useEffect, useReducer } from "react";

import Form from './components/Form';
import RacingBarChart from "./components/RacingBarChart";
import logo from './logo.svg';

const initialState = { count: 0 };

const SET_USERNAME = "SET_USERNAME";
const setUserName = (value) => ({
  type: SET_USERNAME,
  value
})
const SET_REPO_NAME = "SET_REPO_NAME";
const setRepoName = (value) => ({
  type: SET_REPO_NAME,
  value
})
const SET_LOADING = "SET_LOADING";
const setLoading = (value) => ({
  type: SET_LOADING,
  value
})
const SET_DATA = "SET_DATA";
const setData = (value) => ({
  type: SET_DATA,
  value
})

function reducer(state, action) {
  switch (action.type) {
    case SET_USERNAME: {
      return {
        ...state,
        userName: action.value
      };
    }
    case SET_REPO_NAME:
      return {
        ...state,
        repoName: action.value
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.value
      };
    case SET_DATA:
      return {
        ...state,
        data: action.data
      };
    default:
      throw new Error();
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    if (state.loading) {
      axios
        .get(`https://api.github.com/repos/${state.userName}/${state.repoName}/commits?per_page=1000`)
        .then(response => {
          console.log("commits ", response.data);
          const commits = response.data.map((commitObj) => {
            return {
              name: commitObj.committer.login,
              value: 1,
              date: commitObj.commit.committer.date,
            }
          });
          console.log("commits parsed ", commits);
          dispatch(setData(commits));
          dispatch(setLoading(false));

        })
    }
  }, [state.loading, state.userName, state.repoName]);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Form
          state={state}
          onChange={(prop, value) => {
            switch (prop) {
              case "userName": {
                dispatch(setUserName(value))
                break;
              }
              case "repoName": {
                dispatch(setRepoName(value))
                break;
              }
              default: return;
            }
          }}
        />
        <div className='buttons'>
          <button onClick={() => {
            dispatch(setLoading(true))
          }}>
            Fetch github commits data
          </button>
          <div>
            here goes the chart
            <RacingBarChart data={state.data} />
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
