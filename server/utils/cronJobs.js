import cron from "node-cron";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

export const startCronJobs = () => {
  // Run every minute for testing/demo, or change to "0 * * * *" for hourly
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Running cron job: Checking for missed task deadlines...");
    try {
      const now = new Date();
      // Find tasks that are in-progress but deadline has passed
      const missedTasks = await Task.find({
        status: "in-progress",
        deadline: { $lt: now },
      }).populate("selectedVolunteers").populate("createdBy");

      for (let task of missedTasks) {
        console.log(`Task missed deadline: ${task._id}`);
        
        // 1. Handle Volunteer Strikes
        if (task.selectedVolunteers && task.selectedVolunteers.length > 0) {
          for (let vol of task.selectedVolunteers) {
            const volunteer = await User.findById(vol._id);
            if (volunteer && volunteer.accountStatus !== "permanently_banned") {
              volunteer.strikes += 1;
              
              if (volunteer.strikes >= 3) {
                volunteer.accountStatus = "permanently_banned";
                console.log(`Volunteer ${volunteer.email} permanently banned.`);
              } else {
                volunteer.accountStatus = "temporarily_blocked";
                console.log(`Volunteer ${volunteer.email} temporarily blocked (Strike ${volunteer.strikes}).`);
              }
              await volunteer.save();
            }
          }
        }

        // 2. Refund Escrow to Client
        if (task.createdBy) {
          const client = await User.findById(task.createdBy._id);
          if (client) {
            const refundAmount = task.budget * (task.selectedVolunteers ? task.selectedVolunteers.length : 1);
            client.walletBalance += refundAmount;
            await client.save();
            
            await Transaction.create({
              user: client._id,
              type: "credit",
              amount: refundAmount,
              description: `Refund for missed deadline on task: ${task.title}`,
              taskId: task._id,
            });
          }
        }

        // 3. Reset Task back to open
        task.status = "open";
        if (task.selectedVolunteers && task.selectedVolunteers.length > 0) {
          const volunteerIds = task.selectedVolunteers.map(v => v._id.toString());
          task.applicants = task.applicants.filter(
            app => !volunteerIds.includes(app.user.toString())
          );
        }
        task.selectedVolunteers = [];
        await task.save();
      }
    } catch (error) {
      console.error("Error running deadline cron job:", error);
    }
  });
};
