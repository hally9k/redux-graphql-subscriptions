import * as React from 'react'

const root = document.querySelector(':root')

export default function Color(props) {
    const { color, subscribe, unsubscribe } = props

    // $FlowTODO
    React.useEffect(() => {
        // $FlowTODO
        root.style.setProperty('--random-color', color)
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
