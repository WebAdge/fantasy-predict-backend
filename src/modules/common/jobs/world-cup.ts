/** @format */

import UserService from "../../v1/users/service"
import Email from "../../thirdpartyApi/zeptomail"
import { worldCupDay1Mail } from "../../mails/campaigns/worldcup/day1"
import { worldCupDay3Mail } from "../../mails/campaigns/worldcup/day3"
import { worldCupDay2Mail } from "../../mails/campaigns/worldcup/day2"

export const processWorldCupEmailCampaign = async () => {
    try {
        const users = await new UserService({}).findAll({            
            $or: [
                { worldCupCampaign: { $exists: false } },
                {worldCupCampaign: { $lt: 3 }},
            ],
            email: 'richardjohn740@gmail.com',
        })

        console.log(users, "USERS TO SEND WORLD CUP CAMPAIGN EMAIL") // to be removed

        if (users.docs.length) {
            const day1Users = users.docs.filter(
                user => user?.worldCupCampaign === 0 || !user?.worldCupCampaign
            )
            const day2Users = users.docs.filter(
                user => user?.worldCupCampaign === 1
            )
            const day3Users = users.docs.filter(
                user => user?.worldCupCampaign === 2
            )

            if (day1Users.length) {
                await new Email().SendBulkEmail(
                    day1Users,
                    "⚽ Something big is coming to Fantasy Predict",
                    worldCupDay1Mail()
                )
                await new UserService({
                    _id: { $in: day1Users.map(user => user._id) },
                }).updateMany({ worldCupCampaign: 1 })
            }

            if (day2Users.length) {
                await new Email().SendBulkEmail(
                    day2Users,
                    "Here's what's at stake this World Cup 🏆",
                    worldCupDay2Mail()
                )
                await new UserService({
                    _id: { $in: day2Users.map(user => user._id) },
                }).updateMany({ worldCupCampaign: 2 })
            }

            if (day3Users.length) {
                await new Email().SendBulkEmail(
                    day3Users,
                    "🏆 The World Cup Is Here — Your Predictions Could Win You Cash!",
                    worldCupDay3Mail()
                )
                await new UserService({
                    _id: { $in: day3Users.map(user => user._id) },
                }).updateMany({ worldCupCampaign: 3 })
            }
        }

        console.log("WORLD CUP CAMPAIGN EMAILS SENT SUCCESSFULLY");
    } catch (error) {
        console.log("Error updating prediction point")
    }
}
