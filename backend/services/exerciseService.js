import axios from "axios";

const RAPIDAPI_KEY = "2de68a0965msh2718668368fc542p1e9d4cjsn807aba68ed14";

export const fetchExercisesByMuscle = async (muscle) => {
  const response = await axios.get(
    `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${muscle}?limit=10`,
    {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    }
  );
  return response.data;
};