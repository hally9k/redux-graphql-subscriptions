import * as React from 'react'
import { SubscribeAction, UnsubscribeAction } from '../../../../src'

const root: any = document.querySelector(':root')

export interface DispatchProps {
  subscribe: () => SubscribeAction
  unsubscribe: () => UnsubscribeAction
}

export interface StateProps {
  color: string
}

export interface Props extends StateProps, DispatchProps {}

export default function Color(props: Props) {
  const { color, subscribe, unsubscribe } = props

  React.useEffect(() => {
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
