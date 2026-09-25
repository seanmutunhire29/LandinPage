import argparse
import os
import sys
import json
from pathlib import Path
import subprocess

from openai import OpenAI
# from app.my_custom_tools import *

API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = os.getenv("OPENROUTER_BASE_URL", default="https://openrouter.ai/api/v1")




def tool_call(response):
    tool_calls_arr = response.choices[0].message.tool_calls
    for tool in tool_calls_arr:
        #reading the file
        if tool.type == "function" and tool.function.name == "Read":
            contents = None
            args = json.loads(tool.function.arguments)
            with open(args["file_path"]) as f:
                contents = f.read()
            return contents
        
        #writing to a file
        elif tool.type == "function" and tool.function.name == "Write":
            try:
                args = json.loads(tool.function.arguments)
            except json.JSONDecodeError:
                return "Error: invalid json format provided"
            
            file_path = args.get("file_path")
            file_content = args.get("content")

            if file_path == None or file_content == None:
                return "Empty path or file contents"

            try: 
                path = Path(file_path).resolve()
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(file_content)
                return f"Successfully wrote to {file_path}"
            except Exception as e:
                return f"Error writing file {str(e)}"

        # run bash commands
        elif tool.type == "function" and tool.function.name == "Bash":
            args = json.loads(tool.function.arguments)
            command = args.get("command")
            res = subprocess.run(command,shell=True, capture_output=True, text=True)

            if res.returncode == 0:
                return res.stdout
            else:
                return res.stderr
        
    return "Error: unknown tool call"


def llm_call(client, msg):
    chat = client.chat.completions.create(
        model="anthropic/claude-haiku-4.5",
        messages=msg,
        tools=available_tools
    )
    return chat


available_tools = [
    {
        "type":"function",
        "function": {
            "name": "Read",
            "description": "Read content from a file",
            "parameters": {
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "the path to the file to read"
                    }
                },
                "required": ["file_path"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "Write",
            "description": "Write content to a file",
            "parameters": {
                "type": "object",
                "required": ["file_path", "content"],
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "path to the file to write to"
                    },
                    "content": {
                        "type": "string",
                        "description": "the content to write to the file"
                    }
                }
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "Bash",
            "description": "excute shell commands",
            "parameters": {
                "type": "object",
                "required": ["command"],
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "the command to excute"
                    }
                }
            }
        }
    }
]





def main():
    p = argparse.ArgumentParser()
    p.add_argument("-p", required=True)
    args = p.parse_args()

    if not API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is not set")

    client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

    messages = [{"role": "user", "content": args.p}]
    
    print("Logs from your program will appear here!", file=sys.stderr)


    while True:
        response = llm_call(client, messages)
        messages.append(response.choices[0].message.model_dump(exclude_none=True))

        if not response.choices or len(response.choices) == 0:
            raise RuntimeError("no choices in response!")

        if not response.choices[0].message.tool_calls:
            print(response.choices[0].message.content)
            exit()

        messages.append({ 
            "role": "tool",
            "tool_call_id": response.choices[0].message.tool_calls[0].id,
            "content": tool_call(response) 
            })

if __name__ == "__main__":
    main()
