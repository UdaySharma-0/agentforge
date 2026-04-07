def prompt_based_agent(agent_config, message):
    """
    Simple prompt-based logic (no external AI yet)
    """

    system_prompt = agent_config.get("system_prompt", "")
    tone = agent_config.get("tone", "professional")

    response = f"""
{system_prompt}

Customer says: "{message}"

Reply in a {tone} tone.
"""

    # TEMP intelligent response (mock AI)
    if "fees" in message.lower():
        return "Our fees start from ₹999. Would you like details about our plans?"
    if "contact" in message.lower():
        return "You can contact us at support@careermentor.com."

    return "Thanks for reaching out! How can I assist you further?"
