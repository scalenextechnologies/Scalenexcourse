import express from 'express';
import { updateRoleToEducator } from '../controllers/educatorController.js';
import { requireAuth } from '@clerk/express'; // ✅ import this

const educatorRouter = express.Router();

// ✅ Protect the route
educatorRouter.get('/update-role', requireAuth, updateRoleToEducator);

export default educatorRouter;
