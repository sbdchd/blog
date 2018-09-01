import * as React from "react"
import * as ReactDOM from "react-dom"

import ReduxThunk from "./redux-thunk"
import NoThunks from "./no-thunks"
import ReduxLoop from "./redux-loop"
import ReduxSagas from "./redux-sagas"
import ReduxObservables from "./redux-observables"

enum Selected {
  NO_THUNKS = "No Thunks",
  REDUX_THUNK = "Redux Thunk",
  REDUX_LOOP = "Redux Loop",
  REDUX_SAGAS = "Redux Sagas",
  REDUX_OBSERVABLES = "Redux Observables"
}

interface IAppProps {
  selected: Selected
}
function App({ selected }: IAppProps) {
  const s = Selected
  switch (selected) {
    case s.REDUX_THUNK:
      return <ReduxThunk />
    case s.REDUX_LOOP:
      return <ReduxLoop />
    case s.REDUX_SAGAS:
      return <ReduxSagas />
    case s.REDUX_OBSERVABLES:
      return <ReduxObservables />
    case s.NO_THUNKS:
    default:
      return <NoThunks />
  }
}

interface IAppPickerState {
  selected: Selected
}

class AppPicker extends React.Component<{}, IAppPickerState> {
  state = {
    selected: Selected.NO_THUNKS
  }

  render() {
    const s = Selected
    return (
      <main>
        <nav>
          {Object.values(s).map((v: Selected) => (
            <button key={v} onClick={() => this.setState({ selected: v })}>
              {v}
            </button>
          ))}
        </nav>
        <h1>{this.state.selected}</h1>
        <App selected={this.state.selected} />
      </main>
    )
  }
}

ReactDOM.render(<AppPicker />, document.getElementById("root") as HTMLElement)
