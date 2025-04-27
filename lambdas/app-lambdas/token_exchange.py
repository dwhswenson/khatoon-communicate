import os
import json
import requests

COGNITO_DOMAIN = os.environ["COGNITO_DOMAIN"]
CLIENT_ID = os.environ["COGNITO_CLIENT_ID"]

def lambda_handler(event, context):
    print("Event:", event)
    try:
        body = json.loads(event.get("body", "{}"))
        code          = body["code"]
        redirect_uri  = body["redirectUri"]
        code_verifier = body["codeVerifier"]
    except (KeyError, json.JSONDecodeError):
        print("Bad parameters")
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing or invalid parameters"})
        }

    token_url = f"https://{COGNITO_DOMAIN}/oauth2/token"
    payload = {
        "grant_type":    "authorization_code",
        "client_id":     CLIENT_ID,
        "code":          code,
        "redirect_uri":  redirect_uri,
        "code_verifier": code_verifier,
    }
    print("Payload:", payload)

    try:
        resp = requests.post(
            token_url,
            data=payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        resp.raise_for_status()
        tokens = resp.json()
        print("Tokens:", tokens)
    except requests.RequestException as e:
        print("Error:", e)
        return {
            "statusCode": getattr(e.response, "status_code", 500),
            "body": e.response.text if getattr(e, "response", None) else str(e),
            "headers": {"Access-Control-Allow-Origin": "*"}
        }

    return {
        "statusCode": 200,
        "body": json.dumps(tokens),
        "headers": {
            "Access-Control-Allow-Origin":  "*",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    }
