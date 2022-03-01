import { v4 as uuidv4 } from "uuid"

export const newUuid = () => uuidv4()
export const generateJobId = () => newUuid()
export const generateRunId = () => newUuid()
