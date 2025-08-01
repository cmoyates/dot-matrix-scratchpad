import { View } from "react-native";
import { Text } from "~/components/ui/text";

export default function Screen() {
  return (
    <View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
      <Text>Hello World</Text>
    </View>
  );
}
