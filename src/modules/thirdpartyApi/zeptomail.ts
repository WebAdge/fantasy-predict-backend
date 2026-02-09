/** @format */

// @ts-ignore
import { SendMailClient } from "zeptomail"
import { IUser } from "../../types"
import { configs } from "../common/utils/config"

class Email {
    private client = new SendMailClient({
        url: configs.ZEP_URL,
        token: configs.ZEP_TOKEN,
    })
    constructor() {}

    public async SendEmail(user: Partial<IUser>, subject: string, message: string) {
        return this.UseZeptomail(user, subject, message)
    }

    private async UseZeptomail(user: Partial<IUser>, subject: string, message: string) {
        try {
            await this.client.sendMail({
                from: {
                    address: "noreply@fantasy-predict.com", // to be changed
                    name: "Fantasy Predict",
                },
                to: [
                    {
                        email_address: {
                            address: user.email,
                            name: `${user.firstName} ${user.lastName}`,
                        },
                    },
                ],
                subject: subject,
                htmlbody: message,
            })
    
            return {
                status: "success",
                message: "Mail successfully sent",
            }
        } catch (error) {
            return {
                status: "failure",
                message: error,
            }
        }
    }
}

export default Email;