// @flow
import * as React from 'react'
import Time from './time.container'
import Color from './color.container'

export default function App(): React.Node {
    return (
        <div>
            <Time />
            <br />
            <Color />
        </div>
    )
}
