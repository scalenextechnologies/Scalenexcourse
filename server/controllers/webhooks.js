import { Webhook } from "svix";
import User from '../models/user.js'
import Stripe from 'stripe'
import Purchase from '../models/Purchase.js'
import Course from '../models/Course.js'


//API Controller Function to Manage Clerk User with database

export const clerkWebhooks = async (req, res) => {
   try {
      const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

      await whook.verify(JSON.stringify(req.body), {
         "svix-id": req.headers["svix-id"],
         "svix-timestamp": req.headers["svix-timestamp"],
         "svix-signature": req.headers["svix-signature"],
      })

      const { data, type } = req.body
      switch (type) {
         case 'user.created': {
            const userData = {
               _id: data.id,
               email: data.email_addresses[0].email_address,
               name: data.first_name + " " + data.last_name,
               imageUrl: data.image_url,

            }
            await User.create(userData)
            res.json({})
            break;
         }
         case 'user.updated': {
            const userData = {
               email: data.email_addresses[0].email_address,
               name: data.first_name + " " + data.last_name,
               imageUrl: data.image_url,

            }
            await User.findByIdAndUpdate(data.id, userData)
            res.json({})
            break;
         }
         case 'user.deleted': {
            await User.findByIdAndDelete(data.id)
            res.json({})
            break;
         }
         default:
            break;

      }
   } catch (error) {
      res.json({ success: false, message: error.message })

   }
}


const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
export const stripeWebhooks = async (request, response) => {
  const sig = request.headers['stripe-signature']
  let event

  try {
    event = Stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return response.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log('✅ Stripe Event Received:', event.type)

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const paymentIntentId = paymentIntent.id
        console.log('✅ PaymentIntent ID:', paymentIntentId)

        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
          limit: 1 // Just one session is enough
        })

        const session = sessionList.data?.[0]
        if (!session || !session.metadata?.purchaseId) {
          console.error('❌ No valid session or metadata found for this paymentIntent')
          return response.status(404).send('Session or metadata missing')
        }

        const { purchaseId } = session.metadata
        console.log('🧾 purchaseId:', purchaseId)

        const purchaseData = await Purchase.findById(purchaseId)
        if (!purchaseData) {
          console.error('❌ No purchase record found in DB')
          return response.status(404).send('Purchase not found')
        }

        const userData = await User.findById(purchaseData.userId)
        const courseData = await Course.findById(purchaseData.courseId.toString())

        if (!userData || !courseData) {
          console.error('❌ User or Course not found')
          return response.status(404).send('User or Course not found')
        }

        // Add user to course and course to user
        if (!courseData.enrolledStudents.includes(userData._id)) {
          courseData.enrolledStudents.push(userData._id)
          await courseData.save()
        }

        if (!userData.enrolledCourses.includes(courseData._id)) {
          userData.enrolledCourses.push(courseData._id)
          await userData.save()
        }

        purchaseData.status = 'completed'
        await purchaseData.save()

        console.log('✅ Purchase status updated to completed')
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const paymentIntentId = paymentIntent.id

        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
          limit: 1
        })

        const session = sessionList.data?.[0]
        if (!session || !session.metadata?.purchaseId) {
          console.error('❌ No valid session or metadata found for failed payment')
          return response.status(404).send('Session or metadata missing')
        }

        const { purchaseId } = session.metadata
        const purchaseData = await Purchase.findById(purchaseId)
        if (purchaseData) {
          purchaseData.status = 'failed'
          await purchaseData.save()
          console.log('❌ Purchase status updated to failed')
        }

        break
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    response.json({ received: true })
  } catch (err) {
    console.error('💥 Webhook processing error:', err)
    response.status(500).send('Internal Server Error')
  }
}
