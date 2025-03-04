import { Webhook } from "svix";
import User from "../models/user.js";

// API Controller Function to Manage Clerk User with database
export const clerkWebhooks = async (req, res) => {
   try {
      const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

      // Verify webhook signature
      await whook.verify(JSON.stringify(req.body), {
         "svix-id": req.headers['svix-id'],
         'svix-timestamp': req.headers['svix-timestamp'],
         'svix-signature': req.headers['svix-signature'], // Fixed typo here
      });

      const { data, type } = req.body;

      // Handle different webhook event types
      switch (type) {
         case 'user.created': {
            const userData = {
               _id: data.id,
               email: data.email_addresses[0].email_address,
               name: `${data.first_name} ${data.last_name}`,
               imageUrl: data.image_url,
            };

            // Create the user in the database
            await User.create(userData);
            return res.status(201).json({ success: true }); // Response for creation
         }
         case 'user.updated': {
            const userData = {
               email: data.email_addresses[0].email_address, // Make sure the data structure is valid
               name: `${data.first_name} ${data.last_name}`,
               imageUrl: data.image_url,
            };

            // Update user in the database
            await User.findByIdAndUpdate(data.id, userData, { new: true });
            return res.status(200).json({ success: true }); // Response for successful update
         }
         case 'user.deleted': {
            // Delete user from the database
            await User.findByIdAndDelete(data.id);
            return res.status(200).json({ success: true }); // Response for deletion
         }
         default: {
            return res.status(400).json({ success: false, message: "Unsupported event type" });
         }
      }
   } catch (error) {
      // Log error for debugging purposes
      console.error("Error processing webhook:", error);

      // Send error response
      return res.status(500).json({
         success: false,
         message: error.message,
      });
   }
};
