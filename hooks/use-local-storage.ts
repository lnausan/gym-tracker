"use client"

import { useState, useEffect, useRef } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true)

  // Effect for syncing with localStorage when the key changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    // Skip the first render since we already initialized from localStorage
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Only update localStorage, don't update state
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.log(error)
    }
  }, [key, storedValue])

  // Return a wrapped version of useState's setter function
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}
