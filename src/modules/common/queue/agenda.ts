/** @format */

import { Agenda } from "@hokify/agenda"
import dbConfig from "../../../databases/connection/config"
import '../jobs/auto-jobs'

const NODE_ENV = process.env.NODE_ENV as "development" | "staging" | "production"

const agenda = new Agenda({
name: "Predict Contest",
    defaultConcurrency: 5,
    db: { address: dbConfig[NODE_ENV].MONGO_URI, collection: "cronjobs" },
})

agenda
    .on("ready", () => console.log("Agenda started!"))
    .on("error", err => console.log("Agenda connection error!", err?.message));

const definitions = [] as any[]

definitions.forEach(definition => definition(agenda));

(async () => {
    await agenda.start()
})()

export default agenda

