import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { api } from "../services/api";

// 👤 TEMP: this would be a user setting later
const userPrimaryLang = "en"; // could be 'fa' later

type Message = {
  id: string;
  sender: string;
  original_lang: string;
  original_text: string;
  translations: { lang: string; text: string }[];
  timestamp: string;
};

export default function ThreadView() {
  const route = useRoute();
  const { threadId } = route.params as { threadId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    api.getMessages(threadId).then((data) => {
      setMessages(data);
      setLoading(false);
      scrollToBottom(data.length);
    });
  }, [threadId]);

  const scrollToBottom = (length?: number) => {
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const message = {
      sender: "chef",
      original_lang: "fa",
      original_text: inputText.trim(),
      translations: [
        {
          lang: "en",
          text: "[placeholder translation]",
        },
      ],
      timestamp: new Date().toISOString(),
    };

    await api.sendMessage(threadId, message);
    const updatedMessages = await api.getMessages(threadId);
    setMessages(updatedMessages);
    setInputText("");
    scrollToBottom(updatedMessages.length);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isFarsi = item.original_lang === "fa";
    const isRTL = isFarsi;

    // Primary = the user's preferred language (show that one first)
    const primary =
      item.original_lang === userPrimaryLang
        ? item.original_text
        : item.translations.find((t) => t.lang === userPrimaryLang)?.text;

    const secondary =
      item.original_lang !== userPrimaryLang
        ? item.original_text
        : item.translations.find((t) => t.lang !== userPrimaryLang)?.text;

    const primary_dir = userPrimaryLang === "fa" ? "rtl" : "ltr";
    const secondary_dir = item.original_lang === "fa" ? "rtl" : "ltr";
    const isMachineTranslated = item.original_lang !== userPrimaryLang;

    return (
      <View
        style={[
          styles.messageBubble,
          {
            alignSelf: item.sender === "chef" ? "flex-end" : "flex-start",
          },
          isMachineTranslated && styles.machineBubble,
        ]}
      >
        {primary && (
          <Text dir={primary_dir}
            style={[
              styles.primaryText,
              primary_dir === "rtl" ? styles.farsi : styles.english,
              isMachineTranslated && styles.machineText,
              { marginBottom: secondary ? 4 : 0 },
            ]}
          >
            {primary}
          </Text>
        )}
        {secondary && (
          <Text dir={secondary_dir}
            style={
              [styles.secondaryText, secondary_dir == "rtl" ? styles.farsi : styles.english]
            }>
            {secondary}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message"
            multiline
          />
          <Button title="Send" onPress={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  messageBubble: {
    padding: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: "80%",
  },
  primaryText: {
    fontSize: 16,
    color: "#333",
  },
  secondaryText: {
    fontSize: 14,
    color: "#888",
  },
  farsi: {
    textAlign: "right",
    writingDirection: "rtl",
    fontFamily: "System",
    direction: "rtl",
  },
  english: {
    textAlign: "left",
    writingDirection: "ltr",
    fontFamily: "System",
    direction: "ltr",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 120,
  },
  machineBubble: {
    borderColor: "red",
    borderWidth: 1,
  },
  machineText: {
    color: "red",
    fontStyle: "italic",
  },
  machineLabel: {
    fontSize: 10,
    color: "red",
    textAlign: "right",
    marginTop: 4,
  },

});
