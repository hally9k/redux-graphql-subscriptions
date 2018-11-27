// @flow
import * as React from 'react'

export type StateProps = {
    color: string
}

export type DispatchProps = {
    subscribe: *,
    unsubscribe: *
}

export type Props = StateProps & DispatchProps

const root = document.querySelector(':root')

export default function Color(props: Props): React.Node {
    const { color, subscribe, unsubscribe }: Props = props

    // $FlowTODO
    React.useEffect(() => {
        // $FlowTODO
        root.style.setProperty('--random-color', color || '#AFAFAF')
    })

    return (
        <div>
            <h3>
                Random color: <div className="random-color" />
            </h3>
            <button onClick={subscribe}>Subscribe</button>
            <button onClick={unsubscribe}>Unubscribe</button>
        </div>
    )
}
