import { clekClient } from '@clerk/express'
//update role to educator
export const updateRoleToEducator = async (req,res) => {
    try {
        const UserID = request.auth.UserID
        await clekClient.users.updateUserMetadata(UserID, {
            publicMetadata: {
                role: 'educator'
            }
        })
        res.json({ success: true, message: 'You can publish a course now' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}