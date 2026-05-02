const BASE_URL = 'http://localhost:8081/api'

export async function fetchEndlessMonster(wins: number) {
  const params = new URLSearchParams({ wins: String(wins) })
  const res = await fetch(`${BASE_URL}/endless/monster?${params.toString()}&preview_count=3`)
  if (!res.ok) throw new Error('Failed to fetch endless monster')
  return res.json()
}

export async function postExperience(exp: any) {
  const res = await fetch(`${BASE_URL}/endless/experience`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exp),
  })
  if (!res.ok) throw new Error('Failed to post experience')
  return res.json()
}
