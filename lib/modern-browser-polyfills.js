// The production targets natively support Next's legacy Array, Object, and
// String shims. URL.canParse arrived later, so retain only that fallback.
if (!("canParse" in URL)) {
  URL.canParse = (url, base) => {
    try {
      new URL(url, base)
      return true
    } catch {
      return false
    }
  }
}
