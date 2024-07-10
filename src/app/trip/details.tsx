import { Text, View } from "react-native";

interface DetailsProps {
  tripID: string
}

export function Details({ tripID }: DetailsProps) {
  return (
    <View className="flex-1">
      <Text className="text-white">{tripID}</Text>
    </View>
  )
}
