import requests

bot_token = '7614629541:Amz'
chat_id = '502'
message = '🚨 Alert: Weapon detected at your home!'

url = f"https://api.telegram.org/bot7614629541:Amz/sendMessage"
payload = {
    'chat_id': chat_id,
    'text': message
}

response = requests.post(url, data=payload)
print("Message sent!" if response.ok else "Failed to send message")

