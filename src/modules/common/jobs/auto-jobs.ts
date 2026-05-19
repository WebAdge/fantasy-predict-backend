import agenda from "../queue/agenda";
import { agendaIdentifier } from "../queue/identifiers";
import { processPrediction } from "./prediction";
import { processWorldCupEmailCampaign } from "./world-cup";

agenda.on("ready", async () => {
    const predictionPointJob = agenda.create(agendaIdentifier.CALCULATE_PREDICTION, {});
    await predictionPointJob.repeatEvery("*/5 * * * *").unique({ name: agendaIdentifier.CALCULATE_PREDICTION }).save();
    const worldCupCampaignJob = agenda.create(agendaIdentifier.WORLD_CUP_CAMPAIGN, {});
    await worldCupCampaignJob.repeatEvery("0 9 * * *").unique({ name: agendaIdentifier.WORLD_CUP_CAMPAIGN }).save();
});

agenda.define(agendaIdentifier.CALCULATE_PREDICTION, async (job, done) => {
    await processPrediction();
    done();
});

agenda.define(agendaIdentifier.WORLD_CUP_CAMPAIGN, async (job, done) => {
    await processWorldCupEmailCampaign();
    done();
});