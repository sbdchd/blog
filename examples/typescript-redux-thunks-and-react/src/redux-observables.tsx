import * as React from "react"
import { createStore, Dispatch, applyMiddleware } from "redux"
import { Provider, connect } from "react-redux"
import { action } from "typesafe-actions"
import { mergeMap, map, catchError } from "rxjs/operators"
import {
  ofType,
  Epic,
  combineEpics,
  createEpicMiddleware
} from "redux-observable"
import { Observable, of } from "rxjs"

import { http, IResponse } from "./http"

const SET_USERS = "@@MYAPP/SET_USERS"
const INCR_POLLED_USERS = "@@MYAPP/INCR_POLLED_USERS"
const FETCH_USERS = "@@MYAPP/FETCH_USERS"
const POLL_USERS = "@@MYAPP/POLL_USERS"
const FETCH_USERS_ERROR = "@@MYAPP/FETCH_USERS_ERROR"

const setUsers = (users: Array<IUser>) => action(SET_USERS, users)
const incrPolledUsers = () => action(INCR_POLLED_USERS)
const fetchUsers = () => action(FETCH_USERS)
const pollUsers = () => action(POLL_USERS)
const fetchUsersError = () => action(FETCH_USERS_ERROR)

const pollingUsers: Observable<void> = new Observable(observer => {
  http
    .get("/poll/users")
    .then(() => {
      observer.next()
      observer.complete()
    })
    .catch(() => {
      observer.error()
      observer.complete()
    })
})

const getUsers: Observable<IUser[]> = new Observable(observer => {
  http
    .get("/users")
    .then((res: IResponse<IUser[]>) => res.data)
    .then(data => {
      observer.next(data)
      observer.complete()
    })
    .catch(() => observer.error())
})

const pollUsersEpic: Epic<IActions> = action$ =>
  action$.pipe(
    ofType(POLL_USERS),
    mergeMap(() => pollingUsers.pipe(map(() => incrPolledUsers())))
  )

const fetchUsersEpic: Epic<IActions> = action$ =>
  action$.pipe(
    ofType(FETCH_USERS),
    mergeMap(() =>
      getUsers.pipe(
        mergeMap(data => [setUsers(data), pollUsers()]),
        catchError(() => of(fetchUsersError()))
      )
    )
  )

const rootEpic = combineEpics(fetchUsersEpic, pollUsersEpic)

type IActions =
  | ReturnType<typeof setUsers>
  | ReturnType<typeof incrPolledUsers>
  | ReturnType<typeof fetchUsers>
  | ReturnType<typeof pollUsers>
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
    case FETCH_USERS_ERROR:
      return {
        ...state,
        isLoadingUsers: false,
        isErrorLoadingUsers: true
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

const epicMiddleware = createEpicMiddleware()
const store = createStore(reducer, applyMiddleware(epicMiddleware))

epicMiddleware.run(rootEpic)

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
