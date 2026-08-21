type FragmentStateValue = string | null | undefined

export function createFragmentHref(
  pathname: string,
  state: Record<string, FragmentStateValue>,
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(state)) {
    if (value) params.set(key, value)
  }

  const fragment = params.toString()
  return fragment ? `${pathname}#${fragment}` : pathname
}

export function parseFragmentState(fragment: string) {
  return new URLSearchParams(fragment.startsWith("#") ? fragment.slice(1) : fragment)
}

export function createFragmentRedirectHref(
  pathname: string,
  search: string,
  fragmentKeys: readonly string[],
) {
  const query = new URLSearchParams(search)
  const fragmentState = Object.fromEntries(
    fragmentKeys.map((key) => [key, query.get(key)]),
  )

  if (!Object.values(fragmentState).some(Boolean)) return null

  for (const key of fragmentKeys) query.delete(key)

  const queryString = query.toString()
  const fragmentHref = createFragmentHref(pathname, fragmentState)
  const [fragmentPath, fragment] = fragmentHref.split("#", 2)

  return `${fragmentPath}${queryString ? `?${queryString}` : ""}${fragment ? `#${fragment}` : ""}`
}
