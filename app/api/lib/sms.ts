export async function sendSMS(to: string, message: string) {
  const url = "https://api.africastalking.com/version1/messaging";
  
  const body = new URLSearchParams({
    username: process.env.AT_USERNAME!,
    to: to, // Must be in international format (e.g., +256...)
    message: message,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "apiKey": process.env.AT_API_KEY!,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: body.toString()
    });

    // 1. Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SMS API Failed (${response.status}):`, errorText);
      return;
    }

    // 2. Safely parse JSON only if the response is okay
    const data = await response.json();
    console.log("SMS API Success:", data);
    return data;

  } catch (error) {
    console.error("SMS API Connection Error:", error);
  }
}