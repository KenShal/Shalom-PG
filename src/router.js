import { useEffect, useState } from 'react'

const parse = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)

export function go(path) {
  location.hash = '#/' + path.replace(/^\//, '')
}

export function useRoute() {
  const [r, setR] = useState(parse)
  useEffect(() => {
    const f = () => setR(parse())
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  return r
}
