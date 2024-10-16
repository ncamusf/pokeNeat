import { Request, Response } from 'express';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

// Submit Adoption Request
export const submitAdoptionRequest = async (req: Request, res: Response) => {
  try {
    const { name, lastname, address, rut, description } = req.body;

    if (!name || !lastname || !address || !rut || !description) {
      return res.status(400).json({ message: 'All fields are required, follow the next format: {"name": "Nicolás", "lastname": "Camus", "address": "Calle Falsa 123, Santiago, Chile", "rut": "12.345.678-9", "description": "Ingeniero industrial y bioingeniero con experiencia en análisis de datos médicos."}' });
    }

    const adoptionId = uuidv4();
    
    //ToDo: accept previous trainer accepted with 95%.
    const isAccepted = Math.random() < 0.5;

    const adoptionRequest = {
      adoptionId,
      name,
      lastname,
      address,
      rut,
      description,
      status: isAccepted ? 'On Route' : 'Denied',
      createdAt: new Date(),
    };

    await db.collection('adoptionRequests').doc(adoptionId).set(adoptionRequest);

    res.status(201).json({
      message: `Your adoption request has been ${adoptionRequest.status.toLowerCase()}, here is your key to ask the status: ${adoptionId}.`,
      adoptionId,
      status: adoptionRequest.status,
    });
  } catch (error) {
    console.error('Error submitting adoption request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
