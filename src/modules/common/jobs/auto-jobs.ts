import agenda from "../queue/agenda";
import { agendaIdentifier } from "../queue/identifiers";
import { processPrediction } from "./prediction";

agenda.on("ready", async () => {
    const predictionPointJob = agenda.create(agendaIdentifier.CALCULATE_PREDICTION, {});
    await predictionPointJob.repeatEvery("*/5 * * * *").unique({ name: agendaIdentifier.CALCULATE_PREDICTION }).save();
});

agenda.define(agendaIdentifier.CALCULATE_PREDICTION, async (job, done) => {
    await processPrediction();
    done();
});