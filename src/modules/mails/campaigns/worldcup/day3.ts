export const worldCupDay3Mail = () => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🏆 The World Cup Is Here — Fantasy Predict</title>
<style>
  body { margin: 0; padding: 0; background: #f0f0ec; font-family: Georgia, 'Times New Roman', serif; }
  .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 4px; overflow: hidden; }

  /* Header */
  .header { background: #0a0a0a; padding: 48px 48px 44px; text-align: center; }
  .header .logo { font-family: 'Trebuchet MS', sans-serif; font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: #555; margin: 0 0 28px; }
  .header .trophy { font-size: 40px; display: block; margin: 0 0 20px; }
  .header h1 { font-size: 30px; font-weight: normal; color: #ffffff; margin: 0 0 10px; line-height: 1.3; letter-spacing: -0.3px; }
  .header h1 em { font-style: italic; color: #c8f135; }
  .header .subhead { font-family: 'Trebuchet MS', sans-serif; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #555; margin: 16px 0 0; }

  /* Body */
  .body { padding: 44px 48px; }
  .body p { font-size: 16px; color: #2a2a2a; line-height: 1.85; margin: 0 0 20px; }
  .body p.lead { font-size: 18px; color: #111; margin-bottom: 24px; }

  /* Stakes section */
  .stakes { background: #0a0a0a; border-radius: 4px; padding: 28px 32px; margin: 28px 0; }
  .stakes .stakes-label { font-family: 'Trebuchet MS', sans-serif; font-size: 11px; font-weight: bold; letter-spacing: 0.18em; text-transform: uppercase; color: #c8f135; margin: 0 0 18px; }
  .stake-row { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
  .stake-row:last-child { margin-bottom: 0; }
  .stake-bullet { width: 6px; height: 6px; background: #c8f135; border-radius: 50%; flex-shrink: 0; margin-top: 8px; }
  .stake-row p { font-size: 15px; color: #cccccc; line-height: 1.6; margin: 0; }
  .stake-row p strong { color: #ffffff; }

  /* CTA */
  .cta-block { text-align: center; margin: 36px 0 28px; }
  .cta-btn { display: inline-block; background: #c8f135; color: #0a0a0a; font-family: 'Trebuchet MS', sans-serif; font-size: 14px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; padding: 20px 56px; border-radius: 2px; }
  .cta-arrow { font-family: 'Trebuchet MS', sans-serif; font-size: 12px; color: #999; text-align: center; margin: 10px 0 0; }

  /* Sign off */
  .signoff { border-top: 1px solid #f0f0f0; padding-top: 24px; margin-top: 8px; }
  .signoff p { font-size: 16px; color: #2a2a2a; line-height: 1.85; margin: 0 0 16px; }
  .ps { font-size: 14px; color: #888; font-style: italic; line-height: 1.7; margin: 0; }
  .ps strong { color: #555; font-style: normal; }

  /* Footer */
  .footer { background: #f0f0ec; padding: 28px 48px; text-align: center; }
  .footer p { font-family: 'Trebuchet MS', sans-serif; font-size: 11px; color: #aaa; margin: 0 0 4px; letter-spacing: 0.05em; }
  .footer a { color: #aaa; text-decoration: underline; }
</style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <p class="logo">Fantasy Predict</p>
    <span class="trophy">🏆</span>
    <h1>The World Cup is here.<br>Your predictions could<br>win you <em>real cash.</em></h1>
    <p class="subhead">Tournament is now underway</p>
  </div>

  <div class="body">
    <p class="lead">Hi Buddy,</p>
    <p>The world's biggest football tournament is about to beunderway — and so is your chance to win real cash prizes on Fantasy Predict.</p>
    <p>Every match is an opportunity. Every prediction brings you closer to the top of the leaderboard — and closer to your share of the prize pool.</p>

    <div class="stakes">
      <p class="stakes-label">💰 What's at stake</p>
      <div class="stake-row">
        <div class="stake-bullet"></div>
        <p><strong>Cash prizes</strong> for top predictors</p>
      </div>
      <div class="stake-row">
        <div class="stake-bullet"></div>
        <p><strong>Weekly reward pools</strong> throughout the tournament</p>
      </div>
      <div class="stake-row">
        <div class="stake-bullet"></div>
        <p><strong>Bonus points</strong> for bold, early predictions</p>
      </div>
    </div>

    <p>The earlier you start, the more matches you can predict — and the more chances you have to win.</p>
    <p>Don't let the group stages pass you by.</p>

    <div class="cta-block">
      <a href="https://fantasy-predict.com/login" class="cta-btn">Start Predicting Now</a>
      <p class="cta-arrow">👉 Tap above to make your first prediction</p>
    </div>

    <div class="signoff">
      <p>Good luck,<br><strong>The Fantasy Predict Team</strong></p>
      <p class="ps">P.S. <strong>Spots on the leaderboard are filling up fast.</strong> Your rivals are already predicting — are you?</p>
    </div>
  </div>

  <div class="footer">
    <p>Fantasy Predict · You're receiving this because you have an account with us.</p>
    <p><a href="">Unsubscribe</a> &nbsp;·&nbsp; <a href="https://fantasy-predict.com/privacy-policy">Privacy Policy</a></p>
  </div>

</div>
</body>
</html>
    `
}
