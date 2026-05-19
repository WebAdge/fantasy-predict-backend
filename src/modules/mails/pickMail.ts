import { DefaultAttributes, IPrediction } from "../../types";

interface IMatchs extends DefaultAttributes {
  status: "ongoing" | "finished" | "scheduled" | string;
  homeTeam: {
    name: string;
    shortName: string;
    crest: string;
    score: number | null;
  };
  awayTeam: {
    name: string;
    shortName: string;
    crest: string;
    score: number | null;
  };
  matchday: number;
  date: Date;
  competition: string;
  stage: string;
  prediction: IPrediction[];
}


type Props = {
    round: string;
    picks: IMatchs[];

}

export function generatePicksEmail({ round, picks }: Props) {
  const rows = picks
    .map(
      (pick, index) => `
        <tr style="background:${index % 2 === 0 ? "#fafafa" : "#ffffff"};">
          <td>${pick.homeTeam.name}</td>
          <td align="center">${pick.prediction?.[0]?.outcome?.split("-")[0] || 'No pick'}</td>
          <td>${pick.awayTeam.name}</td>
          <td align="center">${pick.prediction?.[0]?.outcome?.split("-")[1] || 'No pick'}</td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${round} – Picks Summary</title>
</head>
<body style="margin:0; padding:0; background:#f6f2e9; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; margin:20px 0; border-radius:6px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding:20px; background:#6a007a; color:#ffffff; text-align:center;">
              <h2 style="margin:0;">${round} Summary</h2>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:20px; color:#333; font-size:15px;">
              <p>Below is the summary of your picks for ${round}</p>
              <p>Looking forward to seeing how you do in the next round!</p>
            </td>
          </tr>

          <!-- Picks Table -->
          <tr>
            <td style="padding:0 20px 20px;">
              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse; font-size:14px;">
                <tr style="background:#6a007a; color:#ffffff;">
                  <th align="left">Home</th>
                  <th align="center">Score</th>
                  <th align="left">Away</th>
                  <th align="center">You</th>
                </tr>
                ${rows}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:15px; text-align:center; font-size:12px; color:#777;">
              © ${new Date().getFullYear()} Fantasy Predict. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
