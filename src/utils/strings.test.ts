import {
  cleanString,
  trimEnd,
  startsWith,
  startsWithAny,
  replaceAll,
  replaceAllChars,
  replaceMap,
} from "./strings"

test("cleanString", () => expect(cleanString("ab   cd")).toBe("ab cd"))

test("trimEnd", () => expect(trimEnd("abcd", "cd")).toBe("ab"))

test("replaceAll", () => expect(replaceAll("a/b/c/d", "/", "")).toBe("abcd"))

test("replaceAllChars", () =>
  expect(replaceAllChars("a/b/c-d-", ["/", "-"], "")).toBe("abcd"))

test("replaceMap", () =>
  expect(
    replaceMap("a/b/c-d-$$", [
      {
        from: ["/", "-"],
        to: "_",
      },
      {
        from: ["$"],
        to: "=",
      },
    ])
  ).toBe("a_b_c_d_=="))

test("startsWith default", () => expect(startsWith("abcd", "ABC")).toBeTruthy())

test("startsWith case invariant", () =>
  expect(startsWith("abcd", "ABC", true)).toBeTruthy())

test("startsWith case variant", () =>
  expect(startsWith("abcd", "ABC", false)).toBeFalsy())

test("startsWithAny", () =>
  expect(startsWithAny("abcd", ["ab", "bc"])).toBeTruthy())
