import { useEffect, useState } from 'react'



// Remaining seconds helper
const secondsLeft = (deadline: number | null): number => {
    return deadline === null ? 0 : Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}



// Countdown display hook
export const useCountdown = (deadline: number | null): number => {


    // Force re-render only
    const [, setTick] = useState(0)



    // Tick while running
    useEffect(() => {

        if (deadline === null) {
            return
        }

        const timer = setInterval(() => setTick(tick => tick + 1), 250)

        // Stop ticking
        return () => clearInterval(timer)

    }, [deadline])



    // Never stale on new deadline
    return secondsLeft(deadline)

}
