import { Request } from "express";

export const composeFilter = (req: Request) => {
    const { user, contest, status } = req.query;
    let filter = { contest } as any

    if (user) filter = { ...filter, user: String(user) };
    if (status) filter = { ...filter, status }

    console.log({ filter });

    return filter;
}