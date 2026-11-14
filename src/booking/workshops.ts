export type Workshop = {
  id: string
  title: string
  date: string
  seatsLeft: number
  capacity: number
}

export const workshops: Workshop[] = [
  { id: 'visual-testing', title: 'Intro to Visual Testing', date: 'Sat 21 Nov 2026, 10:00', seatsLeft: 8, capacity: 12 },
  { id: 'storybook-for-testers', title: 'Storybook for Testers', date: 'Sun 22 Nov 2026, 14:00', seatsLeft: 2, capacity: 12 },
  { id: 'a11y-basics', title: 'Accessibility Basics', date: 'Sat 28 Nov 2026, 09:30', seatsLeft: 0, capacity: 12 },
]
