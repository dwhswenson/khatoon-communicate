import os, json, requests

COGNITO_DOMAIN = os.environ['COGNITO_DOMAIN']
CLIENT_ID      = os.environ['COGNITO_CLIENT_ID']

def lambda_handler(event, context):
    body = json.loads(event.get('body') or "{}")
    refresh_token = body.get("refreshToken")
    payload = {
      "grant_type":    "refresh_token",
      "client_id":     CLIENT_ID,
      "refresh_token": refresh_token,
    }
    token_url = f"https://{COGNITO_DOMAIN}/oauth2/token"
    r = requests.post(token_url, data=payload)
    r.raise_for_status()
    tokens = r.json()
    return {
      "statusCode": 200,
      "body":       json.dumps(tokens),
      "headers":    {"Access-Control-Allow-Origin": "*"}
    }
