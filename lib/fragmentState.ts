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
