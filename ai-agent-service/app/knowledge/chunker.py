def chunk_text(text: str, max_chars: int = 500, overlap_words: int = 50):
    normalized_text = " ".join((text or "").split())
    words = normalized_text.split()
    chunks = []
    
    if not words:
        return []

    start = 0
    while start < len(words):
        current_chunk = []
        char_count = 0
        
        end = start
        while end < len(words):
            word = words[end]
            if char_count + len(word) + 1 > max_chars:
                break
            current_chunk.append(word)
            char_count += len(word) + 1
            end += 1

        chunk = " ".join(current_chunk)
        
        if len(chunk.strip()) > 20:  
            chunks.append(chunk)

        next_start = end - overlap_words
        if next_start <= start:
            start = end
        else:
            start = next_start
            
        if end >= len(words):
            break

    return chunks
