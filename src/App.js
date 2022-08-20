import './App.css';

import axios from "axios";
import { useEffect, useReducer, useState } from "react";

import Form from './components/Form';
import RacingBarChart from "./components/RacingBarChart";
// import RacingBarChart from "./components/RacingChart";
import logo from './logo.svg';
import useInterval from './useInterval';

const PAGE_SIZE = 100;
const PAGE_NUM = 44;
const getRandomIndex = array => {
  return Math.floor(array.length * Math.random());
};

const initialData = [
  {
    name: "alpha",
    value: 10,
    color: "#f4efd3"
  },
  {
    name: "beta",
    value: 15,
    color: "#cccccc"
  },
];

const extraData = [
  {
    name: "charlie",
    value: 10,
    color: "#f4efd3"
  }
]

const initialState = {
  userName: "d3",
  repoName: "d3",
  data: initialData,
  commits: []
};

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
const setData = (data) => ({
  type: SET_DATA,
  data
})
const SET_COMMITS = "SET_COMMITS";
const setCommits = (data) => ({
  type: SET_COMMITS,
  data
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
    case SET_COMMITS:
      return {
        ...state,
        commits: state.commits.concat(action.commits)
      };
    default:
      return state;
  }
}

const getCommits = (page, userName, repoName, dispatch) => {
  axios
    .get(`https://api.github.com/repos/${userName}/${repoName}/commits?per_page=${PAGE_SIZE}&page=${page}`, {
      headers: {
        "Authorization": "token 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"
      }
    })
    .then(response => {
      if (response.data.length) {
        try {
          const commits = response.data.reverse().map((commitObj) => {
            return {
              name: commitObj?.committer?.login || commitObj.commit.committer.name,
              value: 1,
              date: commitObj.commit.committer.date,
              sha: commitObj.sha,
            }
          });

          console.log("commits page: " + page, commits)
          dispatch(setCommits(commits));
        } catch (e) {
          console.error(e)
        }
        if (page < 8) {

          getCommits(page + 1, userName, repoName, dispatch)
        }
      }
    })
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [play, setPlay] = useState(false);
  /* useEffect(() => {
    if (state.loading) {
      axios
        .get(`https://api.github.com/repos/${state.userName}/${state.repoName}/commits?per_page=${PAGE_SIZE}&page=${PAGE_NUM}`)
        .then(response => {
          console.log("commits ", response.data);
          const counters = {

          };
          const commits = response.data.reverse().map((commitObj) => {
            counters[commitObj.committer.login] = (counters[commitObj.committer.login] || 0) + 1;
            return {
              name: commitObj.committer.login,
              value: counters[commitObj.committer.login],
              date: commitObj.commit.committer.date,
            }
          });
          console.log("commits parsed ", commits);
          dispatch(setData(commits));
          dispatch(setLoading(false));

        })
    }
  }, [state.loading, state.userName, state.repoName]);*/

  /*useInterval(() => {
    const randomIndex = getRandomIndex(state.data);
    if (play) {
      //   dispatch(setData(
      //     state.data.map((entry, index) =>
      //       index === randomIndex
      //         ? {
      //           ...entry,
      //           value: entry.value + 10
      //         }
      //         : entry
      //     )
      //   ));
      // 
    }
  }, 5000);*/
  const fetchCommits = () => {
    getCommits(0, state.userName, state.repoName, dispatch);
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Form
          repoName={state.repoName}
          userName={state.userName}
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
            fetchCommits()
          }}>
            Fetch github commits data
          </button>
          <button onClick={() => {
            setPlay(!play)
          }}>
            {play ? "Stop" : "Play"}
          </button>
          <button onClick={() => {
            dispatch(setData(state.data.concat(extraData)))
          }}>
            Add one data
          </button>
          <div>
            <RacingBarChart data={state.data} />
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
