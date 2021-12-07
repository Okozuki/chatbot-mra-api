import * as React from 'react'

import MainPage from './MainPage'

interface IAppState {
  storeHydrated: boolean
}


class App extends React.Component<{}, IAppState> {
  constructor(props: any) {
    super(props)
    this.state = {
      storeHydrated: true // used for future indication if store is hydrated
    }

  }

  // public componentDidMount() {}

  public render() {
    const { storeHydrated } = this.state
    if (storeHydrated) {
      return <MainPage />
    }
    return null
  }
}

export default App



// WEBPACK FOOTER //
// ./src/App.tsx