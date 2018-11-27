// @flow
import * as React from 'react'

export type StateProps = {
    time: number
}

export type DispatchProps = {
    subscribe: *,
    unsubscribe: *
}

export type Props = StateProps & DispatchProps

function App(props: Props): React.Node {
    const { time, subscribe, unsubscribe }: Props = props

    return (
        <div>
            <h3>{time}</h3>
            <button onClick={subscribe}>Subscribe</button>
            <button onClick={unsubscribe}>Unubscribe</button>
        </div>
    )
}

export default App
