import './App.css';

import axios from "axios";
import { orderBy } from "lodash";
import { useEffect, useReducer, useState } from "react";

import Form from './components/Form';
import RacingBarChart from "./components/RacingBarChart";
// import RacingBarChart from "./components/RacingChart";
import useInterval from './useInterval';

const PAGE_SIZE = 100;
const MAX_ITERATIONS = 1;
const NUM_USERS_TO_SHOW = 5;

const initialData = [
];


const initialState = {
  userName: "geosolutions-it",
  repoName: "MapStore2",
  data: initialData,
  commits: [],
  commitsLoaded: false
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
const setCommits = (commits) => ({
  type: SET_COMMITS,
  commits
})
const COMMITS_LOADED = "COMMITS_LOADED";
const commitsLoaded = () => ({
  type: COMMITS_LOADED
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
    case COMMITS_LOADED:
      return {
        ...state,
        commitsLoaded: true
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
              date: commitObj.commit.committer.date.split("T")[0],
              name: commitObj?.author?.login ||
                commitObj?.committer?.login || commitObj.commit.committer.name,
              dateObj: {
                originalDate: commitObj.commit.committer.date,
                day: new Date(commitObj.commit.committer.date).getDate(),
                month: new Date(commitObj.commit.committer.date).getMonth() + 1,
                year: new Date(commitObj.commit.committer.date).getFullYear()
              },
              value: 1,
              sha: commitObj.sha,
            }
          });

          console.log("commits page: " + page, commits)
          dispatch(setCommits(commits));

          if (response.data.length === 100 && page < MAX_ITERATIONS) {
            getCommits(page + 1, userName, repoName, dispatch);
          } else {
            dispatch(commitsLoaded());
          }
        } catch (e) {
          console.error(e)
        }
      }
    })
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [play, setPlay] = useState(false);
  const [indexDay, setIndexDay] = useState(0);
  const [orderedData, setOrderedData] = useState([]);
  const fetchCommits = () => {
    getCommits(1, state.userName, state.repoName, dispatch);
  }
  useEffect(() => {
    if (state.commitsLoaded) {
      let globalCommits = {};
      const commitsPerUser = state.commits.reduce((prev, current) => {
        globalCommits = {
          ...globalCommits,
          [current.name]: {
            value: (globalCommits[current.name]?.value || 0) + current.value,
            color: globalCommits[current.name]?.color || '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
          }
        }
        return {
          ...prev,
          [current.date]: globalCommits
        }
      }, {});
      console.log("commits organized per day", commitsPerUser);

      const bestSelection = Object.keys(commitsPerUser).reduce((prev, current) => {
        const dataPerUser = commitsPerUser[current];
        const dataPerUserArray = Object.keys(dataPerUser).map(username => {
          return { name: username, value: dataPerUser[username].value, color: dataPerUser[username].color };
        });
        const users = orderBy(dataPerUserArray, 'value', 'desc');
        const usersFiltered = users.filter((_, i) => (i < NUM_USERS_TO_SHOW));
        return {
          ...prev,
          [current]: usersFiltered
        }

      }, {})
      console.log("top 5 users's commits", bestSelection);

      setOrderedData(bestSelection);

    }
  }, [state.commitsLoaded, state.commits]);
  useInterval(() => {
    if (play) {
      const dataKeys = Object.keys(orderedData);
      if (orderedData[dataKeys[indexDay]]) {
        dispatch(setData(orderedData[dataKeys[indexDay]]))
        setIndexDay(indexDay + 1);
      }
    }
  }, 500);
  return (
    <div className="App">
      <header className="App-header">
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
        {state.commitsLoaded ? <div>Commits loaded</div> : "The race can start when all commits from the repo have been fetched"}
        <div className='buttons'>
          <button onClick={() => {
            dispatch(setLoading(true))
            fetchCommits()
          }}>
            Fetch github commits data
          </button>
          <button
            disabled={!state.commitsLoaded}
            onClick={() => {
              setPlay(!play)
            }}>
            {play ? "Stop" : "Play"}
          </button>
        </div>
      </header>

      <div className='chart'>
        <RacingBarChart data={state.data} />
      </div>
    </div>
  );
}

export default App;
