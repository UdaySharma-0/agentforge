def rule_based_agent(agent_config, message):
    msg = message.lower()

    rules = agent_config.get("rules", {})

    for keyword, response in rules.items():
        if keyword in msg:
            return response

    return "Thank you for contacting us. How can I help you?"
