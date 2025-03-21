import mongoose from "mongoose";
import { Webhook } from "svix";
import User from "../models/User.js";

// Ensure MongoDB is connected before processing the webhook
if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

// API Controller Function to Manage Clerk User with Database
export const clerkWebhooks = async (req, res) => {
    try {
        // Validate Webhook Secret
        if (!process.env.CLERK_WEBHOOK_SECRET) {
            throw new Error("CLERK_WEBHOOK_SECRET is not defined in environment variables.");
        }

        // Initialize Svix Webhook
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Fix header typo and verify webhook request
        const payload = JSON.stringify(req.body);
        await whook.verify(payload, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"], // ✅ Fixed Typo
        });

        // Extract event data
        const { data, type } = req.body;

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0]?.email_address || "",
                    name: `${data.first_name} ${data.last_name}`.trim(),
                    imageUrl: data.image_url,
                };

                await User.create(userData);
                res.json({ success: true, message: "User created" });
                break;
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0]?.email_address || "",
                    name: `${data.first_name} ${data.last_name}`.trim(),
                    imageUrl: data.image_url,
                };

                await User.findByIdAndUpdate(data.id, userData, { new: true });
                res.json({ success: true, message: "User updated" });
                break;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                res.json({ success: true, message: "User deleted" });
                break;
            }

            default:
                res.status(400).json({ success: false, message: "Unhandled event type" });
                break;
        }
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
