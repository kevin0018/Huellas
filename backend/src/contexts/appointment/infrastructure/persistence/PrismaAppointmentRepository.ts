import { AppointmentRepository, AppointmentCreateData, AppointmentUpdateData } from '../../domain/repositories/AppointmentRepository.js';
import { Appointment, AppointmentReason } from '../../domain/entities/Appointment.js';
import { PrismaClient } from '@prisma/client';

export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        pet: {
          include: {
            owner: true
          }
        }
      }
    });

    if (!appointment) return null;

    return Appointment.fromDatabase(
      appointment.id,
      appointment.pet_id,
      appointment.date,
      appointment.reason as AppointmentReason,
      appointment.notes || undefined
    );
  }

  async findByPetId(petId: number): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { pet_id: petId },
      orderBy: { date: 'desc' }
    });

    return appointments.map(appointment => 
      Appointment.fromDatabase(
        appointment.id,
        appointment.pet_id,
        appointment.date,
        appointment.reason as AppointmentReason,
        appointment.notes || undefined
      )
    );
  }

  async findByOwner(ownerId: number): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        pet: {
          owner_id: ownerId
        }
      },
      orderBy: { date: 'desc' },
      include: {
        pet: true
      }
    });

    return appointments.map(appointment => 
      Appointment.fromDatabase(
        appointment.id,
        appointment.pet_id,
        appointment.date,
        appointment.reason as AppointmentReason,
        appointment.notes || undefined
      )
    );
  }

  async create(data: AppointmentCreateData): Promise<Appointment> {
    const appointment = await this.prisma.appointment.create({
      data: {
        pet_id: data.petId,
        date: data.date,
        reason: data.reason,
        notes: data.notes
      }
    });

    return Appointment.fromDatabase(
      appointment.id,
      appointment.pet_id,
      appointment.date,
      appointment.reason as AppointmentReason,
      appointment.notes || undefined
    );
  }

  async update(id: number, data: AppointmentUpdateData): Promise<Appointment> {
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...(data.petId !== undefined && { pet_id: data.petId }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.reason !== undefined && { reason: data.reason }),
        ...(data.notes !== undefined && { notes: data.notes })
      }
    });

    return Appointment.fromDatabase(
      appointment.id,
      appointment.pet_id,
      appointment.date,
      appointment.reason as AppointmentReason,
      appointment.notes || undefined
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.appointment.delete({
      where: { id }
    });
  }

  async verifyOwnership(appointmentId: number, ownerId: number): Promise<boolean> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        pet: true
      }
    });

    return appointment?.pet.owner_id === ownerId;
  }

  async verifyPetOwnership(petId: number, ownerId: number): Promise<boolean> {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId }
    });

    return pet?.owner_id === ownerId;
  }
}
