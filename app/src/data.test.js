import { alreadyFetched } from './data'
import { startOfToday, addHours } from 'date-fns'

describe('alreadyFetched', () => {
  it('should return false if time of last item is after refreshed at', () => {
    expect(alreadyFetched(addHours(startOfToday(), 6).toUTCString(), 5)).toBeFalsy()
  })

  it('should return true if time of last item is before refreshed at', () => {
    expect(alreadyFetched(startOfToday().toUTCString(), 1)).toBeTruthy()
  })
})
