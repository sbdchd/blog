import * as React from "react"
import { createStore } from "redux"
import { Provider, connect } from "react-redux"
import { action } from "typesafe-actions"

import { http, IResponse } from "./http"

const SET_LOADING_USERS = "@@MYAPP/SET_LOADING_USERS"
const SET_ERROR_LOADING_USERS = "@@MYAPP/SET_ERROR_LOADING_USERS"
const SET_USERS = "@@MYAPP/SET_USERS"
const INCR_POLLED_USERS = "@@MYAPP/INCR_POLLED_USERS"

const setLoadingUsers = (loading: boolean) => action(SET_LOADING_USERS, loading)
const setErrorLoadingUsers = (error: boolean) =>
  action(SET_ERROR_LOADING_USERS, error)
const setUsers = (users: Array<IUser>) => action(SET_USERS, users)
const incrPolledUsers = () => action(INCR_POLLED_USERS)

const fetchingUsers = () => {
  store.dispatch(setLoadingUsers(true))
  store.dispatch(setErrorLoadingUsers(false))
  http
    .get("/users")
    .then((res: IResponse<IUser[]>) => {
      store.dispatch(setUsers(res.data))
      pollingUsers()
    })
    .catch(() => {
      store.dispatch(setErrorLoadingUsers(true))
      store.dispatch(setLoadingUsers(false))
    })
}

const pollingUsers = () => {
  http.get("/poll/users").then(() => {
    store.dispatch(incrPolledUsers())
  })
}

type IActions =
  | ReturnType<typeof setLoadingUsers>
  | ReturnType<typeof setErrorLoadingUsers>
  | ReturnType<typeof setUsers>
  | ReturnType<typeof incrPolledUsers>

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
    case SET_LOADING_USERS:
      return { ...state, isLoadingUsers: action.payload }
    case SET_ERROR_LOADING_USERS:
      return { ...state, isErrorLoadingUsers: action.payload }
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

const store = createStore(reducer)

// react-redux
const mapStateToProps = (state: IState) => ({
  isLoading: state.isLoadingUsers,
  isError: state.isErrorLoadingUsers,
  users: state.allIds.map(id => state[id])
})

const mapDispatchToProps = () => ({
  fetchData: () => fetchingUsers()
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
