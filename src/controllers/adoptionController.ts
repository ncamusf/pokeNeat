import { Request, Response } from 'express';
import { db } from '../firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { AdoptionRequest } from '../models/adoptionRequest';
import { requestValidator } from './validatorController';

// Submit Adoption Request
export const submitAdoptionRequest = async (req: Request, res: Response) => {
  try {

    const validationResult = await requestValidator(req);
    if (validationResult.error) {
      return res.status(validationResult.status).json({ message: validationResult.error });
    }

    const { name, lastname, address, rut, description, idPokemonchoice} = req.body;

    const isAccepted = await acceptenceMethod(rut);

    const adoptionId = uuidv4();
    const adoptionRequest = {
      adoptionId,
      name,
      lastname,
      address,
      rut,
      description,
      idPokemonchoice,
      status: isAccepted ? 'In Preparation' : 'Denied',
      createdAt: new Date(),
    };

    await db.collection('adoptionRequests').doc(adoptionId).set(adoptionRequest);

    if (isAccepted) {
        await db.collection('pokemons').doc(adoptionRequest.idPokemonchoice).update({
            isAdopted: true,
            ownerRUT: adoptionRequest.rut
        });
        simulatePreparation(adoptionRequest);
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

//Acceptence business logic
const acceptenceMethod = async (rut:string) => {
    const goodTrainerQuery = await db.collection('goodTrainers').where('rut', '==', rut).get();
    if(!goodTrainerQuery.empty){
        return Math.random() < 0.95;
    } else{
        return Math.random() < 0.5;
    }
};

//Preparation simulation (1m delay)
const simulatePreparation = (adoptionRequest: AdoptionRequest) => {
    setTimeout(async () => {
      try {
        await db.collection('adoptionRequests').doc(adoptionRequest.adoptionId).update({
          status: 'On Route',
        });
        simulateTransportation(adoptionRequest);
      } catch (error) {
        console.error('Error during preparation:', error);
      }
    }, 60 * 1000);
};

//Transportation simulation (1m-3m delay)
const simulateTransportation = (adoptionRequest: AdoptionRequest) => {

    const delay = (Math.floor(Math.random() * 3) + 1) * 60 * 1000;

    setTimeout(async () => {
      try {

        const isSuccess = Math.random() < 0.95;
  
        if (isSuccess) {

          await db.collection('adoptionRequests').doc(adoptionRequest.adoptionId).update({
            status: 'Success',
          });
          await saveTrainer(adoptionRequest);
        } else {

          await db.collection('adoptionRequests').doc(adoptionRequest.adoptionId).update({
            status: 'Failure',
          });
          await db.collection('pokemons').doc(adoptionRequest.idPokemonchoice).update({
            isAdopted: false,
            ownerRUT: ""
          });

          await handleTransportationFailure(adoptionRequest.adoptionId);
        }
      } catch (error) {
        console.error('Error during transportation:', error);
      }
    }, delay);
};

//Save success adoption trainer
const saveTrainer = async (adoptionRequest: AdoptionRequest) => {

    const goodTrainerQuery = await db.collection('goodTrainers').where('rut', '==', adoptionRequest.rut).get();

    if (goodTrainerQuery.empty) {
        const goodTrainerId = uuidv4();
        const goodTrainer = {
            goodTrainerId,
            name: adoptionRequest.name,
            lastname: adoptionRequest.lastname,
            address: adoptionRequest.address,
            rut: adoptionRequest.rut,
            description: adoptionRequest.description,
            numberOfPokemonAdopted: 1
        };
        await db.collection('goodTrainers').doc(goodTrainerId).set(goodTrainer);

    } else {
        const goodTrainerId = goodTrainerQuery.docs[0].id;
        await db.collection('goodTrainers').doc(goodTrainerId).update({
            numberOfPokemonAdopted: FieldValue.increment(1),
          });
    }
}

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
