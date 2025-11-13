/** @format */

import { Agenda } from "@hokify/agenda"
import { configs } from "../utils/config"

const agenda = new Agenda({
name: "Predict Contest",
    defaultConcurrency: 5,
    db: { address: configs.DB_URL, collection: "cronjobs" },
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

