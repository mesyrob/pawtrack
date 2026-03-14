import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Crypto from 'expo-crypto'

const KEY = 'pawtrack_device_id'

let cached: string | null = null

export async function getDeviceId(): Promise<string> {
  if (cached) return cached

  let id = await AsyncStorage.getItem(KEY)
  if (!id) {
    id = Crypto.randomUUID()
    await AsyncStorage.setItem(KEY, id)
  }

  cached = id
  return id
}
