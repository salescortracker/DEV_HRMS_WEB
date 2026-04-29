import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AiService {

   private API_URL = 'https://localhost:44370/api/grok/chat';

  async askAI(message: string): Promise<string> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      console.log("AI RESPONSE:", data); // 🔥 DEBUG

      return data.reply || "No response from AI";

    } catch (error) {
      console.error(error);
      return "❌ AI not working";
    }
  }
}
