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
      status: isAccepted ? 'In Preparation' : 'Denied',
      createdAt: new Date(),
    };

    await db.collection('adoptionRequests').doc(adoptionId).set(adoptionRequest);

    if (isAccepted) {
      simulatePreparation(adoptionId);
    }

    res.status(201).json({
      message: `Your adoption request has been ${adoptionRequest.status.toLowerCase()}, remember to save your adoptionId`,
      adoptionId: adoptionId,
      status: adoptionRequest.status,
    });
  } catch (error) {
    console.error('Error submitting adoption request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Preparation simulation (1m delay)
const simulatePreparation = (adoptionId: string) => {
    setTimeout(async () => {
      try {
        await db.collection('adoptionRequests').doc(adoptionId).update({
          status: 'On Route',
        });
        simulateTransportation(adoptionId);
      } catch (error) {
        console.error('Error during preparation:', error);
      }
    }, 60 * 1000);
};

//Transportation simulation (1m-3m delay)
const simulateTransportation = (adoptionId: string) => {

    const delay = (Math.floor(Math.random() * 3) + 1) * 60 * 1000;

    setTimeout(async () => {
      try {

        const isSuccess = Math.random() < 0.95;
  
        if (isSuccess) {

          await db.collection('adoptionRequests').doc(adoptionId).update({
            status: 'Success',
          });
        } else {

          await db.collection('adoptionRequests').doc(adoptionId).update({
            status: 'Failure',
          });

          await handleTransportationFailure(adoptionId);
        }
      } catch (error) {
        console.error('Error during transportation:', error);
      }
    }, delay);
};

//Transportation Failure handler
const handleTransportationFailure = async (adoptionId: string) => {
    try {
      const failureLog = {
        adoptionId,
        timestamp: new Date(),
        message: 'Transportation failed due to wrong address.',
      };
  
      await db.collection('transportationFailures').add(failureLog);

    } catch (error) {
      console.error('Error handling transportation failure:', error);
    }
  };


// Get Adoption Status
export const getAdoptionStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
  
      const doc = await db.collection('adoptionRequests').doc(id).get();
  
      if (!doc.exists) {
        return res.status(404).json({ message: 'Adoption request not found' });
      }
  
      const data = doc.data();
  
      res.status(200).json({ status: data?.status });
    } catch (error) {
      console.error('Error fetching adoption status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
