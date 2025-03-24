import { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { api } from "../services/api";
import { useNavigation } from "@react-navigation/native";

type Thread = {
  id: string;
  title: string;
  last_message_timestamp: string;
};

export const ThreadList = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    api.getThreads().then(setThreads);
  }, []);

  const renderItem = ({ item }: { item: Thread }) => (
    <Pressable
      onPress={() => navigation.navigate("Thread", { threadId: item.id })}
      style={{
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.title}</Text>
      <Text style={{ color: "#666", marginTop: 4 }}>
        {new Date(item.last_message_timestamp).toLocaleString()}
      </Text>
    </Pressable>
  );

  return (
    <FlatList
      data={threads}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  );
};
