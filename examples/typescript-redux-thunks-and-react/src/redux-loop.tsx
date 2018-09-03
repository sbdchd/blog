import * as React from "react"
import { createStore, Dispatch } from "redux"
import { Provider, connect } from "react-redux"
import { install, loop, Cmd, Loop, StoreCreator } from "redux-loop"

import { http, IResponse } from "./http"

const ERROR_LOADING_USERS = "@@MYAPP/ERROR_LOADING_USERS"
const SET_USERS = "@@MYAPP/SET_USERS"
const INCR_POLLED_USERS = "@@MYAPP/INCR_POLLED_USERS"
const FETCH_USER = "@@MYAPP/FETCH_USER"

type IActions =
  | { type: typeof ERROR_LOADING_USERS }
  | { type: typeof FETCH_USER }
  | { type: typeof INCR_POLLED_USERS }
  | { type: typeof SET_USERS; users: Array<IUser> }

const setErrorLoadingUsers = (): IActions => ({
  type: ERROR_LOADING_USERS
})

const setUsers = (users: Array<IUser>): IActions => ({
  type: SET_USERS,
  users
})
const incrPolledUsers = (): IActions => ({
  type: INCR_POLLED_USERS
})

const fetchUser = (): IActions => ({
  type: FETCH_USER
})

function fetchingUsers(): Promise<IUser[]> {
  return http.get("/users").then((x: IResponse<IUser[]>) => x.data)
}

const pollingUsers = (dispatch: Dispatch<IActions>) => {
  http.get("/poll/users").then(() => {
    dispatch(incrPolledUsers())
  })
}

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

const reducer = (
  state: IState = defaultState,
  action: IActions
): IState | Loop<IState, IActions> => {
  switch (action.type) {
    case FETCH_USER:
      return loop(
        {
          ...state,
          isLoadingUsers: true
        },
        Cmd.run(fetchingUsers, {
          failActionCreator: setErrorLoadingUsers,
          successActionCreator: setUsers,
          args: [Cmd.dispatch]
        })
      )
    case ERROR_LOADING_USERS:
      return { ...state, isErrorLoadingUsers: true, isLoadingUsers: false }
    case SET_USERS:
      return loop(
        {
          ...state,
          ...action.users.reduce(
            (acc, user) => ({ ...acc, [user.id]: user }),
            {}
          ),
          allIds: action.users.map(x => x.id),
          isLoadingUsers: false,
          isErrorLoadingUsers: false
        },
        Cmd.run(pollingUsers, { args: [Cmd.dispatch] })
      )
    case INCR_POLLED_USERS:
      return {
        ...state,
        polledUsersCount: state.polledUsersCount + 1
      }
    default:
      return state
  }
}

const enhancedCreateStore = createStore as StoreCreator

const store = enhancedCreateStore(reducer, undefined, install())

// react-redux
const mapStateToProps = (state: IState) => ({
  isLoading: state.isLoadingUsers,
  isError: state.isErrorLoadingUsers,
  users: state.allIds.map(id => state[id])
})

const mapDispatchToProps = (dispatch: Dispatch<IActions>) => ({
  fetchData: () => dispatch(fetchUser())
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
