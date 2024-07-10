import AsyncStorage from '@react-native-async-storage/async-storage'

const TRIP_STORAGE_KEY = '@planner:tripID'

async function save(tripID: string) {
  try {
    await AsyncStorage.setItem(TRIP_STORAGE_KEY, tripID)
  } catch (error) {
    throw error
  }
}

async function get() {
  try {
    const tripID = await AsyncStorage.getItem(TRIP_STORAGE_KEY)
    return tripID
  } catch (error) {
    throw error
  }
}

async function remove() {
  try {
    await AsyncStorage.removeItem(TRIP_STORAGE_KEY)
  } catch (error) {
    throw error
  }
}

export const tripStorage = { save, get, remove }
