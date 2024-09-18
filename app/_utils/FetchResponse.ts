

interface Message {
    content: string;
  }
  
  export const fetchChatResponse = async (message: Message, signal: AbortSignal) => {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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',
      },
      body: JSON.stringify({
        model: 'microsoft/Phi-3-mini-4k-instruct',
        messages: [{ role: 'user', content: message.content }],
        max_tokens: 500,
        stream: false,
      }),
      signal, 
    });
  
    const data = await response.json();
    return data;
  };
  