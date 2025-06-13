/**
 * Debounces a function, ensuring it's only called after a specified delay
 * from the last invocation.
 *
 * @param {Function} func The function to debounce.
 * @param {number} delay The delay in milliseconds (e.g., 1000 for 1 second).
 * @returns {Function} A new, debounced function.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>; // This will hold the timer ID

  // Return a new function that will be the debounced version
  return function(this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const context = this; // Preserve the 'this' context

    // Clear any existing timer. This is the core of debouncing:
    // if the function is called again before the delay, the previous
    // scheduled execution is cancelled.
    clearTimeout(timeoutId);

    // Set a new timer. The 'func' will be called after 'delay' milliseconds,
    // but only if 'debounce' is not called again during that delay.
    timeoutId = setTimeout(() => {
      func.apply(context, args); // Execute the original function with its context and arguments
    }, delay);
  };
}