import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { AppointmentController } from '../contexts/appointment/infrastructure/controllers/AppointmentController.js';

const router = Router();
const prisma = new PrismaClient();
const appointmentController = new AppointmentController(prisma);

// All appointment routes require owner authentication
router.use(JwtMiddleware.requireOwner());

// GET /appointments - Get all appointments for the authenticated owner
router.get('/', async (req, res) => {
  await appointmentController.getAppointmentsByOwner(req, res);
});

// GET /appointments/:id - Get a specific appointment by ID
router.get('/:id', async (req, res) => {
  await appointmentController.getAppointmentById(req, res);
});

// POST /appointments - Create a new appointment
router.post('/', async (req, res) => {
  await appointmentController.createAppointment(req, res);
});

// PUT /appointments/:id - Update an existing appointment
router.put('/:id', async (req, res) => {
  await appointmentController.updateAppointment(req, res);
});

// DELETE /appointments/:id - Delete an appointment
router.delete('/:id', async (req, res) => {
  await appointmentController.deleteAppointment(req, res);
});

export default router;
