// Cron Job for Inactivity Check

import cron from "node-cron";
import User from "../models/User";
import transporter from "../config/nodemailer";
import fs from "fs";
import path from "path";

cron.schedule("0 0 * * *", async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

  const usersToDeactivate = await User.find({
    lastActive: { $lt: oneMonthAgo },
    isActive: true,
  });

  const usersToRemind = await User.find({
    lastActive: { $lt: threeWeeksAgo, $gte: oneMonthAgo },
    isActive: true,
    reminderSent: false,
  });

  for (const user of usersToRemind) {
    // Get the email template
    let emailTemplate = fs.readFileSync(
      path.resolve(".") + "/backend/views/template-reminder-inactivity.html",
      "utf8",
    );
    emailTemplate = emailTemplate.replace(
      /(\*\*login_link\*\*)/g,
      `${process.env.BASE_URL}/login`,
    );
    emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);

    try {
      // Send the email
      await transporter.sendMail({
        from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Reminder: Your account will be deactivated soon.",
        html: emailTemplate,
      });
      user.reminderSent = true;
      await user.save();
    } catch (error) {
      console.error("Failed to send email:", error);
      continue;
    }
  }

  for (const user of usersToDeactivate) {
    user.isActive = false;
    await user.save();
  }
});
