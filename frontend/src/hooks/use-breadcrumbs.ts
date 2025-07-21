import { useMatches } from '@tanstack/react-router'

export function useBreadcrumbs() {
  const matches = useMatches()
  return matches
    .flatMap((match) => {
      if (match._strictSearch !== undefined && 'path' in match._strictSearch) {
        const pathParts = match._strictSearch.path
          .split('/')
          .filter((part) => part !== '')
        return pathParts.map((_, i, arr) => {
          const crumb = arr[i]
          const accumulatedPath = `${arr.slice(0, i + 1).join('/')}/`
          return {
            crumb,
            url: `${match.pathname.slice(0, -1)}?path=${encodeURIComponent(accumulatedPath)}`,
          }
        })
      }
      if (match.loaderData !== undefined && 'crumb' in match.loaderData) {
        return [
          {
            crumb: match.loaderData?.crumb,
            url: match.pathname.replaceAll('/_pathlessLayout', ''),
          },
        ]
      }
      return null
    })
    .filter((breadcrumb) => breadcrumb !== null)
}
