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

    public async SendBulkEmail(users: Partial<IUser>[], subject: string, message: string) {
        return this.UseBulkZeptomail(users, subject, message)
    }

    public async SendEmail(user: Partial<IUser>, subject: string, message: string) {
        return this.UseZeptomail(user, subject, message)
    }

    private async UseBulkZeptomail(users: Partial<IUser>[], subject: string, message: string) {
        try {
            await this.client.sendMail({
                from: {
                    address: "noreply@fantasy-predict.com", // to be changed
                    name: "Fantasy Predict",
                },
                to: users.map((user) => ({
                    email_address: {
                            address: user.email,
                            name: `${user.firstName} ${user.lastName}`,
                        },
            })),
                subject: subject,
                htmlbody: message,
            })

            console.log("EMAIL SENT SUCCESSFULLY");
    
            return {
                status: "success",
                message: "Mail successfully sent",
            }
        } catch (error) {
            console.log(error, "EMAIL ERROR");
            return {
                status: "failure",
                message: error,
            }
        }
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

            console.log("EMAIL SENT SUCCESSFULLY");
    
            return {
                status: "success",
                message: "Mail successfully sent",
            }
        } catch (error) {
            console.log(error, "EMAIL ERROR");
            return {
                status: "failure",
                message: error,
            }
        }
    }
}

export default Email;