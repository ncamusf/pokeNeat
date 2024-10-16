import express from 'express';
import cors from 'cors';
import adoptionRoutes from './routes/adoptionRoutes';
import pokemonRoutes from './routes/pokemonRoutes';

const app = express();

app.use(cors());
app.use(express.json());



app.use('/adoption', adoptionRoutes);
app.use('/pokemons', pokemonRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});