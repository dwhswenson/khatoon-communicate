export const mockMessagesByThread: Record<string, any[]> = {
  "thread-001": [
    {
      id: "msg-001",
      sender: "chef",
      original_lang: "fa",
      original_text: "سلام، چی می‌خواهید سفارش بدید؟",
      translations: [
        { lang: "en", text: "Hi, what would you like to order?" }
      ],
      timestamp: "2025-03-24T18:25:00Z"
    },
    {
      id: "msg-002",
      sender: "customer",
      original_lang: "en",
      original_text: "I'd like the chicken stew.",
      translations: [
        { lang: "fa", text: "من خورش مرغ می‌خوام." }
      ],
      timestamp: "2025-03-24T18:26:00Z"
    }
  ],

  "thread-002": [
    {
      id: "msg-101",
      sender: "chef",
      original_lang: "fa",
      original_text: "سفارش شما آماده‌ست.",
      translations: [
        { lang: "en", text: "Your order is ready." }
      ],
      timestamp: "2025-03-24T18:18:00Z"
    }
  ]
};
