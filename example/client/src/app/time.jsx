import * as React from 'react'
import format from 'date-fns/format'

export default function Time(props) {
    const { time, subscribe, unsubscribe } = props

    return (
        <div>
            <h3>What is the time?</h3>
            <h3>{time ? format(time, 'H:mm:ss A') : '?'}</h3>
            <button onClick={subscribe}>Subscribe</button>
            <button onClick={unsubscribe}>Unubscribe</button>
        </div>
    )
}
