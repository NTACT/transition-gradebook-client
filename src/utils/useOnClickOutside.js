import { useEffect } from 'react';

/**
 * Hook for monitoring an element for clicks outside if it.
 * Handles mouse and touch events
 * @param {Ref} ref a ref to the element that is being monitored.
 * @param {function} onClickOutside a function to call when the outside of the ref is clicked
 */
export default function useOnClickOutside(ref, onClickOutside) {
    useEffect(() => {
        const listener = event => {
            if(!ref || !ref.current || ref.current.contains(event.target)) {
                return;
            }
            if(typeof onClickOutside === 'function') {
                onClickOutside(event);
            }
        }
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        }
    }, [ref, onClickOutside]);
}