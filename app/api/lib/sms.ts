export async function sendSMS(to: string, message: string) {
  const body = new URLSearchParams({
    username: process.env.AT_USERNAME!,
    to: to,
    message: message,
    // only include 'from' if you have a registered ID
  });

  await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: { 
      "apiKey": process.env.AT_API_KEY!, 
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
    body: body
  });
}