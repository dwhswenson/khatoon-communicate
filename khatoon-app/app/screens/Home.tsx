import { View, SafeAreaView } from "react-native";
import { ThreadList } from "../components/ThreadList";

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThreadList />
    </SafeAreaView>
  );
}
