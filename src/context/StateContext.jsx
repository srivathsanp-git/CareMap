import { createContext, useContext, useState } from 'react'
import { US_STATES, ABBR_TO_STATE } from '../data/usStates'

const StateContext = createContext(null)

export function StateProvider({ children }) {
  const [selectedState, setSelectedState] = useState(ABBR_TO_STATE['IA'])

  return (
    <StateContext.Provider value={{ selectedState, setSelectedState, US_STATES }}>
      {children}
    </StateContext.Provider>
  )
}

export function useAppState() {
  return useContext(StateContext)
}
