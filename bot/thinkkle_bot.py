from collections import defaultdict
from flask import Flask, request, jsonify
from itertools import permutations
import time

app = Flask(__name__)

letter_scores = {
    'A': 1, 
    'B': 4, 
    'C': 2, 
    'D': 2, 
    'E': 1,
    'F': 6,
    'G': 2,
    'H': 4,
    'I': 1,
    'J': 10,
    'K': 6,
    'L': 1,
    'M': 2,
    'N': 1,
    'O': 1,
    'P': 2,
    'Q': 10,
    'R': 1,
    'S': 1,
    'T': 1,
    'U': 2,
    'V': 6,
    'W': 6,
    'X': 10,
    'Y': 4,
    'Z': 8
}

#Trie definition
class Trie:
    __slots__ = ("map", "end")
    def __init__(self) -> None:
        self.map = defaultdict(Trie)
        self.end = False
        
    def insert(self, word:str) -> None:
        node = self
        for letter in word.strip():
            node = node.map[letter]
        node.end = True
        
    def contains(self, word:str, is_word:bool=True) -> bool:
        node = self
        for letter in word:
            if letter not in node.map:
                return False
            else:
                node = node.map[letter]
        return node.end if is_word else node
    
    def display(self, level=0, prefix="") -> None:
        print("  " * level + f"{prefix}")
        for letter, next_node in self.map.items():
            next_node.display(level + 1, letter)
    
    def get_words(self, letters: list, infix: str="") -> list:
        words = set()

        def explore(node, current_word, remaining_letters, infix_index):
            nonlocal words
            if remaining_letters:
                for letter, next_node in node.map.items():
                    
                    if letter in remaining_letters:
                        new_rack = remaining_letters.copy()
                        new_rack.remove(letter)
                        if next_node.end:
                            words.add((current_word + letter, infix_index))
                        explore(next_node, current_word + letter, new_rack, infix_index)
        
        def get_prefixes():
            for r in range(len(letters) + 1):
                combinations = permutations(letters, r)
                for prefix in combinations:
                    prefix = list(prefix)
                    if "#" in prefix:
                        blank_indices = [i for i in range(len(prefix)) if prefix[i] == "#"]
                        blank_letter_combinations = permutations(set("ABCDEFGHIJKLMNOPQRSTUVWYZ"), prefix.count("#"))
                        for blank_letter_tuple in blank_letter_combinations:
                            temp = prefix.copy()
                            for i, idx in enumerate(blank_indices): temp[idx] = blank_letter_tuple[i]
                            yield (prefix, "".join(temp) + infix)
                            
                    else:
                        yield (prefix, "".join(prefix) + infix)
                        
        for prefix, term in get_prefixes():
            suffixes = dictionary.contains(term, False)
            if suffixes:
                remaining_letters = [letter for letter in letters if letter != "#"]
                for letter in prefix:
                    if letter in set(remaining_letters): remaining_letters.remove(letter)
                explore(suffixes, term, remaining_letters, len(prefix))
        
        return list(words)
    
if __name__ == "__main__":
    print("Opening dictionary...")
    dictionary = Trie()
    try:
        start_time = time.time()
        with open("wordlist.txt", "r") as file:
            for line in file: 
                dictionary.insert(line)
        end_time = time.time()
        print(f"Loading time: {round(end_time - start_time, 2)} seconds")
        
    except Exception as e:
        print(f"Error loading file: {e}")
        exit()
        
    #User input
    while (rack := input("Enter your rack:\n"))!= "0":
        rack = list(rack.upper().replace(" ",""))
        if not all([letter in letter_scores for letter in rack]):
            print("Try again (invalid characters)")
            continue
        elif len(rack) > 7:
            print("Try again (rack is too large)")
            continue
        while True:
            infix = input("Enter what the word needs to contain:\n").upper()
            while not all([letter in letter_scores for letter in list(infix)]):
                print("Try again (invalid characters)")
                infix = input("Enter what the word needs to contain:\n")
            words = dictionary.get_words(rack, infix)
            print(sorted(words,key=lambda x: len(x[0])))
            mx = [(0, None, None)]
            for word in words:
                score = 0
                for letter in word[0]:
                    score += letter_scores[letter]
                if score > mx[0][0]:
                    mx = [(score, word[0], word[1])]
                elif score == mx[0][0]:
                    mx.append((score, word[0], word[1]))
            if mx[0][0] != 0:
                print(mx)
                break
            else:
                print("No words found")
            