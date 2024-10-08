// Cron Job for Inactivity Check

import cron from "node-cron";
import User from "../models/User";
import transporter from "../config/nodemailer";

cron.schedule("0 0 * * *", async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const usersToDeactivate = await User.find({
    lastActive: { $lt: oneMonthAgo },
    isActive: true,
  });

  if (usersToDeactivate.length === 0) return;

  for (const user of usersToDeactivate) {
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
        to: email,
        subject: "Reminder: Your account will be deactivated soon.",
        html: emailTemplate,
      });
    } catch (error) {
      // Delete the user if the email is not sent
      return res
        .status(500)
        .json({ message: "Email address rejected because domain not found." });
    }

    // Deactivate account if already reminded
    if (user.reminderSent) {
      user.isActive = false;
      await user.save();
    } else {
      user.reminderSent = true;
      await user.save();
    }
  }
});
