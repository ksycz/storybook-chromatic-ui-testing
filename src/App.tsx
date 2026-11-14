import { workshops } from './booking'
import { BookingPage } from './pages/BookingPage/BookingPage'

// `?workshops=none` shows the empty state, which the e2e tests use.
const empty = new URLSearchParams(window.location.search).get('workshops') === 'none'

function App() {
  return <BookingPage workshops={empty ? [] : workshops} />
}

export default App
