// @flow
import * as React from 'react'
import format from 'date-fns/format'

export type StateProps = {
    time: number
}

export type DispatchProps = {
    subscribe: *,
    unsubscribe: *
}

export type Props = StateProps & DispatchProps

export default function Time(props: Props): React.Node {
    const { time, subscribe, unsubscribe }: Props = props

    return (
        <div>
            <h3>{time ? format(time, 'H:mm:ss A') : 'What\'s the time?'}</h3>
            <button onClick={subscribe}>Subscribe</button>
            <button onClick={unsubscribe}>Unubscribe</button>
        </div>
    )
}
