import * as React from "react"
import { createStore, applyMiddleware, Dispatch } from "redux"
import { Provider, connect } from "react-redux"
import { action } from "typesafe-actions"
import createSagaMiddleware from "redux-saga"
import { put, call, takeLatest, all } from "redux-saga/effects"

import { http, IResponse } from "./http"

const SET_USERS = "@@MYAPP/SET_USERS"
const INCR_POLLED_USERS = "@@MYAPP/INCR_POLLED_USERS"
const FETCH_USERS = "@@MYAPP/FETCH_USERS"
const FETCH_USERS_ERROR = "@@MYAPP/FETCH_USERS_ERROR"

const setUsers = (users: Array<IUser>) => action(SET_USERS, users)
const incrPolledUsers = () => action(INCR_POLLED_USERS)
const fetchUsers = () => action(FETCH_USERS)
const fetchUsersError = () => action(FETCH_USERS_ERROR)

// sagas
function* fetchingUsers() {
  try {
    // tslint:disable-next-line no-unsafe-any
    const res: IResponse<IUser[]> = yield http.get("/users")
    yield put(setUsers(res.data))
    yield call(pollingUsers)
  } catch (e) {
    yield put(fetchUsersError())
  }
}

function* watchFetchData() {
  yield takeLatest(FETCH_USERS, fetchingUsers)
}

function* rootSaga() {
  yield all([watchFetchData()])
}

const pollingUsers = () => {
  http.get("/poll/users").then(() => {
    store.dispatch(incrPolledUsers())
  })
}

type IActions =
  | ReturnType<typeof setUsers>
  | ReturnType<typeof incrPolledUsers>
  | ReturnType<typeof fetchUsers>
  | ReturnType<typeof fetchUsersError>

// reducer
interface IUser {
  id: number
  email: string
  createdOn: string
}

interface IState {
  readonly isLoadingUsers: boolean
  readonly isErrorLoadingUsers: boolean
  readonly polledUsersCount: number
  readonly allIds: Array<number>
  readonly [key: number]: IUser
}

const defaultState = {
  isLoadingUsers: false,
  isErrorLoadingUsers: false,
  allIds: [],
  polledUsersCount: 0
}

const reducer = (state: IState = defaultState, action: IActions) => {
  switch (action.type) {
    case FETCH_USERS:
      return { ...state, isLoadingUsers: true, isErrorLoadingUsers: false }
    case SET_USERS:
      return {
        ...state,
        ...action.payload.reduce(
          (acc, user) => ({ ...acc, [user.id]: user }),
          {}
        ),
        allIds: action.payload.map(x => x.id),
        isLoadingUsers: false,
        isErrorLoadingUsers: false
      }
    case INCR_POLLED_USERS:
      return {
        ...state,
        polledUsersCount: state.polledUsersCount + 1
      }
    default:
      return state
  }
}

const sagaMiddleware = createSagaMiddleware()

const store = createStore(reducer, applyMiddleware(sagaMiddleware))

sagaMiddleware.run(rootSaga)

// react-redux
const mapStateToProps = (state: IState) => ({
  isLoading: state.isLoadingUsers,
  isError: state.isErrorLoadingUsers,
  users: state.allIds.map(id => state[id])
})

const mapDispatchToProps = (dispatch: Dispatch<IActions>) => ({
  fetchData: () => dispatch(fetchUsers())
})

interface IUserListProps {
  users: Array<IUser>
  isLoading: boolean
  isError: boolean
  fetchData(): void
}

class UserList extends React.Component<IUserListProps> {
  componentWillMount() {
    this.props.fetchData()
  }
  render() {
    const { isLoading, isError, users } = this.props
    if (isLoading) {
      return <p>loading...</p>
    }
    if (isError) {
      return <p>error: please try again</p>
    }
    if (users.length < 1) {
      return <p>No Users found.</p>
    }
    return (
      <ul>
        {users.map(x => (
          <li key={x.id}>{x.email}</li>
        ))}
      </ul>
    )
  }
}

const UserListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserList)

export default () => (
  <Provider store={store}>
    <UserListContainer />
  </Provider>
)
