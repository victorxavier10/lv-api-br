import { PrismaClient } from "@prisma/client"
import { profile } from "console"

const cityClient = new PrismaClient().city
const neighborhoodClient = new PrismaClient().neighborhoods
const stateClient = new PrismaClient().state
const profileLocationClient = new PrismaClient().profileLocation

export const getAllCities = async (req, res) => {
	try {
	  // Fetch all cities with their stateId
	  const cities = await cityClient.findMany({
		select: {
		  id: true,
		  name: true,
		  stateId: true, // Ensure stateId is included
		},
	  });
  
	  // Fetch all states
	  const states = await stateClient.findMany({
		select: {
		  id: true,
		  name: true,
		},
	  });
  
	  // Create a Map of states for quick lookup by stateId
	  const stateMap = new Map();
	  states.forEach((state) => {
		stateMap.set(state.id, state.name);
	  });
  
	  // Merge cities with their state information
	  const citiesWithStateInfo = cities.map((city) => {
		const stateName = stateMap.get(city.stateId);
		return {
		  id: city.id,
		  name: city.name,
		  stateId: city.stateId,
		  stateName: stateName,
		};
	  });
  
	  res.status(200).json({ data: citiesWithStateInfo });
	} catch (error) {
	  console.error('Error fetching cities and states:', error);
	  res.status(500).json({ error: 'Internal Server Error' });
	}
  };
  

export const getCityById = async (req, res) => {
	const { id } = req.params

	try {
		const city = await cityClient.findUnique({
			where: { id: Number(id) }
		})
		res.status(200).json(city)
	} catch (error) {
		res.status(400).json(error)
	}
}

export const getNeighborhoodById = async (req, res) => {
	const { id } = req.params

	try {
		const neighborhood = await neighborhoodClient.findUnique({
			where: { id: Number(id) }
		})
		res.status(200).json(neighborhood)
	} catch (error) {
		res.status(400).json(error)
	}
}

export const getCitiesByStateId = async (req, res) => {
	const { stateId } = req.params

	try {
		const city = await cityClient.findMany({
			where: { stateId: Number(stateId) }
		})
		res.status(200).json({ data: city })
	} catch (error) {
		res.status(400).json(error)
	}
}

export const getProfilesByCityById = async (req, res) => {
	const { id } = req.params

	try {
		const profilesInCity = await profileLocationClient.findMany({
			where: {
				cityId: Number(id),
				profile: {
					verified: true,
				},
			},
			include: {
				profile: {
					include: {
						images: true,
						profileLocation: {
							include: {
								neighborhood: true
							}
						}
					}
				}
			}
		})

		const sortedProfiles = profilesInCity
			.map(item => item.profile)
			.sort((a, b) => b.totalPointsPlans - a.totalPointsPlans);

		res.status(200).json(sortedProfiles);
	} catch (error) {
		res.status(400).json(error)
	}
}

export const getCityByName = async (req, res) => {
	const { name } = req.params
	console.log("AQUIIIIIIIIIIII")
	try {
		const cities = await cityClient.findFirst({
			where: {
				name
			}
		})
		res.status(200).json(cities)
	} catch (error) {
		res.status(400).json(error)
	}
}

export const getCityByContainName = async (req, res) => {
	const { name } = req.params

	try {
		const cities = await cityClient.findMany({
			where: {
				name: {
					contains: name
				}
			}
		})
		res.status(200).json(cities)
	} catch (error) {
		res.status(400).json(error)
	}
}

export const getAllStates = async (req, res) => {
	try {
		const states = await stateClient.findMany({
			select: {
				id: true,
				name: true,
			},
		});
		res.status(200).json({ data: states });
	} catch (error) {
		res.status(400).json(error);
	}
};


export const getStateById = async (req, res) => {
	const { id } = req.params

	try {
		const state = await stateClient.findUnique({
			where: { id: Number(id) }
		})
		res.status(200).json(state)
	} catch (error) {
		res.status(400).json(error)
	}
}

// //Precisa passar o state no arquivo profile
// export const getStateByCityId = async (req, res) => {
// 	const { id } = req.params

// 	try {
// 		const state = await stateClient.findUnique({
// 			where: { id: Number(id) }
// 		})
// 		res.status(200).json(state)
// 	} catch (error) {
// 		res.status(400).json(error)
// 	}
// }

export const getStateByName = async (req, res) => {
	const { name } = req.params

	try {
		const states = await stateClient.findFirst({
			where: {
				name
			}
		})
		res.status(200).json(states)
	} catch (error) {
		res.status(400).json(error)
	}
}

export const getStateByContainName = async (req, res) => {
	const { name } = req.params

	try {
		const states = await stateClient.findMany({
			where: {
				name: {
					contains: name
				}
			}
		})
		res.status(200).json(states)
	} catch (error) {
		res.status(400).json(error)
	}
}
