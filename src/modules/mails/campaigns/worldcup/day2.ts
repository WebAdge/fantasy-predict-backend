export const worldCupDay2Mail = () => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Here's what's at stake — Fantasy Predict</title>
<style>
  body { margin: 0; padding: 0; background: #f0f0ec; font-family: Georgia, 'Times New Roman', serif; }
  .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 4px; overflow: hidden; }
  .header { background: #0c1f0c; padding: 40px 48px; text-align: center; }
  .header .logo { font-family: 'Trebuchet MS', sans-serif; font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: #5a7a5a; margin: 0 0 20px; }
  .header .day-tag { display: inline-block; background: #162416; color: #5a7a5a; font-family: 'Trebuchet MS', sans-serif; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; padding: 6px 16px; border-radius: 2px; margin-bottom: 20px; }
  .header h1 { font-size: 28px; font-weight: normal; color: #ffffff; margin: 0; line-height: 1.3; }
  .header h1 em { font-style: italic; color: #c8f135; }
  .body { padding: 40px 48px; }
  .body p { font-size: 16px; color: #2a2a2a; line-height: 1.8; margin: 0 0 20px; }
  .body p.lead { font-size: 18px; color: #111; }
  .prizes-box { background: #f8f8f4; border-left: 3px solid #c8f135; padding: 24px 28px; margin: 28px 0; border-radius: 0 4px 4px 0; }
  .prizes-box .prize-row { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
  .prizes-box .prize-row:last-child { margin-bottom: 0; }
  .prizes-box .icon { font-size: 20px; flex-shrink: 0; line-height: 1.4; }
  .prizes-box .prize-text { font-size: 15px; color: #1a1a1a; line-height: 1.6; margin: 0; }
  .prizes-box .prize-text strong { color: #0a3d0a; }
  .countdown { text-align: center; background: #0c1f0c; border-radius: 4px; padding: 20px; margin: 28px 0; }
  .countdown p { font-family: 'Trebuchet MS', sans-serif; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #5a7a5a; margin: 0 0 6px; }
  .countdown .num { font-size: 36px; font-weight: bold; color: #c8f135; margin: 0; font-family: 'Trebuchet MS', sans-serif; letter-spacing: -1px; }
  .cta-block { text-align: center; margin: 32px 0; }
  .cta-btn { display: inline-block; background: #0c1f0c; color: #c8f135; font-family: 'Trebuchet MS', sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; padding: 16px 40px; border-radius: 2px; }
  .footer { background: #f0f0ec; padding: 28px 48px; text-align: center; }
  .footer p { font-family: 'Trebuchet MS', sans-serif; font-size: 11px; color: #999; margin: 0 0 4px; letter-spacing: 0.05em; }
  .footer a { color: #999; text-decoration: underline; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <p class="logo">Fantasy Predict</p>
    <div class="day-tag">Day 2 of 10</div>
    <h1>Here's what's<br>at stake this<br><em>World Cup.</em></h1>
  </div>
  <div class="body">
    <p class="lead">Hi Buddy,</p>
    <p>Tomorrow we go live — and we want you ready. Here's what's on the table this World Cup on Fantasy Predict:</p>
    <div class="prizes-box">
      <div class="prize-row">
        <span class="icon">💰</span>
        <p class="prize-text"><strong>Cash prizes for top predictors</strong> — paid out to the top 4 on the leaderboard at the end of the tournament</p>
      </div>
      <div class="prize-row">
        <span class="icon">🏅</span>
        <p class="prize-text"><strong>Bonus rewards</strong> for the most accurate group stage predictions</p>
      </div>
    </div>
    <p>The earlier you predict, the faster you can cover all the group stage games. Don't miss the first match.</p>
    <p>Good luck,<br><strong>The Fantasy Predict Team</strong></p>
  </div>
  <div class="footer">
    <p>Fantasy Predict · You're receiving this because you have an account with us.</p>
    <p><a href="#">Unsubscribe</a> &nbsp;·&nbsp; <a href="https://fantasy-predict.com/privacy-policy">Privacy Policy</a></p>
  </div>
</div>
</body>
</html>
    `
}